import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  BarChart3,
  Eye,
  Loader2,
  Calendar,
  Download,
  PieChart,
  TrendingUp,
  ArrowLeft,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info
} from "lucide-react";

const App = () => {
  // --- 状態管理（実際のコードと同様） ---
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchFields, setSearchFields] = useState({
    title: true, content: true, answer: true
  });
  const [selectedMaker, setSelectedMaker] = useState("");
  const [selectedYear, setSelectedYear] = useState("すべて");
  const [selectedMonth, setSelectedMonth] = useState("すべて");
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const months = ["すべて", ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [graphType, setGraphType] = useState("bar");
  
  // デモデータ（現実のアプリでは API_URL から取得するデータ）
  const demoData = [
    {
      id: 1,
      題名: "エアコンの電源が入らない",
      機種: "HITACHI RAS-X28L",
      内容: "昨日から急にエアコンの電源が入らなくなりました。リモコンの電池も交換しましたが変わりません。",
      回答: "リモコンの信号が届いていない可能性があります。エアコンの受光部を確認し、障害物がないか確認してください。また、ブレーカーが落ちていないかもご確認ください。",
      問合日時: "2023/10/15",
      rawDate: new Date("2023/10/15"),
      登録市区町村: "浜松市中区"
    },
    {
      id: 2,
      題名: "冷蔵庫の異音について",
      機種: "Panasonic NR-F506XPV",
      内容: "冷蔵庫から「カチカチ」という音が定期的にします。故障でしょうか？",
      回答: "冷蔵庫の「カチカチ」という音は、温度調節のための膨張弁やサーモスタットの動作音である可能性が高く、正常な動作の範囲内です。ただし、音が大きくなったり、頻度が増えた場合は点検をおすすめします。",
      問合日時: "2023/11/20",
      rawDate: new Date("2023/11/20"),
      登録市区町村: "浜松市東区"
    },
    {
      id: 3,
      題名: "洗濯機の水漏れ",
      機種: "SHARP ES-W113",
      内容: "洗濯中に床に水が漏れています。排水ホースは正しく設置されています。",
      回答: "水漏れの原因として、1)給水ホースの接続部のゆるみ、2)パッキンの劣化、3)排水ホース内の詰まりが考えられます。各部分を確認してください。状況が改善しない場合は修理が必要です。",
      問合日時: "2024/01/05",
      rawDate: new Date("2024/01/05"),
      登録市区町村: "浜松市南区"
    },
    {
      id: 4,
      題名: "テレビの映像が乱れる",
      機種: "SONY KJ-43X8500G",
      内容: "先週から映像が時々乱れます。特に雨の日にひどくなります。",
      回答: "アンテナケーブルの接続不良や、アンテナ自体の問題が考えられます。雨の日に悪化するのは、湿気による影響の可能性があります。アンテナケーブルの接続を確認し、それでも改善しない場合はアンテナ設置業者への相談をおすすめします。",
      問合日時: "2024/02/10",
      rawDate: new Date("2024/02/10"),
      登録市区町村: "浜松市北区"
    },
    {
      id: 5,
      題名: "炊飯器が加熱しない",
      機種: "ZOJIRUSHI NP-ZU18",
      内容: "炊飯ボタンを押しても加熱されず、炊飯できません。通電はしています。",
      回答: "内釜が正しくセットされているか確認してください。また、本体底部の温度センサーに汚れや異物が付着していないか確認し、柔らかい布で優しく拭いてください。これで解決しない場合は内部センサーの故障が考えられるため修理が必要です。",
      問合日時: "2024/03/18",
      rawDate: new Date("2024/03/18"),
      登録市区町村: "浜松市西区"
    }
  ];
  
  // ページネーション
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return displayData.slice(start, end);
  }, [displayData, currentPage, itemsPerPage]);

  // 初期データ設定（デモ用）
  useEffect(() => {
    setTimeout(() => {
      setAllData(demoData);
      setDisplayData(demoData);
      const makerSet = new Set();
      demoData.forEach((item) => {
        if (item.機種) {
          const maker = item.機種.split(" ")[0];
          if (maker) makerSet.add(maker);
        }
      });
      const yearSet = new Set();
      demoData.forEach((item) => {
        if (item.rawDate) {
          const year = item.rawDate.getFullYear();
          yearSet.add(year);
        }
      });
      setMakers(Array.from(makerSet).sort());
      setYears(["すべて", ...Array.from(yearSet).sort().reverse().map(String)]);
      setLoading(false);
    }, 1000);
  }, []);

  // --- グラフUI関数 ---
  function renderBarChart(data, valueKey, labelKey, maxBars = 10) {
    if (!data || data.length === 0)
      return <p className="text-center text-gray-500 my-4">データがありません</p>;
    const chartData = data?.slice(0, maxBars);
    const maxValue = Math.max(...chartData.map((item) => item[valueKey]));
    return (
      <div className="mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{item[labelKey]}</span>
              <span className="text-sm font-bold text-gray-700">{item[valueKey]}件</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderPieChart(data, valueKey, labelKey, maxSlices = 6) {
    if (!data || data.length === 0)
      return <p className="text-center text-gray-500 my-4">データがありません</p>;
    const chartData = data?.slice(0, maxSlices);
    const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);
    const colors = [
      "#3b82f6", "#4f46e5", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#2563eb", "#0ea5e9"
    ];
    let startAngle = 0;
    const segments = chartData.map((item, index) => {
      const value = item[valueKey];
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      const endAngle = startAngle + angle;
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      const largeArcFlag = angle > 180 ? 1 : 0;
      const centerX = 50, centerY = 50, radius = 40;
      const startX = centerX + radius * Math.cos(startRad);
      const startY = centerY + radius * Math.sin(startRad);
      const endX = centerX + radius * Math.cos(endRad);
      const endY = centerY + radius * Math.sin(endRad);
      const pathData = [
        `M ${centerX},${centerY}`,
        `L ${startX},${startY}`,
        `A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`,
        "Z"
      ].join(" ");
      startAngle = endAngle;
      return {
        pathData, color: colors[index % colors.length],
        label: item[labelKey], value, percentage: percentage.toFixed(1)
      };
    });
    
    return (
      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-48 h-48 shadow-lg rounded-full bg-white">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="1"
                className="transition-opacity duration-300 hover:opacity-80"
              />
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 p-1 rounded hover:bg-blue-50 transition-colors">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }}></div>
              <span className="text-sm font-medium truncate max-w-[150px]">{segment.label}</span>
              <span className="text-sm font-bold text-blue-700">{segment.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- 詳細モーダル ---
  function DetailModal({ item, onClose, next, prev }) {
    if (!item) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-2 backdrop-blur-sm">
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col"
          style={{minHeight: "480px", maxHeight:"95vh"}}
        >
          <div className="absolute right-0 top-0 p-4 z-50">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50 bg-white shadow-md"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-gray-800">{item.題名}</h3>
            <p className="text-blue-600 text-sm mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">
                {item.機種}
              </span>
              <span className="text-gray-500">|</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {item.問合日時}
              </span>
            </p>
            <div className="mb-4 flex-1 min-h-[80px] max-h-[240px] overflow-auto">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                内容
              </h4>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border-l-4 border-blue-300">
                {item.内容}
              </p>
            </div>
            {item.回答 && (
              <div className="mb-4 max-h-[180px] overflow-auto">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  回答
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.回答 || "");
                    }}
                    title="コピー"
                    className="p-1.5 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                    aria-label="回答をコピー"
                  >
                    <Copy size={14} className="text-blue-700" />
                  </button>
                </h4>
                <p className="text-gray-600 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap border-l-4 border-blue-400">
                  {item.回答}
                </p>
              </div>
            )}
          </div>
          <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50 rounded-b-2xl">
            <button
              onClick={prev}
              className="px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-full hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all duration-200 hover:shadow"
              disabled={!prev}
              aria-label="前のデータを表示"
            >
              <ChevronLeft size={18} /> 前へ
            </button>
            <button
              onClick={next}
              className="px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-full hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all duration-200 hover:shadow"
              disabled={!next}
              aria-label="次のデータを表示"
            >
              次へ <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 分析モーダル ---
  function AnalysisModal({ analysis, graphType, setGraphType, onClose }) {
    if (!analysis) return null;
    
    // デモ用の分析データ
    const demoAnalysis = {
      cities: [
        { city: "浜松市中区", count: 10 },
        { city: "浜松市東区", count: 8 },
        { city: "浜松市西区", count: 6 },
        { city: "浜松市南区", count: 5 },
        { city: "浜松市北区", count: 4 }
      ],
      makers: [
        { maker: "HITACHI", count: 12 },
        { maker: "Panasonic", count: 9 },
        { maker: "SHARP", count: 7 },
        { maker: "SONY", count: 5 },
        { maker: "ZOJIRUSHI", count: 4 }
      ],
      models: [
        { model: "HITACHI RAS-X28L", count: 8 },
        { model: "Panasonic NR-F506XPV", count: 6 },
        { model: "SHARP ES-W113", count: 5 },
        { model: "SONY KJ-43X8500G", count: 4 },
        { model: "ZOJIRUSHI NP-ZU18", count: 3 }
      ]
    };
    
    const analysisData = {
      type: analysis.type || "monthly",
      year: analysis.year || "2024",
      month: analysis.month || "すべて",
      keyword: analysis.keyword || "エアコン",
      ...demoAnalysis
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative overflow-y-auto max-h-[98vh]">
          <div className="absolute right-0 top-0 p-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 border-b pb-4">
              {analysisData.type === "monthly"
                ? `${analysisData.year === "すべて" ? "全年度" : analysisData.year + "年"}${analysisData.month === "すべて" ? "" : analysisData.month + "月"}の月別分析`
                : `「${analysisData.keyword}」キーワード分析`}
            </h2>
            
            <div className="flex gap-3 mb-6 justify-center">
              <button
                onClick={() => setGraphType("bar")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 ${
                  graphType === "bar" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
                aria-pressed={graphType === "bar"}
              >
                <BarChart3 size={18} /> 棒グラフ
              </button>
              <button
                onClick={() => setGraphType("pie")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 ${
                  graphType === "pie" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
                aria-pressed={graphType === "pie"}
              >
                <PieChart size={18} /> 円グラフ
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  地域別集計
                </h3>
                {graphType === "bar"
                  ? renderBarChart(analysisData.cities, "count", "city", 10)
                  : renderPieChart(analysisData.cities, "count", "city", 6)}
              </div>
              <div className="bg-blue-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  メーカー別集計
                </h3>
                {graphType === "bar"
                  ? renderBarChart(analysisData.makers, "count", "maker", 10)
                  : renderPieChart(analysisData.makers, "count", "maker", 6)}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 mt-6 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                機種別集計
              </h3>
              {graphType === "bar"
                ? renderBarChart(analysisData.models, "count", "model", 10)
                : renderPieChart(analysisData.models, "count", "model", 6)}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                aria-label="分析を閉じる"
              >
                分析を閉じる <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ダミー機能（実際のコードでは実装必要） ---
  const executeSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setDisplayData(allData.filter(item => 
        item.題名.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.内容.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.回答.toLowerCase().includes(searchInput.toLowerCase())
      ));
      setLoading(false);
    }, 500);
  };
  
  const resetFilters = () => {
    setSearchInput("");
    setSelectedMaker("");
    setSelectedYear("すべて");
    setSelectedMonth("すべて");
    setDisplayData(allData);
    setCurrentPage(1);
  };
  
  const performMonthlyAnalysis = () => {
    setAnalysis({
      type: "monthly",
      year: selectedYear,
      month: selectedMonth
    });
  };
  
  const performKeywordAnalysis = () => {
    if (!searchInput.trim()) {
      alert("検索キーワードを入力してください");
      return;
    }
    setAnalysis({
      type: "keyword",
      keyword: searchInput
    });
  };
  
  const downloadCSV = () => {
    alert("CSVのダウンロードを開始します");
  };
  
  const handleCheckboxChange = (field) => {
    setSearchFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      executeSearch();
    }
  };

  // --- メインUI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-2 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-1">
            <span className="px-3 py-1 bg-blue-100 rounded-full text-blue-700 font-medium">
              総データ件数: {allData.length}件
            </span>
            <span className="px-3 py-1 bg-blue-100 rounded-full text-blue-700 font-medium">
              表示件数: {displayData.length}件
            </span>
          </p>
        </div>
        
        {/* 検索/フィルタ */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            {/* 検索語 */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="search-input">
                検索語
              </label>
              <div className="relative flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
                  <input
                    id="search-input"
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="キーワードを入力..."
                    disabled={loading}
                    aria-label="検索キーワード"
                  />
                </div>
                <button
                  onClick={executeSearch}
                  disabled={loading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  aria-label="検索を実行"
                >
                  検索
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  { key: "title", label: "題名" },
                  { key: "content", label: "内容" },
                  { key: "answer", label: "回答" }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={searchFields[key]}
                      onChange={() => handleCheckboxChange(key)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      id={`check-${key}`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* メーカー */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="maker-select">
                メーカー
              </label>
              <select
                id="maker-select"
                value={selectedMaker}
                onChange={(e) => setSelectedMaker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-sm"
                disabled={loading}
                aria-label="メーカー選択"
              >
                <option value="">すべて</option>
                {makers.map((maker) => (
                  <option key={maker} value={maker}>
                    {maker}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 年/月 */}
            <div className="md:col-span-1 flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                期間
              </label>
              <div className="flex flex-col gap-2 h-full">
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-sm"
                  aria-label="年選択"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-sm"
                  aria-label="月選択"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month === "すべて" ? "すべて" : `${month}月`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={executeSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="検索を実行"
            >
              <Search size={18} />
              検索実行
            </button>
            <button
              onClick={performKeywordAnalysis}
              disabled={!searchInput.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="キーワード分析を実行"
            >
              <TrendingUp size={18} />
              キーワード分析
            </button>
            <button
              onClick={performMonthlyAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="月別分析を実行"
            >
              <BarChart3 size={18} />
              月別分析
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
              aria-label="条件をリセット"
            >
              <Filter size={18} />
              条件リセット
            </button>
            {displayData.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-md hover:shadow-lg ml-auto"
                aria-label="CSVダウンロード"
              >
                <Download size={18} />
                CSVダウンロード
              </button>
            )}
          </div>
        </div>
        
        {/* 一覧表示 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              問い合わせ一覧 
              <span className="ml-2 px-3 py-0.5 bg-blue-100 rounded-full text-blue-700 text-sm">
                {displayData.length}件
              </span>
            </h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={40} />
              <p className="text-gray-500 font-medium">データを処理中...</p>
            </div>
          ) : displayData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" role="grid" aria-label="問い合わせデータ一覧">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">日付</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">題名</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">機種</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">内容</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24" scope="col">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-4 text-sm text-gray-600">{item.問合日時}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{item.題名}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.機種}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-md truncate">{item.内容}</td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200 text-xs shadow-sm hover:shadow-md"
                            aria-label={`${item.題名}の詳細を表示`}
                          >
                            <Eye size={12} />詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* ページネーション */}
              {pageCount > 1 && (
                <div className="flex items-center justify-center p-4 border-t gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    aria-label="最初のページへ"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    aria-label="前のページへ"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-4 py-1 text-sm bg-blue-100 rounded-full text-blue-800 font-medium">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(pageCount, c + 1))}
                    disabled={currentPage === pageCount}
                    className="p-2 border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    aria-label="次のページへ"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pageCount)}
                    disabled={currentPage === pageCount}
                    className="p-2 border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    aria-label="最後のページへ"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center bg-blue-50">
              <p className="text-gray-500 font-medium">データがありません</p>
              <p className="text-sm text-gray-400 mt-2">検索条件を変更してお試しください</p>
            </div>
          )}
        </div>
        
        {/* 詳細モーダル */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            prev={
              paginatedData.findIndex(i => i.id === selectedItem.id) > 0
                ? () => {
                    const idx = paginatedData.findIndex(i => i.id === selectedItem.id);
                    if (idx > 0) setSelectedItem(paginatedData[idx - 1]);
                  }
                : null
            }
            next={
              paginatedData.findIndex(i => i.id === selectedItem.id) < paginatedData.length - 1
                ? () => {
                    const idx = paginatedData.findIndex(i => i.id === selectedItem.id);
                    if (idx < paginatedData.length - 1) setSelectedItem(paginatedData[idx + 1]);
                  }
                : null
            }
          />
        )}
        
        {/* 分析モーダル */}
        {analysis && (
          <AnalysisModal
            analysis={analysis}
            graphType={graphType}
            setGraphType={setGraphType}
            onClose={() => setAnalysis(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
