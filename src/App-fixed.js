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
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import "./App.css";

function App() {
  // 状態管理
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState("list");
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    answer: true,
  });
  const [selectedMaker, setSelectedMaker] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(["すべて", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())]);
  const [graphType, setGraphType] = useState("bar");
  const [analysisData, setAnalysisData] = useState(null);

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ダミーデータ or API
  const API_URL =
    "https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec";

  // 初期データ取得
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?action=getData`);
        if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        if (!result.data || !Array.isArray(result.data)) throw new Error("データが見つかりません");

        // 整形
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
          問合種別: item["問合種別"] || "不明",
        }));

        // メーカー・年
        const makerSet = new Set();
        const yearSet = new Set();
        formattedData.forEach((item) => {
          if (item.機種) makerSet.add(item.機種.split(" ")[0]);
          if (item.rawDate) yearSet.add(item.rawDate.getFullYear().toString());
        });

        setAllData(formattedData);
        setDisplayData(formattedData);
        setMakers(["すべて", ...Array.from(makerSet).sort()]);
        setYears(["すべて", ...Array.from(yearSet).sort().reverse()]);

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

  // チェックボックス
  function handleCheckboxChange(field) {
    setSearchFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  // 検索
  function executeSearch() {
    if (loading) return;
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let filtered = [...allData];
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
    if (selectedMaker && selectedMaker !== "すべて") {
      filtered = filtered.filter((item) => item.機種 && item.機種.startsWith(selectedMaker));
    }
    if (selectedYear && selectedYear !== "すべて") {
      filtered = filtered.filter((item) => {
        if (!item.rawDate) return false;
        const itemYear = item.rawDate.getFullYear().toString();
        return itemYear === selectedYear;
      });
    }
    if (selectedMonth && selectedMonth !== "すべて") {
      filtered = filtered.filter((item) => {
        if (!item.rawDate) return false;
        const itemMonth = (item.rawDate.getMonth() + 1).toString();
        return itemMonth === selectedMonth;
      });
    }
    setDisplayData(filtered);
    setSearchApplied(!!keyword || !!selectedMaker || !!selectedYear || !!selectedMonth);
    setCurrentPage(1);
  }

  function handleInputKeyDown(e) {
    if (e.key === "Enter" && !loading) {
      executeSearch();
    }
  }

  // 詳細モーダル
  function DetailModal({ item, onClose, goPrev, goNext }) {
    if (!item) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
          style={{ maxHeight: "90vh" }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-start rounded-t-xl">
            <div>
              <h3 className="text-xl font-bold mb-2">{item.題名}</h3>
              <p className="text-blue-100">機種: {item.機種} | {item.Platform}</p>
              <p className="text-blue-100 text-sm">問合日時: {item.問合日時}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          {/* ↓ 高さ固定、はみ出したらスクロール */}
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ minHeight: 260, maxHeight: 260 }}
          >
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">問い合わせ内容</h4>
              <div className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{item.内容}</div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">回答
                <button
                  className="ml-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1"
                  onClick={() => {
                    navigator.clipboard.writeText(item.回答 || "").then(() => {
                      alert("回答をコピーしました");
                    });
                  }}
                >
                  <Copy size={14} className="inline-block mr-1" /> コピー
                </button>
              </h4>
              <div className="text-gray-600 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">{item.回答}</div>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              ユーザーID: {item.ユーザーID} | 地域: {item.登録市区町村} | 種別: {item.問合種別}
            </div>
          </div>
          {/* フッター（上下固定） */}
          <div className="border-t p-4 bg-gray-50 flex justify-between items-center rounded-b-xl" style={{ minHeight: 60 }}>
            <div />
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={displayData.findIndex((i) => i.id === item.id) <= 0}
              >
                <ChevronLeft size={16} />
                前へ
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={displayData.findIndex((i) => i.id === item.id) >= displayData.length - 1}
              >
                次へ
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ページネーション
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return displayData.slice(start, end);
  }, [displayData, currentPage, itemsPerPage]);

  // 分析・グラフUI
  function renderAnalysisArea() {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setGraphType("bar")}
            className={`px-4 py-2 rounded-md border ${graphType === "bar" ? "bg-blue-500 text-white" : "text-gray-700"}`}
          >棒グラフ</button>
          <button
            onClick={() => setGraphType("pie")}
            className={`px-4 py-2 rounded-md border ${graphType === "pie" ? "bg-blue-500 text-white" : "text-gray-700"}`}
          >円グラフ</button>
        </div>
        <div className="mb-4">グラフ例:（ここにグラフ表示実装可能。必要なら追加します）</div>
      </div>
    );
  }

  // 検索・フィルターUI
  function SearchFilterUI() {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">検索語</label>
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
                  autoFocus
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
              onChange={(e) => setSelectedMaker(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            >
              {makers.map((maker) => (
                <option key={maker} value={maker}>{maker}</option>
              ))}
            </select>
          </div>
          {/* 年 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">年</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* 月 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">月</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
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
            onClick={() => setCurrentView("analysis")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <TrendingUp size={18} />
            キーワード分析
          </button>
          <button
            onClick={() => { setCurrentView("list"); setSearchInput(""); setSelectedMaker("すべて"); setSelectedYear("すべて"); setSelectedMonth("すべて"); setDisplayData(allData); }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
          >
            <Filter size={18} />
            条件リセット
          </button>
        </div>
      </div>
    );
  }

  // メインUI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">
            総データ件数: {allData.length}件 | 表示件数: {displayData.length}件
          </p>
        </div>
        <SearchFilterUI />

        {currentView === "analysis" ? (
          renderAnalysisArea()
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                検索結果 ({displayData.length}件)
              </h2>
            </div>
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
                    <tr key={item.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.問合日時}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{item.題名}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.機種}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{item.内容}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm shadow"
                        >
                          <Eye size={16} />
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
              <div className="flex items-center justify-between p-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">表示件数: </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="p-1 border rounded text-sm"
                  >
                    {[10, 20, 50, 100].map((num) => (
                      <option key={num} value={num}>
                        {num}件
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  <span className="px-4 py-1 text-sm">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(pageCount, c + 1))}
                    disabled={currentPage === pageCount}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setCurrentPage(pageCount)}
                    disabled={currentPage === pageCount}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 詳細モーダル */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            goPrev={() => {
              const idx = displayData.findIndex((i) => i.id === selectedItem.id);
              if (idx > 0) setSelectedItem(displayData[idx - 1]);
            }}
            goNext={() => {
              const idx = displayData.findIndex((i) => i.id === selectedItem.id);
              if (idx < displayData.length - 1) setSelectedItem(displayData[idx + 1]);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
