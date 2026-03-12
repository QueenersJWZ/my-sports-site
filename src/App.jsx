import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock, MapPin, Activity, Flag, Loader2 } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('nba');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 状态管理：存储数据和加载状态
  const [nbaData, setNbaData] = useState(null);
  const [cslData, setCslData] = useState(null);
  const [f1Data, setF1Data] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 模拟获取真实API数据的过程
  useEffect(() => {
    const fetchSportsData = async () => {
      setLoading(true);
      
      // ==========================================
      // 【重要提示】这里是接入真实 API 的地方！
      // 例如获取NBA数据：
      // const response = await fetch('https://api-nba-v1.p.rapidapi.com/teams?id=2', { headers: { 'X-RapidAPI-Key': '你的密钥' }});
      // const realData = await response.json();
      // ==========================================

      // 为了演示，我们使用 setTimeout 模拟网络延迟 (1.5秒)
      setTimeout(() => {
        setNbaData({
          team: "波士顿凯尔特人",
          record: "48胜 12负 (东部第1)",
          nextGame: { opponent: "丹佛掘金", date: "明天 10:00 AM", location: "波尔体育馆", isHome: false },
          recentGames: [
            { opponent: "金州勇士", result: "胜 140-88", date: "3月4日" },
            { opponent: "达拉斯独行侠", result: "胜 138-110", date: "3月2日" }
          ]
        });

        setCslData({
          team: "山东泰山",
          record: "1胜 1平 0负 (中超第3)",
          nextGame: { opponent: "横滨水手", date: "3月13日 18:00", location: "横滨国际综合竞技场", isHome: false },
          recentGames: [
            { opponent: "北京国安", result: "平 0-0", date: "3月9日" },
            { opponent: "长春亚泰", result: "胜 4-2", date: "3月1日" }
          ]
        });

        setF1Data({
          nextRace: { name: "澳大利亚大奖赛", date: "3月24日 12:00", location: "阿尔伯特公园赛道" },
          driverStandings: [
            { pos: 1, driver: "马克斯·维斯塔潘", team: "红牛", points: 51 },
            { pos: 2, driver: "塞尔吉奥·佩雷兹", team: "红牛", points: 36 }
          ]
        });

        setLoading(false);
      }, 1500);
    };

    fetchSportsData();
    
    // 设置定时器，每 5 分钟自动刷新一次数据 (300000毫秒)
    const interval = setInterval(fetchSportsData, 300000);
    return () => clearInterval(interval);
  }, []);

  // 加载中动画组件
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">正在从服务器获取最新赛事数据...</p>
    </div>
  );

  const renderNBA = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-green-700 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">{nbaData.team}</h2>
          <p className="text-green-100 flex items-center"><Trophy className="w-4 h-4 mr-2" /> 战绩: {nbaData.record}</p>
        </div>
        <div className="hidden md:block text-5xl opacity-50">☘️</div>
      </div>
      {/* 简化的卡片展示 */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800"><Calendar className="w-5 h-5 mr-2 text-green-600" /> 下一场比赛</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold text-lg">{nbaData.team} VS {nbaData.nextGame.opponent}</p>
          <p className="text-gray-600 mt-2 flex items-center"><Clock className="w-4 h-4 mr-2" /> {nbaData.nextGame.date}</p>
        </div>
      </div>
    </div>
  );

  const renderCSL = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-orange-600 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">{cslData.team}</h2>
          <p className="text-orange-100 flex items-center"><Trophy className="w-4 h-4 mr-2" /> 联赛战绩: {cslData.record}</p>
        </div>
        <div className="hidden md:block text-5xl opacity-50">⚽</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800"><Calendar className="w-5 h-5 mr-2 text-orange-600" /> 下一场比赛</h3>
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
          <p className="font-semibold text-lg">{cslData.team} VS {cslData.nextGame.opponent}</p>
          <p className="text-gray-600 mt-2 flex items-center"><Clock className="w-4 h-4 mr-2" /> {cslData.nextGame.date}</p>
        </div>
      </div>
    </div>
  );

  const renderF1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-red-700 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">F1 世界锦标赛</h2>
          <p className="text-red-100 flex items-center"><Flag className="w-4 h-4 mr-2" /> 2024 赛季</p>
        </div>
        <div className="hidden md:block text-5xl opacity-50">🏎️</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800"><Calendar className="w-5 h-5 mr-2 text-red-600" /> 下一站大奖赛</h3>
        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-600">
          <h4 className="text-2xl font-bold text-gray-800">{f1Data.nextRace.name}</h4>
          <p className="text-gray-600 mt-2 flex items-center"><Clock className="w-4 h-4 mr-2" /> {f1Data.nextRace.date}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">我的体育赛事看板</h1>
          </div>
          <div className="mt-4 md:mt-0 text-sm font-mono bg-gray-100 px-4 py-2 rounded-lg text-gray-700 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            {currentTime.toLocaleTimeString('zh-CN')}
          </div>
        </header>

        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('nba')} className={`px-6 py-3 rounded-full font-semibold transition whitespace-nowrap ${activeTab === 'nba' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600'}`}>🏀 凯尔特人</button>
          <button onClick={() => setActiveTab('csl')} className={`px-6 py-3 rounded-full font-semibold transition whitespace-nowrap ${activeTab === 'csl' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-600'}`}>⚽ 山东泰山</button>
          <button onClick={() => setActiveTab('f1')} className={`px-6 py-3 rounded-full font-semibold transition whitespace-nowrap ${activeTab === 'f1' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600'}`}>🏎️ F1 赛事</button>
        </div>

        <main>
          {loading ? <LoadingSpinner /> : (
            <>
              {activeTab === 'nba' && nbaData && renderNBA()}
              {activeTab === 'csl' && cslData && renderCSL()}
              {activeTab === 'f1' && f1Data && renderF1()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;