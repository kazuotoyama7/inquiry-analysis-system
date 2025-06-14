まず、機種が2行になっていてみづらいから１行表示にして。
つぎに、その右詳細表示ボタンを１行にして
つぎに、検索実行ボタンは削除して

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
  ChevronDown,
  Info,
  CheckCircle
} from "lucide-react";

// --- グラフUI ---
function renderBarChart(data, valueKey, labelKey, maxBars = 10) {
  if (!data || data.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Info className="text-blue-400 mb-2" size={48} />
        <p className="text-center text-blue-700 font-medium">データがありません</p>
      </div>
    );
  const chartData = data.slice(0, maxBars);
  const maxValue = Math.max(...chartData.map((item) => item[valueKey]));
  return (
    <div className="mt-4" role="img" aria-label="棒グラフ">
      {chartData.map((item, index) => (
        <div key={index} className="mb-3 group">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-800 truncate max-w-xs" title={item[labelKey]}>
              {item[labelKey]}
            </span>
            <span className="text-sm font-semibold text-blue-700">{item[valueKey]}件</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out hover:from-blue-600 hover:to-blue-700"
              style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              role="progressbar"
              aria-valuenow={item[valueKey]}
              aria-valuemin="0"
              aria-valuemax={maxValue}
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
      <div className="flex flex-col items-center justify-center h-64">
        <Info className="text-blue-400 mb-2" size={48} />
        <p className="text-center text-blue-700 font-medium">データがありません</p>
      </div>
    );
  const chartData = data.slice(0, maxSlices);
  const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);
  const colors = [
    "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#0891b2", "#0d9488", "#059669", "#16a34a"
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
    <div className="mt-6 flex flex-col items-center" role="img" aria-label="円グラフ">
      <div className="relative w-56 h-56 drop-shadow-lg">
        <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 transition-transform duration-300">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.pathData}
              fill={segment.color}
              stroke="#fff"
              strokeWidth="2"
              className="hover:opacity-90 transition-opacity cursor-pointer"
              role="presentation"
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-sm">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
            <div 
              className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" 
              style={{ backgroundColor: segment.color }}
              role="presentation"
            ></div>
            <span className="text-sm font-medium text-gray-800 truncate" title={segment.label}>
              {segment.label}
            </span>
            <span className="text-sm font-bold text-blue-700 ml-auto">{segment.percentage}%</span>
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4"
      role="dialog"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative flex flex-col"
        style={{minHeight: "480px", maxHeight:"90vh"}}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all z-10"
          aria-label="閉じる"
        >
          <X size={24} />
        </button>
        <div className="p-8 flex-1 flex flex-col">
          <h3 id="modal-title" className="text-2xl font-bold mb-3 text-gray-900">{item.題名}</h3>
          <div className="flex items-center gap-4 text-sm mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              機種: {item.機種}
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <Calendar size={16} />
              {item.問合日時}
            </span>
          </div>
          <div className="mb-6 flex-1 min-h-[80px] max-h-[240px] overflow-auto">
            <h4 className="font-bold text-gray-800 mb-3 text-lg">問い合わせ内容</h4>
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {item.内容}
              </p>
            </div>
          </div>
          {item.回答 && (
            <div className="mb-4 max-h-[180px] overflow-auto">
              <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-3">
                回答内容
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.回答 || "");
                  }}
                  title="回答をコピー"
                  className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all group"
                  aria-label="回答をコピー"
                >
                  <Copy size={18} className="text-blue-600 group-hover:text-blue-700" />
                </button>
              </h4>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.回答}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="border-t px-8 py-5 flex justify-between items-center bg-gray-50 rounded-b-3xl">
          <button
            onClick={prev}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            disabled={!prev}
            aria-label="前の項目"
          >
            <ChevronLeft size={20} />
            前へ
          </button>
          <span className="text-sm text-gray-600 font-medium">
            詳細情報
          </span>
          <button
            onClick={next}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            disabled={!next}
            aria-label="次の項目"
          >
            次へ
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 分析モーダル ---
function AnalysisModal({ analysis, graphType, setGraphType, onClose }) {
  if (!analysis) return null;
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-labelledby="analysis-title"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative overflow-y-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all z-10"
          aria-label="閉じる"
        >
          <X size={24} />
        </button>
        <div className="p-8">
          <h2 id="analysis-title" className="text-3xl font-bold mb-6 text-center text-gray-900">
            {analysis.type === "monthly"
              ? `${analysis.year === "すべて" ? "全年度" : analysis.year + "年"}${analysis.month === "すべて" ? "" : analysis.month + "月"}の月別分析`
              : `「${analysis.keyword}」キーワード分析`}
          </h2>
          <div className="flex gap-2 mb-8 justify-center">
            <button
              onClick={() => setGraphType("bar")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                graphType === "bar" 
                  ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              aria-pressed={graphType === "bar"}
            >
              <BarChart3 size={20} />
              棒グラフ
            </button>
            <button
              onClick={() => setGraphType("pie")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                graphType === "pie" 
                  ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              aria-pressed={graphType === "pie"}
            >
              <PieChart size={20} />
              円グラフ
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                地域別集計
              </h3>
              {graphType === "bar"
                ? renderBarChart(analysis.cities, "count", "city", 10)
                : renderPieChart(analysis.cities, "count", "city", 6)}
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                メーカー別集計
              </h3>
              {graphType === "bar"
                ? renderBarChart(analysis.makers, "count", "maker", 10)
                : renderPieChart(analysis.makers, "count", "maker", 6)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 mt-6 border border-green-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              機種別集計
            </h3>
            {graphType === "bar"
              ? renderBarChart(analysis.models, "count", "model", 10)
              : renderPieChart(analysis.models, "count", "model", 6)}
          </div>
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
    title: true, content: true, answer: true
  });
  const [selectedMaker, setSelectedMaker] = useState("");
  const [selectedYear, setSelectedYear] = useState("すべて");
  const [selectedMonth, setSelectedMonth] = useState("すべて");
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const months = ["すべて", ...Array.from({ length: 12 }, (_, i) => String(i + 1))];

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
        setYears(["すべて", ...Array.from(yearSet).sort().reverse().map(String)]);
        setSelectedYear("すべて");
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
    if (selectedYear && selectedYear !== "すべて") {
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
      title: true, content: true, answer: true
    });
    setSelectedYear("すべて");
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
    if (selectedYear && selectedYear !== "すべて") {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            問い合わせ分析システム
          </h1>
          <div className="flex items-center justify-center gap-6 text-lg">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-gray-700">総データ件数:</span>
              <span className="font-bold text-blue-700">{allData.length}件</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
              <span className="text-gray-700">表示件数:</span>
              <span className="font-bold text-green-700">{displayData.length}件</span>
            </div>
          </div>
        </header>
        
        {/* 検索/フィルタ */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-5xl mx-auto border border-gray-100">
          <h2 className="sr-only">検索とフィルタ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* 検索語 */}
            <div className="lg:col-span-2">
              <label htmlFor="search-input" className="block text-sm font-bold text-gray-800 mb-3">
                検索キーワード
              </label>
              <div className="relative flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                  <input
                    id="search-input"
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-l-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-800 font-medium"
                    placeholder="キーワードを入力..."
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={executeSearch}
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl"
                  aria-label="検索を実行"
                >
                  検索
                </button>
              </div>
              <fieldset className="flex gap-6 mt-3">
                <legend className="sr-only">検索対象</legend>
                {[
                  { key: "title", label: "題名" },
                  { key: "content", label: "内容" },
                  { key: "answer", label: "回答" }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={searchFields[key]}
                      onChange={() => handleCheckboxChange(key)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      aria-label={`${label}を検索対象に含める`}
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>
            
            {/* メーカー */}
            <div>
              <label htmlFor="maker-select" className="block text-sm font-bold text-gray-800 mb-3">
                メーカー
              </label>
              <select
                id="maker-select"
                value={selectedMaker}
                onChange={(e) => setSelectedMaker(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-800 font-medium cursor-pointer"
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
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="year-select" className="block text-sm font-bold text-gray-800 mb-3">年</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-800 font-medium cursor-pointer"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="month-select" className="block text-sm font-bold text-gray-800 mb-3">月</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-800 font-medium cursor-pointer"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month === "すべて" ? "すべて" : month + "月"}
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
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <Search size={20} />
              検索実行
            </button>
            <button
              onClick={performKeywordAnalysis}
              disabled={!searchInput.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <TrendingUp size={20} />
              キーワード分析
            </button>
            <button
              onClick={performMonthlyAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <BarChart3 size={20} />
              月別分析
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 transition-all shadow-lg hover:shadow-xl font-bold"
            >
              <Filter size={20} />
              条件リセット
            </button>
            {displayData.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all shadow-lg hover:shadow-xl font-bold ml-auto"
              >
                <Download size={20} />
                CSVダウンロード
              </button>
            )}
          </div>
        </section>
        
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 max-w-5xl mx-auto" role="alert">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {/* 一覧表示 */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 size={28} />
              問い合わせ一覧
              <span className="ml-auto text-lg bg-white/20 px-4 py-1 rounded-full">
                {displayData.length}件
              </span>
            </h2>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
              <p className="text-gray-600 font-medium text-lg">データを読み込んでいます...</p>
            </div>
          ) : displayData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800">日付</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800">題名</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800">機種</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800">内容</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-6 py-5 text-sm text-gray-700 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {item.問合日時}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-gray-900 max-w-xs truncate" title={item.題名}>
                          {item.題名}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700 font-medium">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {item.機種}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700 max-w-md truncate" title={item.内容}>
                          {item.内容}
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all text-sm font-bold shadow hover:shadow-lg"
                            aria-label={`${item.題名}の詳細を表示`}
                          >
                            <Eye size={16} />
                            詳細表示
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* ページネーション */}
              {pageCount > 1 && (
                <nav className="flex items-center justify-center p-6 border-t gap-2" aria-label="ページネーション">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="最初のページ"
                  >
                    <ChevronLeft size={20} />
                    <ChevronLeft size={20} className="-ml-3" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="前のページ"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-6 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(pageCount, c + 1))}
                    disabled={currentPage === pageCount}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="次のページ"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pageCount)}
                    disabled={currentPage === pageCount}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="最後のページ"
                  >
                    <ChevronRight size={20} />
                    <ChevronRight size={20} className="-ml-3" />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Info className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 font-medium text-lg">表示するデータがありません</p>
              <p className="text-gray-500 mt-2">検索条件を変更してください</p>
            </div>
          )}
        </section>
        
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
