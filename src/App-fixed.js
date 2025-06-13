import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, BarChart3, Filter } from "lucide-react";
import "./App.css";

// ダミー: import元は実際にはGoogle Apps ScriptのAPI
const API_URL =
  "https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec";

// ========== ヘルパー: 詳細モーダル ==========
function DetailModal({ item, onClose, onPrev, onNext, disablePrev, disableNext }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-base font-bold">{item.題名}</div>
            <div className="text-xs text-gray-500">
              {item.問合日時} | {item.機種}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg font-bold text-lg">×</button>
        </div>
        <div style={{ maxHeight: 320, minHeight: 180, overflowY: "auto" }} className="p-5 border-b">
          <div className="mb-4">
            <div className="font-semibold text-gray-600 mb-1">問い合わせ内容</div>
            <div className="text-gray-800 text-sm whitespace-pre-line">{item.内容 || "（なし）"}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-600 mb-1">回答</div>
            <div className="flex gap-2 items-center">
              <div className="text-gray-800 text-sm whitespace-pre-line">{item.回答 || "（なし）"}</div>
              {item.回答 && (
                <button
                  className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs hover:bg-green-200"
                  onClick={() => {
                    navigator.clipboard.writeText(item.回答);
                  }}
                >
                  コピー
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-t bg-gray-50">
          <button onClick={onPrev} disabled={disablePrev}
            className={`flex-1 py-2 ${disablePrev ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"} font-bold rounded-bl-xl`}>
            前へ
          </button>
          <button onClick={onNext} disabled={disableNext}
            className={`flex-1 py-2 border-l ${disableNext ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"} font-bold rounded-br-xl`}>
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== グラフ描画: 棒グラフ ==========
function renderBarChart(data, valueKey, labelKey, maxBars = 10) {
  if (!data || data.length === 0) return <div className="text-center text-gray-400 py-6">データがありません</div>;
  const chartData = data.slice(0, maxBars);
  const maxValue = Math.max(...chartData.map((d) => d[valueKey]));
  return (
    <div>
      {chartData.map((item, i) => (
        <div key={i} className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-700">{item[labelKey]}</span>
            <span className="text-xs text-gray-500">{item[valueKey]}</span>
          </div>
          <div className="bg-gray-200 rounded h-2">
            <div className="bg-blue-500 rounded h-2" style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== メインUI ==========
function App() {
  // --- 状態管理 ---
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchFields, setSearchFields] = useState({ title: true, content: true, answer: true });
  const [selectedMaker, setSelectedMaker] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(Array.from({ length: 12 }, (_, i) => (i + 1).toString()));
  const [selectedItem, setSelectedItem] = useState(null);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);

  // --- データ取得 ---
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${API_URL}?action=getData`);
      const result = await res.json();
      // データ整形
      const formatted = result.data.map((item, idx) => ({
        id: idx,
        題名: item["題名"] || item["回答題名"] || "",
        機種: item["機種"] || item["Model"] || "",
        内容: item["内容"] || item["相談内容"] || "",
        回答: item["回答"] || "",
        問合日時: item["問合日時"] ? new Date(item["問合日時"]).toLocaleDateString("ja-JP") : "",
        rawDate: item["問合日時"] ? new Date(item["問合日時"]) : null,
        登録市区町村: item["登録市区町村"] || "",
      }));
      setAllData(formatted);
      setDisplayData(formatted);
      // メーカー・年リスト
      setMakers(["すべて", ...Array.from(new Set(formatted.map((d) => (d.機種 || "").split(" ")[0])).filter(Boolean))]);
      setYears(["すべて", ...Array.from(new Set(formatted.filter(d=>d.rawDate).map((d) => d.rawDate.getFullYear()))).sort((a, b) => b - a)]);
    }
    fetchData();
  }, []);

  // --- 検索処理 ---
  function handleSearch() {
    let filtered = [...allData];
    const keyword = searchInput.trim().toLowerCase();
    // 検索フィールド
    if (keyword && (searchFields.title || searchFields.content || searchFields.answer)) {
      filtered = filtered.filter((item) => {
        let hit = false;
        if (searchFields.title) hit ||= (item.題名 || "").toLowerCase().includes(keyword);
        if (searchFields.content) hit ||= (item.内容 || "").toLowerCase().includes(keyword);
        if (searchFields.answer) hit ||= (item.回答 || "").toLowerCase().includes(keyword);
        return hit;
      });
    }
    // メーカー
    if (selectedMaker && selectedMaker !== "すべて") {
      filtered = filtered.filter((item) => item.機種 && item.機種.startsWith(selectedMaker));
    }
    // 年・月
    if (selectedYear && selectedYear !== "すべて") {
      filtered = filtered.filter((item) => item.rawDate && item.rawDate.getFullYear().toString() === selectedYear);
    }
    if (selectedMonth && selectedMonth !== "すべて") {
      filtered = filtered.filter((item) => item.rawDate && (item.rawDate.getMonth() + 1).toString() === selectedMonth);
    }
    setDisplayData(filtered);
    setAnalysisMode(false);
  }

  // --- リセット ---
  function handleReset() {
    setSearchInput("");
    setSelectedMaker("すべて");
    setSelectedYear("すべて");
    setSelectedMonth("すべて");
    setSearchFields({ title: true, content: true, answer: true });
    setDisplayData(allData);
    setAnalysisMode(false);
  }

  // --- キーワード分析 ---
  function handleKeywordAnalysis() {
    if (!searchInput.trim()) return;
    const keyword = searchInput.trim().toLowerCase();
    let keywordData = allData.filter((item) => {
      let hit = false;
      if (searchFields.title) hit ||= (item.題名 || "").toLowerCase().includes(keyword);
      if (searchFields.content) hit ||= (item.内容 || "").toLowerCase().includes(keyword);
      if (searchFields.answer) hit ||= (item.回答 || "").toLowerCase().includes(keyword);
      return hit;
    });
    // 地域
    const cityCount = {};
    keywordData.forEach((item) => {
      const city = item.登録市区町村 || "不明";
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
    // メーカー
    const makerCount = {};
    keywordData.forEach((item) => {
      const maker = item.機種 ? item.機種.split(" ")[0] : "不明";
      makerCount[maker] = (makerCount[maker] || 0) + 1;
    });
    const makers = Object.entries(makerCount)
      .map(([maker, count]) => ({ maker, count }))
      .sort((a, b) => b.count - a.count);
    setKeywordAnalysis({
      keyword: searchInput,
      total: keywordData.length,
      cities,
      makers,
    });
    setAnalysisMode(true);
  }

  // --- 詳細表示のためのインデックス算出 ---
  const currentIdx = useMemo(
    () => (selectedItem ? displayData.findIndex((d) => d.id === selectedItem.id) : -1),
    [selectedItem, displayData]
  );
  const prevDetail = () => {
    if (currentIdx > 0) setSelectedItem(displayData[currentIdx - 1]);
  };
  const nextDetail = () => {
    if (currentIdx < displayData.length - 1) setSelectedItem(displayData[currentIdx + 1]);
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 pb-20">
      <div className="py-8 text-center">
        <div className="text-3xl font-extrabold text-indigo-600 mb-2">問い合わせ分析システム</div>
        <div className="text-sm text-gray-700">
          総データ件数: {allData.length}件 | 表示件数: {displayData.length}件
        </div>
      </div>

      {/* 検索UI */}
      <div className="bg-white max-w-5xl mx-auto rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">検索語</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-3 py-2 text-base focus:ring-blue-500 focus:border-blue-500"
                placeholder="キーワードを入力..."
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="flex gap-4 mt-1">
              {["title", "content", "answer"].map(f => (
                <label key={f} className="flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields[f]}
                    onChange={() => setSearchFields({ ...searchFields, [f]: !searchFields[f] })}
                    className="mr-1 accent-blue-500"
                  />
                  {f === "title" ? "題名" : f === "content" ? "内容" : "回答"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">メーカー</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={selectedMaker}
              onChange={e => setSelectedMaker(e.target.value)}
            >
              {makers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">年</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">月</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              <option value="すべて">すべて</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleSearch}
          >
            <Search size={16} /> 検索実行
          </button>
          <button
            className="flex items-center gap-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={handleKeywordAnalysis}
          >
            <BarChart3 size={16} /> キーワード分析
          </button>
          <button
            className="flex items-center gap-1 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={handleReset}
          >
            <Filter size={16} /> 条件リセット
          </button>
        </div>
      </div>

      {/* 分析モード */}
      {analysisMode && keywordAnalysis && (
        <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto mb-8 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-indigo-500" />
            <h2 className="font-bold text-lg text-indigo-700">「{keywordAnalysis.keyword}」のキーワード分析</h2>
            <span className="text-gray-500 text-sm">({keywordAnalysis.total}件)</span>
            <button onClick={() => setAnalysisMode(false)} className="ml-auto px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300">
              閉じる
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-2 text-gray-700">地域別</div>
              {renderBarChart(keywordAnalysis.cities, "count", "city", 10)}
            </div>
            <div>
              <div className="font-semibold mb-2 text-gray-700">メーカー別</div>
              {renderBarChart(keywordAnalysis.makers, "count", "maker", 10)}
            </div>
          </div>
        </div>
      )}

      {/* 一覧表示 */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="font-bold text-lg mb-3">検索結果（{displayData.length}件）</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-2 px-3 text-left font-semibold">日付</th>
                <th className="py-2 px-3 text-left font-semibold">題名</th>
                <th className="py-2 px-3 text-left font-semibold">機種</th>
                <th className="py-2 px-3 text-left font-semibold">内容</th>
                <th className="py-2 px-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2">{item.問合日時}</td>
                  <td className="px-3 py-2">{item.題名}</td>
                  <td className="px-3 py-2">{item.機種}</td>
                  <td className="px-3 py-2 max-w-xs truncate">{item.内容}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye size={15} />
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">データがありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPrev={prevDetail}
          onNext={nextDetail}
          disablePrev={currentIdx <= 0}
          disableNext={currentIdx === displayData.length - 1}
        />
      )}
    </div>
  );
}

export default App;
