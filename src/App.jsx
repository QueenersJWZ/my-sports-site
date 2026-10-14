import { useState, useEffect } from 'react';
import './App.css';

// ============================================================
// 工具函数
// ============================================================

/** 格式化为北京时间 (UTC+8) */
function toBeijingTime(dateInput) {
  if (!dateInput) return '时间待定';
  const date = new Date(dateInput);
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** 获取日期范围字符串数组：pastDays 天前 到 futureDays 天后 */
function getDateRange(pastDays = 14, futureDays = 14) {
  const dates = [];
  const today = new Date();
  for (let i = -pastDays; i <= futureDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/** 判断日期是否在范围内 */
function isWithinRange(dateStr, pastDays = 14, futureDays = 14) {
  const target = new Date(dateStr).getTime();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - pastDays);
  const end = new Date(now);
  end.setDate(now.getDate() + futureDays);
  return target >= start.getTime() && target <= end.getTime();
}

// ============================================================
// 主组件
// ============================================================

function App() {
  const [activeTab, setActiveTab] = useState('nba');
  const [loading, setLoading] = useState(true);

  // NBA 数据
  const [nbaAllGames, setNbaAllGames] = useState([]);
  const [nbaMyTeamGames, setNbaMyTeamGames] = useState([]);
  const [nbaStats, setNbaStats] = useState([]);

  // 足球数据
  const [footballMatches, setFootballMatches] = useState([]);
  const [footballStandings, setFootballStandings] = useState([]);

  // F1 数据
  const [f1Grid, setF1Grid] = useState([]);
  const [f1Results, setF1Results] = useState([]);
  const [f1DriverStandings, setF1DriverStandings] = useState([]);
  const [f1TeamStandings, setF1TeamStandings] = useState([]);

  // ============================================================
  // NBA 数据获取 (balldontlie)
  // ============================================================
  useEffect(() => {
    const fetchNbaData = async () => {
      try {
        const apiKey = import.meta.env.VITE_BALLDONTLIE_KEY || '';
        const headers = apiKey ? { Authorization: apiKey } : {};

        // 1. 获取前后 14 天的所有 NBA 比赛
        const dates = getDateRange(14, 14);
        const gamesRes = await fetch(
          `https://api.balldontlie.io/v1/games?dates[]=${dates.join('&dates[]=')}&per_page=100`,
          { headers }
        );
        if (gamesRes.ok) {
          const gamesJson = await gamesRes.json();
          const games = (gamesJson.data || []).map((g) => ({
            id: g.id,
            date: g.date,
            homeTeam: g.home_team.full_name,
            homeScore: g.home_team_score,
            visitorTeam: g.visitor_team.full_name,
            visitorScore: g.visitor_team_score,
            status: g.status,
            datetime: toBeijingTime(g.datetime || g.date),
          }));
          setNbaAllGames(games);

          // 2. 筛选关注球队（凯尔特人 id=2, 开拓者 id=25）
          const myTeams = games.filter(
            (g) =>
              g.homeTeam.includes('Celtics') ||
              g.visitorTeam.includes('Celtics') ||
              g.homeTeam.includes('Trail Blazers') ||
              g.visitorTeam.includes('Trail Blazers')
          );
          setNbaMyTeamGames(myTeams);
        }

        // 3. 获取球员统计（最近比赛）
        const statsRes = await fetch(
          'https://api.balldontlie.io/v1/stats?seasons[]=2025&per_page=20',
          { headers }
        );
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          const stats = (statsJson.data || []).map((s) => ({
            player: s.player?.full_name || '未知球员',
            team: s.team?.full_name || '',
            pts: s.pts,
            reb: s.reb,
            ast: s.ast,
            gameDate: s.game?.date,
          }));
          setNbaStats(stats);
        }
      } catch (err) {
        console.error('NBA 数据获取失败:', err);
      }
    };
    fetchNbaData();
  }, []);

  // ============================================================
  // 足球数据获取 (football-data.org)
  // ============================================================
  useEffect(() => {
    const fetchFootballData = async () => {
      try {
        const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN || '';
        const headers = token ? { 'X-Auth-Token': token } : {};

        // 1. 获取英超比赛（前后14天）
        const today = new Date();
        const dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 14);
        const dateTo = new Date(today);
        dateTo.setDate(today.getDate() + 14);

        const fmt = (d) => d.toISOString().split('T')[0];
        const matchesRes = await fetch(
          `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${fmt(dateFrom)}&dateTo=${fmt(dateTo)}`,
          { headers }
        );
        if (matchesRes.ok) {
          const matchesJson = await matchesRes.json();
          const matches = (matchesJson.matches || []).map((m) => ({
            id: m.id,
            homeTeam: m.homeTeam?.name || '',
            awayTeam: m.awayTeam?.name || '',
            homeScore: m.score?.fullTime?.home,
            awayScore: m.score?.fullTime?.away,
            status: m.status,
            utcDate: m.utcDate,
            beijingTime: toBeijingTime(m.utcDate),
            competition: m.competition?.name || '英超',
          }));
          setFootballMatches(matches);
        }

        // 2. 获取英超积分榜
        const standingsRes = await fetch(
          'https://api.football-data.org/v4/competitions/PL/standings',
          { headers }
        );
        if (standingsRes.ok) {
          const standingsJson = await standingsRes.json();
          const table = standingsJson.standings?.[0]?.table || [];
          setFootballStandings(
            table.map((row) => ({
              position: row.position,
              team: row.team?.name || '',
              played: row.playedGames,
              won: row.won,
              drawn: row.draw,
              lost: row.lost,
              points: row.points,
              goalDifference: row.goalDifference,
            }))
          );
        }
      } catch (err) {
        console.error('足球数据获取失败:', err);
      }
    };
    fetchFootballData();
  }, []);

  // ============================================================
  // F1 数据获取 (OpenF1)
  // ============================================================
  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        // 1. 获取车手积分榜
        const driversRes = await fetch(
          'https://api.openf1.org/v1/championship_drivers?session_key=latest'
        );
        if (driversRes.ok) {
          const drivers = await driversRes.json();
          const seen = new Set();
          const unique = drivers.filter((d) => {
            if (seen.has(d.driver_number)) return false;
            seen.add(d.driver_number);
            return true;
          });
          setF1DriverStandings(
            unique
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .slice(0, 20)
          );
        }

        // 2. 获取车队积分榜
        const teamsRes = await fetch(
          'https://api.openf1.org/v1/championship_teams?session_key=latest'
        );
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          setF1TeamStandings(teams.sort((a, b) => (b.points || 0) - (a.points || 0)));
        }

        // 3. 获取最近的排位赛杆位
        const gridRes = await fetch(
          'https://api.openf1.org/v1/starting_grid?session_key=latest'
        );
        if (gridRes.ok) {
          const grid = await gridRes.json();
          setF1Grid(
            grid
              .sort((a, b) => (a.position || 99) - (b.position || 99))
              .slice(0, 10)
          );
        }

        // 4. 获取最近的正赛结果
        const resultsRes = await fetch(
          'https://api.openf1.org/v1/session_result?session_key=latest'
        );
        if (resultsRes.ok) {
          const results = await resultsRes.json();
          setF1Results(
            results
              .sort((a, b) => (a.position || 99) - (b.position || 99))
              .slice(0, 10)
          );
        }
      } catch (err) {
        console.error('F1 数据获取失败:', err);
      }
    };
    fetchF1Data();
  }, []);

  // ============================================================
  // Loading 控制
  // ============================================================
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🏆 我的体育资讯</h1>
        <p>过去 14 天 · 未来 14 天 | 北京时间</p>
      </header>

      {/* Tab 导航 */}
      <nav className="tabs">
        <button
          className={activeTab === 'nba' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('nba')}
        >
          🏀 NBA
        </button>
        <button
          className={activeTab === 'football' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('football')}
        >
          ⚽ 足球
        </button>
        <button
          className={activeTab === 'f1' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('f1')}
        >
          🏎️ F1
        </button>
      </nav>

      <main className="main">
        {/* ========== NBA 板块 ========== */}
        {activeTab === 'nba' && (
          <div className="tab-content">
            {/* 全部比赛 */}
            <section className="section">
              <h2>📅 全部比赛（前后 14 天）</h2>
              {nbaAllGames.length === 0 ? (
                <p className="empty">暂无比赛数据</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>时间（北京时间）</th>
                        <th>主队</th>
                        <th>比分</th>
                        <th>客队</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nbaAllGames.map((g) => (
                        <tr key={g.id}>
                          <td className="time">{g.datetime}</td>
                          <td>{g.homeTeam}</td>
                          <td className="score">
                            {g.homeScore != null
                              ? `${g.homeScore} - ${g.visitorScore}`
                              : '未开始'}
                          </td>
                          <td>{g.visitorTeam}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 关注球队 */}
            <section className="section">
              <h2>⭐ 关注球队（凯尔特人 / 开拓者）</h2>
              {nbaMyTeamGames.length === 0 ? (
                <p className="empty">暂无关注球队的比赛</p>
              ) : (
                <ul className="game-list">
                  {nbaMyTeamGames.map((g) => (
                    <li key={g.id} className="game-item">
                      <span className="date">{g.datetime}</span>
                      <span className="matchup">
                        {g.homeTeam} vs {g.visitorTeam}
                      </span>
                      <span className="score-badge">
                        {g.homeScore != null
                          ? `${g.homeScore} - ${g.visitorScore}`
                          : '未开始'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 球员统计 */}
            <section className="section">
              <h2>📊 球员数据</h2>
              {nbaStats.length === 0 ? (
                <p className="empty">暂无球员统计数据</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>球员</th>
                        <th>球队</th>
                        <th>得分</th>
                        <th>篮板</th>
                        <th>助攻</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nbaStats.map((s, i) => (
                        <tr key={i}>
                          <td>{s.player}</td>
                          <td>{s.team}</td>
                          <td className="stat">{s.pts}</td>
                          <td className="stat">{s.reb}</td>
                          <td className="stat">{s.ast}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ========== 足球板块 ========== */}
        {activeTab === 'football' && (
          <div className="tab-content">
            {/* 比赛 */}
            <section className="section">
              <h2>⚽ 英超比赛（前后 14 天）</h2>
              {footballMatches.length === 0 ? (
                <p className="empty">暂无比赛数据</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>时间（北京时间）</th>
                        <th>主队</th>
                        <th>比分</th>
                        <th>客队</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {footballMatches.map((m) => (
                        <tr key={m.id}>
                          <td className="time">{m.beijingTime}</td>
                          <td>{m.homeTeam}</td>
                          <td className="score">
                            {m.homeScore != null
                              ? `${m.homeScore} - ${m.awayScore}`
                              : '未开始'}
                          </td>
                          <td>{m.awayTeam}</td>
                          <td>
                            <span
                              className={`status ${
                                m.status === 'FINISHED'
                                  ? 'done'
                                  : m.status === 'IN_PLAY'
                                  ? 'live'
                                  : 'upcoming'
                              }`}
                            >
                              {m.status === 'FINISHED'
                                ? '已结束'
                                : m.status === 'IN_PLAY'
                                ? '进行中'
                                : '未开始'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 积分榜 */}
            <section className="section">
              <h2>🏆 英超积分榜</h2>
              {footballStandings.length === 0 ? (
                <p className="empty">暂无积分榜数据</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>球队</th>
                        <th>场次</th>
                        <th>胜</th>
                        <th>平</th>
                        <th>负</th>
                        <th>净胜球</th>
                        <th>积分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {footballStandings.map((s) => (
                        <tr key={s.position}>
                          <td className="rank">{s.position}</td>
                          <td className="team-name">{s.team}</td>
                          <td>{s.played}</td>
                          <td>{s.won}</td>
                          <td>{s.drawn}</td>
                          <td>{s.lost}</td>
                          <td>{s.goalDifference}</td>
                          <td className="points">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ========== F1 板块 ========== */}
        {activeTab === 'f1' && (
          <div className="tab-content">
            <div className="f1-grid">
              {/* 排位赛 */}
              <section className="section">
                <h2>🏁 排位赛发车顺位</h2>
                {f1Grid.length === 0 ? (
                  <p className="empty">暂无排位赛数据</p>
                ) : (
                  <ul className="f1-list">
                    {f1Grid.map((g) => (
                      <li key={g.driver_number || Math.random()} className="f1-item">
                        <span className="position">P{g.position}</span>
                        <span className="driver-name">
                          车手 #{g.driver_number}
                        </span>
                        <span className="lap-time">
                          {g.lap_duration ? `${g.lap_duration}s` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* 正赛结果 */}
              <section className="section">
                <h2>🏆 正赛结果</h2>
                {f1Results.length === 0 ? (
                  <p className="empty">暂无正赛数据</p>
                ) : (
                  <ul className="f1-list">
                    {f1Results.map((r) => (
                      <li key={r.driver_number || Math.random()} className="f1-item">
                        <span className="position">P{r.position}</span>
                        <span className="driver-name">车手 #{r.driver_number}</span>
                        <span className="status-text">
                          {r.status || '完赛'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* 车手积分 */}
              <section className="section">
                <h2>🏅 车手积分榜</h2>
                {f1DriverStandings.length === 0 ? (
                  <p className="empty">暂无车手积分数据</p>
                ) : (
                  <ul className="f1-list">
                    {f1DriverStandings.map((d, i) => (
                      <li key={d.driver_number || i} className="f1-item">
                        <span className="position">{i + 1}</span>
                        <span className="driver-name">
                          车手 #{d.driver_number}
                        </span>
                        <span className="points-badge">{d.points} 分</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* 车队积分 */}
              <section className="section">
                <h2>🏅 车队积分榜</h2>
                {f1TeamStandings.length === 0 ? (
                  <p className="empty">暂无车队积分数据</p>
                ) : (
                  <ul className="f1-list">
                    {f1TeamStandings.map((t, i) => (
                      <li key={t.team_name || i} className="f1-item">
                        <span className="position">{i + 1}</span>
                        <span className="team-name">
                          {t.team_name || `车队 #${t.team_id}`}
                        </span>
                        <span className="points-badge">{t.points} 分</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          数据来源：balldontlie API · OpenF1 API · football-data.org |
          时间均为北京时间
        </p>
      </footer>
    </div>
  );
}

export default App;
