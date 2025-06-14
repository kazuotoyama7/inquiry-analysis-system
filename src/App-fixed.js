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
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Info
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
            <span
              className="text-sm font-medium text-gray-800 truncate max-w-xs"
              title={item[labelKey]}
            >
              {item[labelKey]}
            </span>
            <span className="text-sm font-semibold text-blue-700">
              {item[valueKey]}件
            </span>
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
    "#2563eb",
    "#4f46e5",
    "#7c3aed",
    "#9333ea",
    "#0891b2",
    "#0d9488",
    "#059669",
    "#16a34a"
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
      "Z"
    ].join(" ");
    startAngle = endAngle;
    return {
      pathData,
      color: colors[index % colors.length],
      label: item[labelKey],
      value,
      percentage: percentage.toFixed(1)
    };
  });
  return (
    <div className="mt-6 flex flex-col items-center" role="img" aria-label="円グラフ">
      <div className="relative w-56 h-56 drop-shadow-lg">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform hover:scale-105 transition-transform duration-300"
        >
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
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div
              className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
              role="presentation"
            ></div>
            <span className="text-sm font-medium text-gray-800 truncate" title={segment.label}>
              {segment.label}
            </span>
            <span className="text-sm font-bold text-blue-700 ml-auto">
              {segment.percentage}%
            </span>
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
        style={{ minHeight: "480px", maxHeight: "90vh" }}
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
          <h3 id="modal-title" className="text-2xl font-bold mb-3 text-gray-900">
            {item.題名}
          </h3>
          <div className="flex items-center gap-4 text-sm mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap">
              機種: {item.機種}
            </span>
            <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
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
          <span className="text-sm text-gray-600 font-medium">詳細情報</span>
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

// --- AnalysisModal は変更なし (省略) ---

function App() {
  /* ----- 状態管理やロジックは元のままなので省略 ----- */

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダーは元のまま */}

        {/* 検索/フィルタ */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-5xl mx-auto border border-gray-100">
          {/* 入力ボックス横の検索ボタンは保持 */}

          {/* ここから下のアクションボタン列 */}
          <div className="flex flex-wrap gap-3 mt-6">
            {/* --- 検索実行ボタンを削除しました --- */}

            <button
              onClick={performKeywordAnalysis}
              disabled={!searchInput.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold whitespace-nowrap"
            >
              <TrendingUp size={20} />
              キーワード分析
            </button>
            <button
              onClick={performMonthlyAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold whitespace-nowrap"
            >
              <BarChart3 size={20} />
              月別分析
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 transition-all shadow-lg hover:shadow-xl font-bold whitespace-nowrap"
            >
              <Filter size={20} />
              条件リセット
            </button>
            {displayData.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all shadow-lg hover:shadow-xl font-bold whitespace-nowrap ml-auto"
              >
                <Download size={20} />
                CSVダウンロード
              </button>
            )}
          </div>
        </section>

        {/* 一覧表示 */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto border border-gray-100">
          {/* テーブルヘッダーなどは変更なし */}
          {loading ? (
            // 省略
            <></>
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
                        <td className="px-6 py-5 text-sm text-gray-700 font-medium whitespace-nowrap max-w-[200px]">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs truncate whitespace-nowrap">
                            {item.機種}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700 max-w-md truncate" title={item.内容}>
                          {item.内容}
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all text-sm font-bold shadow hover:shadow-lg whitespace-nowrap"
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
              {/* ページネーション等は変更なし */}
            </>
          ) : (
            // データなし表示（省略）
            <></>
          )}
        </section>

        {/* モーダル群も元のまま */}
      </div>
    </div>
  );
}

export default App;
