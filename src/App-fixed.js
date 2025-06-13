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
} from "lucide-react";
import "./App.css";

// ---- グラフUI ----
function renderBarChart(data, valueKey, labelKey, maxBars = 10) {
  if (!data || data.length === 0)
    return (
      <p className="text-center text-gray-500 my-4">データがありません</p>
    );
  const chartData = data.slice(0, maxBars);
  const maxValue = Math.max(...chartData.map((item) => item[valueKey]));
  return (
    <div className="mt-4">
      {chartData.map((item, index) => (
        <div key={index} className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
              {item[labelKey]}
            </span>
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
function renderPieChart(data, valueKey, labelKey, maxSlices = 6) {
  if (!data || data.length === 0)
    return (
      <p className="text-center text-gray-500 my-4">データがありません</p>
    );
  const chartData = data.slice(0, maxSlices);
  const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#10b981",
    "#14b8a6",
    "#0ea5e9",
    "#6366f1",
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
    const centerX = 50,
      centerY = 50,
      radius = 40;
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    const pathData = [
      `M ${centerX},${centerY}`,
      `L ${startX},${startY}`,
      `A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`,
      "Z",
    ].join(" ");
    startAngle = endAngle;
    return {
      pathData,
      color: colors[index % colors.length],
      label: item[labelKey],
      value: value,
      percentage: percentage.toFixed(1),
    };
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
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="text-sm truncate max-w-[150px]">
              {segment.label}
            </span>
            <span className="text-sm text-gray-600">
              {segment.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, next, prev }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-2">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 text-2xl z-10"
        >
          <X />
        </button>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{item.題名}</h3>
          <p className="text-blue-600 text-sm mb-2">
            機種: {item.機種} | 日付: {item.問合日時}
          </p>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">内容</h4>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {item.内容}
            </p>
          </div>
          {item.回答 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">回答</h4>
              <p className="text-gray-600 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">
                {item.回答}
              </p>
            </div>
          )}
        </div>
        <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
          <button
            onClick={prev}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
            disabled={!prev}
          >
            前へ
          </button>
          <button
            onClick={next}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
            disabled={!next}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalysisModal({ analysis, graphType, setGraphType, onClose }) {
  if (!analysis) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative overflow-y-auto max-h-[98vh]">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 text-2xl z-10"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-3 mt-6 text-center">
          {analysis.type === "monthly"
            ? `${analysis.year}年${analysis.month === "すべて" ? "" : analysis.month + "月"}の月別分析`
            : `「${analysis.keyword}」キーワード分析`}
        </h2>
        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => setGraphType("bar")}
            className={`px-4 py-2 rounded-md ${
              graphType === "bar"
                ? "bg-blue-500 text-white"
                : "text-gray-700 bg-gray-100"
            }`}
          >
            棒グラフ
          </button>
          <button
            onClick={() => setGraphType("pie")}
            className={`px-4 py-2 rounded-md ${
              graphType === "pie"
                ? "bg-blue-500 text-white"
                : "text-gray-700 bg-gray-100"
            }`}
          >
            円グラフ
          </button>
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
  );
}

function App() {
  // --- 状態管理 ---
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    answer: true,
  });
  const [selectedMaker, setSelectedMaker] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("すべて");
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const months = ["すべて", ...Array.from({ length: 12 }, (_, i) => String(i + 1))];

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return displayData.slice(start, end);
  }, [displayData, currentPage, itemsPerPage]);

  // 詳細モーダル
  const [selectedItem, setSelectedItem] = useState(null);

  // グラフ分析
  const [analysis, setAnalysis] = useState(null);
  const [graphType, setGraphType] = useState("bar");

  // API
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
          登録市区町村: item["登録市区町村"] || "不明",
        }));
        const makerSet = new Set();
        formattedData.forEach((item) => {
          if (item.機種) {
            const maker = item.機種.split(" ")[0];
            if (maker) makerSet.add(maker);
          }
        });
        const yearSet = new Set();
        formattedData.forEach((item) => {
          if (item.rawDate) {
            const year = item.rawDate.getFullYear();
            yearSet.add(year);
          }
        });
        setAllData(formattedData);
        setDisplayData(formattedData);
        setMakers(Array.from(makerSet).sort());
        setYears(Array.from(yearSet).sort().reverse());
        setSelectedYear(String(new Date().getFullYear()));
        setSelectedMonth("すべて");
      } catch (err) {
        setError(`データ取得エラー: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // --- フィルタ処理 ---
  function handleCheckboxChange(field) {
    setSearchFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }
  function executeSearch() {
    if (loading) return;
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let filtered = [...allData];
    // 検索
    if (title || content || answer) {
      if (keyword) {
        filtered = filtered.filter((item) => {
          let hit = false;
          if (title) hit = hit || String(item.題名 || "").toLowerCase().includes(keyword);
          if (content) hit = hit || String(item.内容 || "").toLowerCase().includes(keyword);
          if (answer) hit = hit || String(item.回答 || "").toLowerCase().includes(keyword);
          return hit;
        });
      }
    }
    // メーカ
    if (selectedMaker) {
      filtered = filtered.filter((item) =>
        item.機種 && item.機種.startsWith(selectedMaker)
      );
    }
    // 年
    if (selectedYear) {
      filtered = filtered.filter((item) => {
        if (!item.rawDate) return false;
        const itemYear = item.rawDate.getFullYear();
        return itemYear === parseInt(selectedYear);
      });
    }
    // 月
    if (selectedMonth && selectedMonth !== "すべて") {
      filtered = filtered.filter((item) => {
        if (!item.rawDate) return false;
        const itemMonth = item.rawDate.getMonth() + 1;
        return itemMonth === parseInt(selectedMonth);
      });
    }
    setDisplayData(filtered);
    setCurrentPage(1);
  }
  function handleInputKeyDown(e) {
    if (e.key === "Enter" && !loading) {
      executeSearch();
    }
  }
  function resetFilters() {
    setSearchInput("");
    setSelectedMaker("");
    setSearchFields({
      title: true,
      content: true,
      answer: true,
    });
    setSelectedYear(String(new Date().getFullYear()));
    setSelectedMonth("すべて");
    setDisplayData(allData);
    setCurrentPage(1);
  }

  // --- 分析実行 ---
  function performMonthlyAnalysis() {
    // 現在の絞り込み条件に従う
    let filtered = [...allData];
    // 検索
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    if (title || content || answer) {
      if (keyword) {
        filtered = filtered.filter((item) => {
          let hit = false;
          if (title) hit = hit || String(item.題名 || "").toLowerCase().includes(keyword);
          if (content) hit = hit || String(item.内容 || "").toLowerCase().includes(keyword);
          if (answer) hit = hit || String(item.回答 || "").toLowerCase().includes(keyword);
          return hit;
        });
      }
    }
    // メーカー
    if (selectedMaker) {
      filtered = filtered.filter((item) =>
        item.機種 && item.機種.startsWith(selectedMaker)
      );
    }
    // 年
    if (selectedYear) {
      filtered = filtered.filter((item) => {
        if (!item.rawDate) return false;
        const itemYear = item.rawDate.getFullYear();
        return itemYear === parseInt(selectedYear);
      });
    }
    // 月
    if (selectedMonth && selectedMonth !== "すべて") {
      filtered = filtered.filter((item) => {
        if (!item.rawDate) return false;
        const itemMonth = item.rawDate.getMonth() + 1;
        return itemMonth === parseInt(selectedMonth);
      });
    }

    // 地域
    const cityCount = {};
    filtered.forEach((item) => {
      const city = item.登録市区町村 || "不明";
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    // メーカー
    const makerCount = {};
    filtered.forEach((item) => {
      if (item.機種) {
        const maker = item.機種.split(" ")[0] || "不明";
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    const makers = Object.entries(makerCount)
      .map(([maker, count]) => ({ maker, count }))
      .sort((a, b) => b.count - a.count);

    // 機種
    const modelCount = {};
    filtered.forEach((item) => {
      const model = item.機種 || "不明";
      modelCount[model] = (modelCount[model] || 0) + 1;
    });
    const models = Object.entries(modelCount)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count);

    setAnalysis({
      type: "monthly",
      year: selectedYear,
      month: selectedMonth,
      cities,
      makers,
      models,
    });
    setGraphType("bar");
  }

  // キーワード分析
  function performKeywordAnalysis() {
    if (!searchInput.trim()) {
      alert("検索キーワードを入力してください");
      return;
    }
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let filtered = allData.filter((item) => {
      let hit = false;
      if (title)
        hit = hit || String(item.題名 || "").toLowerCase().includes(keyword);
      if (content)
        hit = hit || String(item.内容 || "").toLowerCase().includes(keyword);
      if (answer)
        hit = hit || String(item.回答 || "").toLowerCase().includes(keyword);
      return hit;
    });
    // 地域
    const cityCount = {};
    filtered.forEach((item) => {
      const city = item.登録市区町村 || "不明";
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
    // メーカー
    const makerCount = {};
    filtered.forEach((item) => {
      if (item.機種) {
        const maker = item.機種.split(" ")[0] || "不明";
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    const makers = Object.entries(makerCount)
      .map(([maker, count]) => ({ maker, count }))
      .sort((a, b) => b.count - a.count);
    // 機種
    const modelCount = {};
    filtered.forEach((item) => {
      const model = item.機種 || "不明";
      modelCount[model] = (modelCount[model] || 0) + 1;
    });
    const models = Object.entries(modelCount)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count);

    setAnalysis({
      type: "keyword",
      keyword: searchInput,
      cities,
      makers,
      models,
    });
    setGraphType("bar");
  }

  // --- CSV ---
  function downloadCSV() {
    const targetData = displayData;
    if (targetData.length === 0) {
      alert("ダウンロードするデータがありません");
      return;
    }
    const headers = ["日付", "題名", "機種", "内容", "回答", "登録市区町村"];
    const rows = targetData.map((item) => [
      item.問合日時 || "",
      item.題名 || "",
      item.機種 || "",
      item.内容 || "",
      item.回答 || "",
      item.登録市区町村 || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    let filename = "問い合わせデータ.csv";
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-2 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">
            総データ件数: {allData.length}件 | 表示件数: {displayData.length}件
          </p>
        </div>
        {/* 検索/フィルタ */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 検索語 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                検索語
              </label>
              <div className="relative flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
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
                {["title", "content", "answer"].map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchFields[key]}
                      onChange={() => handleCheckboxChange(key)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {key === "title" ? "題名" : key === "content" ? "内容" : "回答"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* メーカー */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">メーカー</label>
              <select
                value={selectedMaker}
                onChange={(e) => setSelectedMaker(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
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
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">年</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">月</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month === "すべて" ? "すべて" : month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
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
              disabled={!selectedYear || loading}
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
            {displayData.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm ml-auto"
              >
                <Download size={18} />
                CSVダウンロード
              </button>
            )}
          </div>
        </div>
        {/* 一覧表示 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto">
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
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
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                          >
                            <Eye size={14} />
                            詳細
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
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  <span className="px-4 py-1 text-sm">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(pageCount, c + 1))}
                    disabled={currentPage === pageCount}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setCurrentPage(pageCount)}
                    disabled={currentPage === pageCount}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">データがありません</p>
            </div>
          )}
        </div>
        {/* 詳細モーダル */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            prev={
              () => {
                const idx = displayData.findIndex((i) => i.id === selectedItem.id);
                if (idx > 0) setSelectedItem(displayData[idx - 1]);
              }
            }
            next={
              () => {
                const idx = displayData.findIndex((i) => i.id === selectedItem.id);
                if (idx < displayData.length - 1) setSelectedItem(displayData[idx + 1]);
              }
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
}

export default App;
