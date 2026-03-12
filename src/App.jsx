import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock, Loader2, Activity, MapPin, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nba');

  // 状态数据
  const [nbaData, setNbaData] = useState(null);
  const [cslData, setCslData] = useState(null);
  const [f1Data, setF1Data] = useState(null);

  // 1. 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 获取数据的核心逻辑 (已接入你的真实API，并取消了自动刷新)
  useEffect(() => {
    const fetchSportsData = async () => {
      setLoading(true);
      
      try {
        // ==========================================
        // 【1. 获取 NBA 数据】
        // ==========================================
        try {
          const nbaResponse = await fetch('https://nba-api-free-data.p.rapidapi.com/nba-atlantic-team-list', {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'nba-api-free-data.p.rapidapi.com',
              'x-rapidapi-key': '04a63d4b4amsh34d76e9221bc0c7p100f24jsn7e932263e794'
            }
          });
          const nbaJson = await nbaResponse.json();
          console.log("真实 NBA 数据:", nbaJson); 
        } catch (e) {
          console.error("NBA API请求失败:", e);
        }

        // ==========================================
        // 【2. 获取 足球 数据 (Sofascore)】
        // ==========================================
        try {
          const soccerResponse = await fetch('https://sofascore.p.rapidapi.com/teams/get-last-matches?teamId=38&pageIndex=0', {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'sofascore.p.rapidapi.com',
              'x-rapidapi-key': '04a63d4b4amsh34d76e9221bc0c7p100f24jsn7e932263e794'
            }
          });
          const soccerJson = await soccerResponse.json();
          console.log("真实 足球 数据:", soccerJson);
        } catch (e) {
          console.error("足球 API请求失败:", e);
        }

        // ==========================================
        // 【3. 获取 F1 数据】
        // ==========================================
        try {
          const f1Response = await fetch('https://f1-motorsport-data.p.rapidapi.com/schedule?year=2024', {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'f1-motorsport-data.p.rapidapi.com',
              'x-rapidapi-key': '04a63d4b4amsh34d76e9221bc0c7p100f24jsn7e932263e794'
            }
          });
          const f1Json = await f1Response.json();
          console.log("真实 F1 数据:", f1Json);
        } catch (e) {
          console.error("F1 API请求失败:", e);
        }

        // ==========================================
        // 临时数据填充区 (保证页面正常显示，等你学会解析上面的 Json 后再替换)
        // ==========================================
        setNbaData({
          team: "波士顿凯尔特人",
          record: "50胜 14负 (东部第1)",
          nextGame: { opponent: "丹佛掘金", date: "明天 10:00 AM", location: "波尔体育馆", isHome: false },
          recentGames: [
            { opponent: "金州勇士", result: "胜 140-88", date: "3月4日" },
            { opponent: "达拉斯独行侠", result: "胜 138-110", date: "3月2日" }
          ]
        });

        setCslData({
          team: "山东泰山",
          record: "2胜 1平 0负 (中超第2)",
          nextGame: { opponent: "上海海港", date: "3月18日 19:35", location: "济南奥体中心", isHome: true },
          recentGames: [
            { opponent: "北京国安", result: "平 0-0", date: "3月9日" },
            { opponent: "长春亚泰", result: "胜 4-2", date: "3月1日" }
          ]
        });

        setF1Data({
          season: "2026赛季",
          nextRace: { name: "澳大利亚大奖赛", date: "3月15日 14:00", location: "阿尔伯特公园赛道" },
          driverStandings: [
            { pos: 1, driver: "马克斯·维斯塔潘", team: "红牛", points: 51 },
            { pos: 2, driver: "查尔斯·勒克莱尔", team: "法拉利", points: 47 },
            { pos: 3, driver: "刘易斯·汉密尔顿", team: "法拉利", points: 35 }
          ]
        });

      } catch (error) {
        console.error("获取体育数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSportsData();
    
    // 【重要修改】：删除了 setInterval(fetchSportsData, 300000); 
    // 现在只有在打开网页时才会请求1次，保护你的500次额度！
    
  }, []);

  // 加载中动画组件
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-lg">正在连接体育数据中心...</p>
    </div>
  );

  // 渲染 NBA 模块
  const renderNBA = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">{nbaData.team}</h2>
          <p className="text-green-100 flex items-center text-lg">
            <Trophy className="w-5 h-5 mr-2" /> 战绩: {nbaData.record}
          </p>
        </div>
        <div className="hidden md:block text-6xl opacity-20">🏀</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Calendar className="w-6 h-6 mr-2 text-green-600" /> 下一场比赛
          </h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="font-bold text-xl text-gray-800 mb-2">{nbaData.team} VS {nbaData.nextGame.opponent}</p>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {nbaData.nextGame.date}</p>
              <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {nbaData.nextGame.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Activity className="w-6 h-6 mr-2 text-green-600" /> 近期战况
          </h3>
          <div className="space-y-3">
            {nbaData.recentGames.map((game, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">VS {game.opponent}</p>
                  <p className="text-sm text-gray-500">{game.date}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  game.result.includes('胜') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {game.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // 渲染 足球 模块
  const renderCSL = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">{cslData.team}</h2>
          <p className="text-orange-100 flex items-center text-lg">
            <Trophy className="w-5 h-5 mr-2" /> 战绩: {cslData.record}
          </p>
        </div>
        <div className="hidden md:block text-6xl opacity-20">⚽</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Calendar className="w-6 h-6 mr-2 text-orange-600" /> 下一场比赛
          </h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="font-bold text-xl text-gray-800 mb-2">{cslData.team} VS {cslData.nextGame.opponent}</p>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {cslData.nextGame.date}</p>
              <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {cslData.nextGame.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Activity className="w-6 h-6 mr-2 text-orange-600" /> 近期战况
          </h3>
          <div className="space-y-3">
            {cslData.recentGames.map((game, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">VS {game.opponent}</p>
                  <p className="text-sm text-gray-500">{game.date}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  game.result.includes('胜') ? 'bg-orange-100 text-orange-700' : 
                  game.result.includes('平') ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'
                }`}>
                  {game.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // 渲染 F1 模块
  const renderF1 = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-red-700 to-gray-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">F1 {f1Data.season}</h2>
          <p className="text-red-100 flex items-center text-lg">
            <MapPin className="w-5 h-5 mr-2" /> 下一站: {f1Data.nextRace.name}
          </p>
        </div>
        <div className="hidden md:block text-6xl opacity-20">🏎️</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Calendar className="w-6 h-6 mr-2 text-red-600" /> 赛事预告
          </h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="font-bold text-xl text-gray-800 mb-2">{f1Data.nextRace.name}</p>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {f1Data.nextRace.date}</p>
              <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {f1Data.nextRace.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Medal className="w-6 h-6 mr-2 text-red-600" /> 车手积分榜
          </h3>
          <div className="space-y-3">
            {f1Data.driverStandings.map((driver) => (
              <div key={driver.pos} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${
                    driver.pos === 1 ? 'bg-yellow-100 text-yellow-700' : 
                    driver.pos === 2 ? 'bg-gray-200 text-gray-700' : 
                    driver.pos === 3 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {driver.pos}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">{driver.driver}</p>
                    <p className="text-xs text-gray-500">{driver.team}</p>
                  </div>
                </div>
                <span className="font-bold text-lg text-gray-800">{driver.points} <span className="text-sm font-normal text-gray-500">pts</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-12">
      {/* 顶部导航栏 */}
      <header className="bg-blue-900 text-white py-6 shadow-md">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Activity className="w-8 h-8 mr-3 text-blue-400" />
            <h1 className="text-3xl font-extrabold tracking-tight">我的体育聚合站</h1>
          </div>
          <div className="flex items-center bg-blue-800/50 px-4 py-2 rounded-full border border-blue-700/50">
            <Clock className="w-5 h-5 mr-2 text-blue-300" />
            <span className="font-mono text-lg tracking-wide">
              {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {/* 标签切换栏 */}
        <div className="flex space-x-2 md:space-x-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          {[
            { id: 'nba', name: 'NBA 篮球', icon: '🏀' },
            { id: 'csl', name: '足球赛事', icon: '⚽' },
            { id: 'f1', name: 'F1 赛车', icon: '🏎️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold text-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </div>

        {/* 内容展示区 */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'nba' && nbaData && <div key="nba">{renderNBA()}</div>}
            {activeTab === 'csl' && cslData && <div key="csl">{renderCSL()}</div>}
            {activeTab === 'f1' && f1Data && <div key="f1">{renderF1()}</div>}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}