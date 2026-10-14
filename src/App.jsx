import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [nbaData, setNbaData] = useState(null);
  const [cslData, setCslData] = useState(null);
  const [f1Data, setF1Data] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============ NBA 数据（动态获取）============
  useEffect(() => {
    const fetchNbaData = async () => {
  try {
    const apiKey = import.meta.env.VITE_BALLDONTLIE_KEY || '';
    const headers = apiKey ? { Authorization: apiKey } : {};

    // 1. 计算日期范围：今天和过去6天，总共一周
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 6);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const startDate = formatDate(pastDate);
    const endDate = formatDate(today);

    // 2. 修改 API 请求：使用 dates[] 参数并设置 per_page
    //    dates[] 支持传入一个日期范围，如 dates[]=2025-12-01&dates[]=2025-12-07
    //    这里我们获取过去一周的比赛。如果要看今天的，可以把 dates[] 只设成今天。
    const res = await fetch(
      `https://api.balldontlie.io/v1/games?team_ids[]=2&per_page=25&dates[]=${startDate}&dates[]=${endDate}`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`API 返回错误：${res.status}`);
    }

    const json = await res.json();

    // 3. 处理返回数据（逻辑和之前一样，但确保按日期降序排列）
    const recentGames = (json.data || [])
      .map((game) => {
        const isHome = game.home_team.id === 2;
        const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
        const opponent = isHome
          ? game.visitor_team.full_name
          : game.home_team.full_name;
        const result = teamScore > oppScore ? '胜' : '负';

        return {
          opponent,
          result: `${result} ${teamScore}-${oppScore}`,
          date: new Date(game.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          rawDate: game.date, // 保留原始日期用于排序
        };
      })
      // 按日期从新到旧排序，确保最近的在最上面
      .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    // 4. 计算近期战绩（这里取最近5场）
    const last5 = recentGames.slice(0, 5);
    const wins = last5.filter((g) => g.result.startsWith('胜')).length;
    const losses = last5.length - wins;

    setNbaData({
      team: '波士顿凯尔特人',
      conference: '东部联盟 · 大西洋赛区',
      record: `近 5 场：${wins} 胜 ${losses} 负`,
      recentGames, // 这里把所有获取到的比赛都传过去，前端可以控制显示多少条
    });
  } catch (err) {
    console.error('NBA 数据获取失败:', err);
    setNbaData({
      team: '波士顿凯尔特人',
      conference: '东部联盟 · 大西洋赛区',
      record: '数据暂时无法获取',
      recentGames: [
        { opponent: '迈阿密热火', result: '胜 110-105', date: '—' },
        { opponent: '纽约尼克斯', result: '负 98-102', date: '—' },
      ],
    });
  }
};

    fetchNbaData();
  }, []);

  // ============ 中超数据（暂时静态，等你找到 API 再替换）============
  useEffect(() => {
    setCslData({
      team: '上海海港',
      record: '近 2 场：1 胜 1 平',
      recentGames: [
        { opponent: '北京国安', result: '胜 2-1', date: '2026-03-10' },
        { opponent: '山东泰山', result: '平 1-1', date: '2026-03-05' },
      ],
    });
  }, []);

  // ============ F1 数据（暂时静态）============
  useEffect(() => {
    setF1Data({
      season: '2026 赛季',
      standings: [
        { driver: 'Max Verstappen', team: 'Red Bull Racing', points: 51 },
        { driver: 'Charles Leclerc', team: 'Ferrari', points: 47 },
        { driver: 'Sergio Perez', team: 'Red Bull Racing', points: 36 },
        { driver: 'Lando Norris', team: 'McLaren', points: 33 },
        { driver: 'Carlos Sainz', team: 'Ferrari', points: 28 },
      ],
    });
  }, []);

  // 三个数据都到了才结束 loading
  useEffect(() => {
    if (nbaData && cslData && f1Data) {
      setLoading(false);
    }
  }, [nbaData, cslData, f1Data]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🏆 我的体育资讯</h1>
        <p>实时追踪你关注的球队和赛事</p>
      </header>

      <main className="main">
        {/* NBA */}
        <section className="section">
          <h2>🏀 NBA</h2>
          {nbaData && (
            <div className="card">
              <h3>{nbaData.team}</h3>
              <p className="subtitle">{nbaData.conference}</p>
              <p className="record">{nbaData.record}</p>
              <h4>近期比赛</h4>
              <ul className="games-list">
                {nbaData.recentGames.map((game, idx) => (
                  <li key={idx} className="game-item">
                    <span className="opponent">vs {game.opponent}</span>
                    <span
                      className={`result ${
                        game.result.startsWith('胜') ? 'win' : 'loss'
                      }`}
                    >
                      {game.result}
                    </span>
                    <span className="date">{game.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 中超 */}
        <section className="section">
          <h2>⚽ 中超</h2>
          {cslData && (
            <div className="card">
              <h3>{cslData.team}</h3>
              <p className="record">{cslData.record}</p>
              <h4>近期比赛</h4>
              <ul className="games-list">
                {cslData.recentGames.map((game, idx) => (
                  <li key={idx} className="game-item">
                    <span className="opponent">vs {game.opponent}</span>
                    <span
                      className={`result ${
                        game.result.startsWith('胜') ? 'win' : 'loss'
                      }`}
                    >
                      {game.result}
                    </span>
                    <span className="date">{game.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* F1 */}
        <section className="section">
          <h2>🏎️ F1</h2>
          {f1Data && (
            <div className="card">
              <h3>{f1Data.season} 车手积分榜</h3>
              <ul className="standings-list">
                {f1Data.standings.map((driver, idx) => (
                  <li key={idx} className="standing-item">
                    <span className="rank">#{idx + 1}</span>
                    <span className="driver">{driver.driver}</span>
                    <span className="team">{driver.team}</span>
                    <span className="points">{driver.points} 分</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>数据来源：balldontlie API · 公开数据源</p>
      </footer>
    </div>
  );
}

export default App;
