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

/** 只显示日期（北京时间） */
function toBeijingDate(dateInput) {
  if (!dateInput) return '时间待定';
  const date = new Date(dateInput);
  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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
  const [f1UpcomingMeetings, setF1UpcomingMeetings] = useState([]);
  const [f1CurrentMeeting, setF1CurrentMeeting] = useState(null);

  // ============================================================
  // NBA 数据获取 (balldontlie)
  // ============================================================
  useEffect(() => {
    const fetchNbaData = async () => {
      try {
        const apiKey = import.meta.env.VITE_BALLDONTLIE_KEY || '';
        const headers = apiKey ? { Authorization: apiKey } : {};

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

          const myTeams = games.filter(
            (g) =>
              g.homeTeam.includes('Celtics') ||
              g.visitorTeam.includes('Celtics') ||
              g.homeTeam.includes('Trail Blazers') ||
              g.visitorTeam.includes('Trail Blazers')
          );
          setNbaMyTeamGames(myTeams);
        }

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
  // 免费层包含：英超(PL)、西甲(PD)、中超(CSL) 等
  // ============================================================
  useEffect(() => {
    const fetchFootballData = async () => {
      try {
        const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN || '';
        const headers = token ? { 'X-Auth-Token': token } : {};

        // 免费层支持的联赛：英超 PL、西甲 PD、中超 CSL
        const leagues = [
          { code: 'PL', name: '英超', teams: ['Manchester City FC'], hasStandings: true },
          { code: 'PD', name: '西甲', teams: ['FC Barcelona'], hasStandings: true },
          { code: 'CL', name: '欧冠', teams: ['Manchester City FC', 'FC Barcelona'], hasStandings: false },
        ];

        const allMatches = [];
        const allStandings = [];

        const today = new Date();
        const dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 14);
        const dateTo = new Date(today);
        dateTo.setDate(today.getDate() + 14);
        const fmt = (d) => d.toISOString().split('T')[0];

        for (const league of leagues) {
          try {
            // 1. 获取比赛（前后14天）
            const matchesRes = await fetch(
              `https://api.football-data.org/v4/competitions/${league.code}/matches?dateFrom=${fmt(dateFrom)}&dateTo=${fmt(dateTo)}`,
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
                competition: league.name,
                isMyTeam:
                  league.teams.some((t) => m.homeTeam?.name?.includes(t)) ||
                  league.teams.some((t) => m.awayTeam?.name?.includes(t)),
              }));
              allMatches.push(...matches);
            }

            // 2. 获取积分榜
            const standingsRes = await fetch(
              `https://api.football-data.org/v4/competitions/${league.code}/standings`,
              { headers }
            );
            if (standingsRes.ok) {
              const standingsJson = await standingsRes.json();
              const table = standingsJson.standings?.[0]?.table || [];
              const standings = table.map((row) => ({
                position: row.position,
                team: row.team?.name || '',
                played: row.playedGames,
                won: row.won,
                drawn: row.draw,
                lost: row.lost,
                points: row.points,
                goalDifference: row.goalDifference,
                league: league.name,
                isMyTeam: league.teams.some((t) => row.team?.name?.includes(t)),
              }));
              allStandings.push(...standings);
            }
          } catch (leagueErr) {
            console.warn(`${league.name} 数据获取失败:`, leagueErr);
          }
        }

        allMatches.sort(
          (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        );

        setFootballMatches(allMatches);
        setFootballStandings(allStandings);
      } catch (err) {
        console.error('足球数据获取失败:', err);
      }
    };
    fetchFootballData();
  }, []);

  // ============================================================
  // F1 数据获取 (OpenF1)
  // 免费层：2023年至今历史数据，无需 API Key，限速 3次/秒
  // ============================================================
  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        const currentYear = new Date().getFullYear();

        // 1. 获取当前赛季所有大奖赛（用于查找 meeting 信息和未来赛程）
        const meetingsRes = await fetch(
          `https://api.openf1.org/v1/meetings?year=${currentYear}`
        );
        const meetings = meetingsRes.ok ? await meetingsRes.json() : [];

        const meetingMap = {};
        meetings.forEach((m) => {
          meetingMap[m.meeting_key] = m;
        });

        // 2. 获取最近一个 session 的车手信息（用于 driver_number → 姓名映射）
        const driversRes = await fetch(
          `https://api.openf1.org/v1/drivers?session_key=latest`
        );
        const drivers = driversRes.ok ? await driversRes.json() : [];
        const driverMap = {};
        drivers.forEach((d) => {
          driverMap[d.driver_number] = d.full_name;
        });

        // 3. 获取最近 session 所属的 meeting 信息
        const latestMeetingKey = drivers[0]?.meeting_key;
        if (latestMeetingKey && meetingMap[latestMeetingKey]) {
          setF1CurrentMeeting(meetingMap[latestMeetingKey]);
        }

        // 4. 获取车手积分榜（带车手姓名）
        const driversChampRes = await fetch(
          `https://api.openf1.org/v1/championship_drivers?session_key=latest`
        );
        if (driversChampRes.ok) {
          const driversChamp = await driversChampRes.json();
          const seen = new Set();
          const unique = driversChamp.filter((d) => {
            if (seen.has(d.driver_number)) return false;
            seen.add(d.driver_number);
            return true;
          });
          setF1DriverStandings(
            unique
              .sort((a, b) => (b.points_current || 0) - (a.points_current || 0))
              .slice(0, 20)
              .map((d) => ({
                ...d,
                driverName:
                  driverMap[d.driver_number] || `车手 #${d.driver_number}`,
              }))
          );
        }

        // 5. 获取车队积分榜
        const teamsChampRes = await fetch(
          `https://api.openf1.org/v1/championship_teams?session_key=latest`
        );
        if (teamsChampRes.ok) {
          const teamsChamp = await teamsChampRes.json();
          setF1TeamStandings(
            teamsChamp.sort((a, b) => (b.points_current || 0) - (a.points_current || 0))
          );
        }

        // 6. 获取排位赛发车顺位（带车手姓名）
        const gridRes = await fetch(
          `https://api.openf1.org/v1/starting_grid?session_key=latest`
        );
        if (gridRes.ok) {
          const grid = await gridRes.json();
          setF1Grid(
            grid
              .sort((a, b) => (a.position || 99) - (b.position || 99))
              .slice(0, 10)
              .map((g) => ({
                ...g,
                driverName:
                  driverMap[g.driver_number] || `车手 #${g.driver_number}`,
              }))
          );
        }

        // 7. 获取正赛结果（带车手姓名）
        const resultsRes = await fetch(
          `https://api.openf1.org/v1/session_result?session_key=latest`
        );
        if (resultsRes.ok) {
          const results = await resultsRes.json();
          setF1Results(
            results
              .sort((a, b) => (a.position || 99) - (b.position || 99))
              .slice(0, 10)
              .map((r) => ({
                ...r,
                driverName:
                  driverMap[r.driver_number] || `车手 #${r.driver_number}`,
              }))
          );
        }

        // 8. 计算未来两场大奖赛
        const now = new Date();
        const upcoming = meetings
          .filter((m) => new Date(m.date_start) > now)
          .sort(
            (a, b) =>
              new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
          )
          .slice(0, 2)
          .map((m) => ({
            ...m,
            beijingStart: toBeijingTime(m.date_start),
            beijingEnd: toBeijingTime(m.date_end),
          }));

        if (upcoming.length === 0) {
          // 如果今年没有未来比赛，尝试获取明年的赛程
          const nextYearMeetingsRes = await fetch(
            `https://api.openf1.org/v1/meetings?year=${currentYear + 1}`
          );
          if (nextYearMeetingsRes.ok) {
            const nextYearMeetings = await nextYearMeetingsRes.json();
            const nextUpcoming = nextYearMeetings
              .filter((m) => new Date(m.date_start) > now)
              .sort(
                (a, b) =>
                  new Date(a.date_start).getTime() -
                  new Date(b.date_start).getTime()
              )
              .slice(0, 2)
              .map((m) => ({
                ...m,
                beijingStart: toBeijingTime(m.date_start),
                beijingEnd: toBeijingTime(m.date_end),
              }));
            setF1UpcomingMeetings(nextUpcoming);
          }
        } else {
          setF1UpcomingMeetings(upcoming);
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
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1> Queeners Sports Hub</h1>
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
            <section className="section">
              <h2>⚽ 比赛（英超 / 西甲 / 中超，前后 14 天）</h2>
              {footballMatches.length === 0 ? (
                <p className="empty">暂无比赛数据</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>时间（北京时间）</th>
                        <th>联赛</th>
                        <th>主队</th>
                        <th>比分</th>
                        <th>客队</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {footballMatches.map((m) => (
                        <tr
                          key={m.id}
                          className={m.isMyTeam ? 'my-team-row' : ''}
                        >
                          <td className="time">{m.beijingTime}</td>
                          <td>
                            <span className="league-badge">
                              {m.competition}
                            </span>
                          </td>
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

            <section className="section">
              <h2>🏆 积分榜</h2>
              {footballStandings.length === 0 ? (
                <p className="empty">暂无积分榜数据</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>联赛</th>
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
                      {footballStandings.map((s, i) => (
                        <tr
                          key={i}
                          className={s.isMyTeam ? 'my-team-row' : ''}
                        >
                          <td>
                            <span className="league-badge">
                              {s.league}
                            </span>
                          </td>
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
            {/* 当前大奖赛信息 */}
            {f1CurrentMeeting && (
              <section className="section meeting-banner">
                <h2>
                  🏁 {f1CurrentMeeting.meeting_official_name ||
                    f1CurrentMeeting.meeting_name}
                </h2>
                <p className="meeting-meta">
                  {f1CurrentMeeting.location} ·{' '}
                  {toBeijingDate(f1CurrentMeeting.date_start)} 至{' '}
                  {toBeijingDate(f1CurrentMeeting.date_end)}
                </p>
              </section>
            )}

            {/* 未来两场大奖赛 */}
            {f1UpcomingMeetings.length > 0 && (
              <section className="section">
                <h2>📅 未来赛程</h2>
                <ul className="f1-list">
                  {f1UpcomingMeetings.map((m) => (
                    <li key={m.meeting_key} className="f1-item">
                      <span className="meeting-name">
                        {m.meeting_official_name || m.meeting_name}
                      </span>
                      <span className="meeting-time">
                        {toBeijingDate(m.date_start)} 起
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="f1-grid">
              {/* 排位赛 */}
              <section className="section">
                <h2>🏁 排位赛发车顺位</h2>
                {f1Grid.length === 0 ? (
                  <p className="empty">暂无排位赛数据</p>
                ) : (
                  <ul className="f1-list">
                    {f1Grid.map((g) => (
                      <li
                        key={g.driver_number || Math.random()}
                        className="f1-item"
                      >
                        <span className="position">P{g.position}</span>
                        <span className="driver-name">{g.driverName}</span>
                        <span className="lap-time">
                          {g.lap_duration ? `${g.lap_duration.toFixed(3)}s` : ''}
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
                      <li
                        key={r.driver_number || Math.random()}
                        className="f1-item"
                      >
                        <span className="position">P{r.position}</span>
                        <span className="driver-name">{r.driverName}</span>
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
                      <li
                        key={d.driver_number || i}
                        className="f1-item"
                      >
                        <span className="position">{i + 1}</span>
                        <span className="driver-name">{d.driverName}</span>
                        <span className="points-badge">
                          {d.points_current ?? 0} 分
                        </span>
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
                        <span className="points-badge">
                          {t.points_current ?? 0} 分
                        </span>
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
