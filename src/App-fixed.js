import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  BarChart3,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Calendar,
  Download,
  PieChart,
  TrendingUp
} from "lucide-react";
import "./App.css";

// === シンプルな円グラフ・棒グラフ描画関数 ===
function renderBarChart(data, valueKey, labelKey, maxBars = 10) {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 my-4">データがありません</p>;
  const chartData = data.slice(0, maxBars);
  const maxValue = Math.max(...chartData.map(item => item[valueKey]));
  return (
    <div className="mt-4">
      {chartData.map((item, index) => (
        <div key={index} className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{item[labelKey]}</span>
            <span className="text-sm text-gray-600">{item[valueKey]}件</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
function renderPieChart(data, valueKey, labelKey, maxSlices = 5) {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 my-4">データがありません</p>;
  const chartData = data.slice(0, maxSlices);
  const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981"];
  let startAngle = 0;
  const segments = chartData.map((item, index) => {
    const value = item[valueKey];
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
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
    const segment = {
      pathData,
      color: colors[index % colors.length],
      label: item[labelKey],
      value: value,
      percentage: percentage.toFixed(1)
    };
    startAngle = endAngle;
    return segment;
  });
  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.pathData}
              fill={segment.color}
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
            <span className="text-sm truncate max-w-[120px]">{segment.label}</span>
            <span className="text-sm text-gray-600">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// === アプリ本体 ===
function App() {
  // --- 状態管理 ---
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchFields, setSearchFields] = useState({ title: true, content: true, answer: true });
  const [selectedMaker, setSelectedMaker] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(Array.from({ length: 12 }, (_, i) => i + 1));
  const [analysis, setAnalysis] = useState(null);
  const [graphType, setGraphType] = useState("bar");
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const API_URL = "https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec";

  // --- 初期データ取得 ---
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?action=getData`);
        if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        if (!result.data || !Array.isArray(result.data)) throw new Error("データが見つかりません");

        const formattedData = result.data.map((item, index) => ({
          id: index,
          題名: item["題名"] || item["回答題名"] || "未設定",
          機種: item["機種"] || item["Model"] || "不明",
          内容: item["内容"] || item["相談内容"] || "",
          回答: item["回答"] || "",
          問合日時: item["問合日時"] ? new Date(item["問合日時"]).toLocaleDateString("ja-JP") : "不明",
          rawDate: item["問合日時"] ? new Date(item["問合日時"]) : null,
          Platform: item["Platform"] || "不明",
          登録市区町村: item["登録市区町村"] || "不明",
          ユーザーID: item["ユーザーID"] || "",
          問合種別: item["問合種別"] || "不明"
        }));

        // メーカー一覧を抽出
        const makerSet = new Set();
        formattedData.forEach(item => {
          if (item.機種) {
            const maker = item.機種.split(" ")[0];
            if (maker) makerSet.add(maker);
          }
        });

        // 年の一覧を抽出
        const yearSet = new Set();
        formattedData.forEach(item => {
          if (item.rawDate) {
            const year = item.rawDate.getFullYear();
            yearSet.add(year);
          }
        });

        setAllData(formattedData);
        setDisplayData(formattedData);
        setMakers(Array.from(makerSet).sort());
        setYears(Array.from(yearSet).sort().reverse());

        // デフォルトで今年
        const currentDate = new Date();
        setSelectedYear(currentDate.getFullYear().toString());
      } catch (err) {
        setError(`データ取得エラー: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // --- 検索・フィルタ ---
  function handleCheckboxChange(field) {
    setSearchFields(prev => ({ ...prev, [field]: !prev[field] }));
  }
  function executeSearch() {
    if (loading) return;
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let filtered = [...allData];
    if (title || content || answer) {
      if (keyword) {
        filtered = filtered.filter(item => {
          let hit = false;
          if (title) hit = hit || String(item.題名 || "").toLowerCase().includes(keyword);
          if (content) hit = hit || String(item.内容 || "").toLowerCase().includes(keyword);
          if (answer) hit = hit || String(item.回答 || "").toLowerCase().includes(keyword);
          return hit;
        });
      }
    }
    if (selectedMaker) {
      filtered = filtered.filter(item =>
        item.機種 && item.機種.startsWith(selectedMaker)
      );
    }
    if (selectedYear && selectedMonth) {
      filtered = filtered.filter(item => {
        if (!item.rawDate) return false;
        const itemYear = item.rawDate.getFullYear();
        const itemMonth = item.rawDate.getMonth() + 1;
        return itemYear === parseInt(selectedYear) && itemMonth === parseInt(selectedMonth);
      });
    } else if (selectedYear) {
      filtered = filtered.filter(item => {
        if (!item.rawDate) return false;
        const itemYear = item.rawDate.getFullYear();
        return itemYear === parseInt(selectedYear);
      });
    }
    setDisplayData(filtered);
    setCurrentPage(1);
  }
  function handleInputKeyDown(e) {
    if (e.key === "Enter" && !loading) executeSearch();
  }
  function resetFilters() {
    setSearchInput("");
    setSelectedMaker("");
    setSearchFields({ title: true, content: true, answer: true });
    setSelectedYear("");
    setSelectedMonth("");
    setDisplayData(allData);
    setCurrentPage(1);
  }

  // --- 月別分析 ---
  function performMonthlyAnalysis() {
    if (!selectedYear || !selectedMonth) {
      alert("年と月を選択してください");
      return;
    }
    const targetYear = parseInt(selectedYear);
    const targetMonth = parseInt(selectedMonth);
    const monthData = allData.filter(item => {
      if (!item.rawDate) return false;
      const itemYear = item.rawDate.getFullYear();
      const itemMonth = item.rawDate.getMonth() + 1;
      return itemYear === targetYear && itemMonth === targetMonth;
    });
    // 地域別集計
    const cityCount = {};
    monthData.forEach(item => {
      const city = item.登録市区町村 || "不明";
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
    // 機種別集計
    const modelCount = {};
    monthData.forEach(item => {
      const model = item.機種 || "不明";
      modelCount[model] = (modelCount[model] || 0) + 1;
    });
    const models = Object.entries(modelCount)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count);
    // メーカー別集計
    const makerCount = {};
    monthData.forEach(item => {
      if (item.機種) {
        const maker = item.機種.split(" ")[0] || "不明";
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    const makerData = Object.entries(makerCount)
      .map(([maker, count]) => ({ maker, count }))
      .sort((a, b) => b.count - a.count);
    setAnalysis({
      type: "monthly",
      year: selectedYear,
      month: selectedMonth,
      total: monthData.length,
      cities,
      models,
      makers: makerData,
      data: monthData
    });
  }

  // --- キーワード分析 ---
  function performKeywordAnalysis() {
    if (!searchInput.trim()) {
      alert("検索キーワードを入力してください");
      return;
    }
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let keywordData = allData.filter(item => {
      let hit = false;
      if (title) hit = hit || String(item.題名 || "").toLowerCase().includes(keyword);
      if (content) hit = hit || String(item.内容 || "").toLowerCase().includes(keyword);
      if (answer) hit = hit || String(item.回答 || "").toLowerCase().includes(keyword);
      return hit;
    });
    // 地域別集計
    const cityCount = {};
    keywordData.forEach(item => {
      const city = item.登録市区町村 || "不明";
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
    // メーカー別集計
    const makerCount = {};
    keywordData.forEach(item => {
      if (item.機種) {
        const maker = item.機種.split(" ")[0] || "不明";
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    const makerData = Object.entries(makerCount)
      .map(([maker, count]) => ({ maker, count }))
      .sort((a, b) => b.count - a.count);
    // 機種別集計
    const modelCount = {};
    keywordData.forEach(item => {
      const model = item.機種 || "不明";
      modelCount[model] = (modelCount[model] || 0) + 1;
    });
    const models = Object.entries(modelCount)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setAnalysis({
      type: "keyword",
      keyword: searchInput,
      total: keywordData.length,
      cities,
      models,
      makers: makerData,
      data: keywordData
    });
  }

  // --- CSVダウンロード ---
  function downloadCSV() {
    const targetData = displayData;
    if (targetData.length === 0) {
      alert("ダウンロードするデータがありません");
      return;
    }
    const headers = ["日付", "題名", "機種", "内容", "回答", "Platform", "登録市区町村", "ユーザーID", "問合種別"];
    const rows = targetData.map(item => [
      item.問合日時 || "",
      item.題名 || "",
      item.機種 || "",
      item.内容 || "",
      item.回答 || "",
      item.Platform || "",
      item.登録市区町村 || "",
      item.ユーザーID || "",
      item.問合種別 || ""
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    let filename = "問い合わせデータ";
    filename += ".csv";
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- ページネーション ---
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return displayData.slice(start, end);
  }, [displayData, currentPage, itemsPerPage]);
  function changePage(newPage) {
    if (newPage >= 1 && newPage <= pageCount) setCurrentPage(newPage);
  }

  // --- 年月の動的制御 ---
  const selectableMonths = selectedYear
    ? months
    : [];

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">
            総データ件数: {allData.length}件 | 表示件数: {displayData.length}件
          </p>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 検索語 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">検索語</label>
              <div className="relative flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="キーワードを入力..."
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={executeSearch}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  検索
                </button>
              </div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields.title}
                    onChange={() => handleCheckboxChange("title")}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">題名</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields.content}
                    onChange={() => handleCheckboxChange("content")}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">内容</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields.answer}
                    onChange={() => handleCheckboxChange("answer")}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">回答</span>
                </label>
              </div>
            </div>
            {/* メーカー */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">メーカー</label>
              <select
                value={selectedMaker}
                onChange={e => setSelectedMaker(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="">すべて</option>
                {makers.map(maker => (
                  <option key={maker} value={maker}>{maker}</option>
                ))}
              </select>
            </div>
            {/* 年月 */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">年</label>
                <select
                  value={selectedYear}
                  onChange={e => {
                    setSelectedYear(e.target.value);
                    setSelectedMonth("");
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">すべて</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">月</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={!selectedYear}
                >
                  <option value="">すべて</option>
                  {selectableMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* アクションボタン */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={executeSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={18} />
              検索実行
            </button>
            <button
              onClick={performKeywordAnalysis}
              disabled={!searchInput.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingUp size={18} />
              キーワード分析
            </button>
            <button
              onClick={performMonthlyAnalysis}
              disabled={!selectedYear || !selectedMonth || loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart3 size={18} />
              月別分析
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
            >
              <Filter size={18} />
              条件リセット
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm ml-auto"
            >
              <Download size={18} />
              CSVダウンロード
            </button>
          </div>
        </div>

        {/* === グラフ分析モーダル === */}
        {analysis && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl relative">
              <button
                onClick={() => setAnalysis(null)}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 text-2xl"
              >×</button>
              <h2 className="text-2xl font-bold mb-3 text-center">
                {analysis.type === "monthly"
                  ? `${analysis.year}年${analysis.month}月の月別分析`
                  : `「${analysis.keyword}」キーワード分析`}
              </h2>
              <div className="flex gap-3 mb-6 justify-center">
                <button onClick={() => setGraphType("bar")}
                  className={`px-4 py-2 rounded-md ${graphType === "bar" ? "bg-blue-500 text-white" : "text-gray-700 bg-gray-100"}`}>棒グラフ</button>
                <button onClick={() => setGraphType("pie")}
                  className={`px-4 py-2 rounded-md ${graphType === "pie" ? "bg-blue-500 text-white" : "text-gray-700 bg-gray-100"}`}>円グラフ</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">地域別集計</h3>
                  {graphType === "bar"
                    ? renderBarChart(analysis.cities, "count", "city", 10)
                    : renderPieChart(analysis.cities, "count", "city", 6)}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">メーカー別集計</h3>
                  {graphType === "bar"
                    ? renderBarChart(analysis.makers, "count", "maker", 10)
                    : renderPieChart(analysis.makers, "count", "maker", 6)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">機種別集計</h3>
                {graphType === "bar"
                  ? renderBarChart(analysis.models, "count", "model", 10)
                  : renderPieChart(analysis.models, "count", "model", 6)}
              </div>
            </div>
          </div>
        )}

        {/* === メインテーブル === */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              問い合わせ一覧 ({displayData.length}件)
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
              <p className="text-gray-500">データを処理中...</p>
            </div>
          ) : displayData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">題名</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">機種</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr key={item.id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.問合日時}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{item.題名}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.機種}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-md truncate">{item.内容}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageCount > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">表示件数: </span>
                    <select
                      value={itemsPerPage}
                      onChange={e => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="p-1 border rounded text-sm"
                    >
                      {[10, 20, 50, 100].map(num => (
                        <option key={num} value={num}>{num}件</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changePage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">&laquo;</button>
                    <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">&lt;</button>
                    <span className="px-4 py-1 text-sm">
                      {currentPage} / {pageCount}
                    </span>
                    <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === pageCount} className="px-3 py-1 border rounded text-sm disabled:opacity-50">&gt;</button>
                    <button onClick={() => changePage(pageCount)} disabled={currentPage === pageCount} className="px-3 py-1 border rounded text-sm disabled:opacity-50">&raquo;</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">検索条件に一致するデータが見つかりませんでした</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                検索条件をリセット
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
