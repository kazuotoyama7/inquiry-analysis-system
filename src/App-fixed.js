import React, { useState, useEffect, useMemo } from 'react';

// 必要なアイコンなど
import { Eye, Copy, X, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Filter } from 'lucide-react';

// --- 検索・フィルター UI ---
function SearchFilterUI({
  searchInput, setSearchInput,
  searchFields, setSearchFields,
  selectedMaker, setSelectedMaker,
  selectedYear, setSelectedYear,
  selectedMonth, setSelectedMonth,
  makers, years, months,
  onSearch, onKeywordAnalysis, onReset
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg px-6 py-6 mb-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">検索語</label>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
            placeholder="キーワードを入力..."
          />
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={searchFields.title} onChange={() => setSearchFields(f => ({ ...f, title: !f.title }))} />
              <span className="text-xs text-gray-800">題名</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={searchFields.content} onChange={() => setSearchFields(f => ({ ...f, content: !f.content }))} />
              <span className="text-xs text-gray-800">内容</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={searchFields.answer} onChange={() => setSearchFields(f => ({ ...f, answer: !f.answer }))} />
              <span className="text-xs text-gray-800">回答</span>
            </label>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">メーカー</label>
            <select value={selectedMaker} onChange={e => setSelectedMaker(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded min-w-[120px]">
              <option value="">すべて</option>
              {makers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">年</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded min-w-[100px]">
              <option value="">すべて</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">月</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded min-w-[70px]">
              <option value="">すべて</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4 md:mt-0">
          <button onClick={onSearch} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
            <Filter size={16} />検索実行
          </button>
          <button onClick={onKeywordAnalysis} className="px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center gap-2">
            <TrendingUp size={16} />キーワード分析
          </button>
          <button onClick={onReset} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 flex items-center gap-2">
            条件リセット
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 詳細モーダル ---
function DetailModal({ item, onClose, onPrev, onNext, disablePrev, disableNext }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="p-6 pb-2 border-b flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">{item.題名}</div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="mr-3">日付: {item.問合日時}</span>
              <span className="mr-3">機種: {item.機種}</span>
              <span>地域: {item.登録市区町村}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl p-2">
            <X size={24} />
          </button>
        </div>
        <div className="px-6 py-4 flex flex-col gap-4" style={{ maxHeight: 320, minHeight: 200, overflowY: 'auto' }}>
          <div>
            <div className="font-semibold text-gray-700 mb-1">問い合わせ内容</div>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">{item.内容}</div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-700">回答</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.回答 || '').then(() => alert('コピーしました'));
                }}
                className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
              >
                <Copy size={14} /> コピー
              </button>
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">{item.回答}</div>
          </div>
        </div>
        <div className="border-t px-6 py-3 flex justify-between items-center bg-gray-50 rounded-b-xl">
          <button
            onClick={onPrev}
            disabled={disablePrev}
            className={`flex items-center gap-1 px-4 py-2 rounded ${disablePrev ? 'bg-gray-300 text-gray-400' : 'bg-gray-500 text-white hover:bg-gray-600'}`}>
            <ChevronLeft size={16} /> 前へ
          </button>
          <button
            onClick={onNext}
            disabled={disableNext}
            className={`flex items-center gap-1 px-4 py-2 rounded ${disableNext ? 'bg-gray-300 text-gray-400' : 'bg-gray-500 text-white hover:bg-gray-600'}`}>
            次へ <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 棒グラフ（シンプル版） ---
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

// --- メイン ---
function App() {
  // 状態定義
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchFields, setSearchFields] = useState({ title: true, content: true, answer: true });
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(Array.from({ length: 12 }, (_, i) => i + 1));

  // 分析（キーワード分析用）
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const [analysisMode, setAnalysisMode] = useState(false);

  // 詳細モーダル
  const [selectedItem, setSelectedItem] = useState(null);

  // API
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // 初回データ取得
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}?action=getData`);
        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) throw new Error('データ取得エラー');
        const formatted = result.data.map((item, i) => ({
          id: i,
          題名: item['題名'] || item['回答題名'] || '未設定',
          機種: item['機種'] || item['Model'] || '不明',
          内容: item['内容'] || item['相談内容'] || '',
          回答: item['回答'] || '',
          問合日時: item['問合日時'] ? new Date(item['問合日時']).toLocaleDateString('ja-JP') : '不明',
          rawDate: item['問合日時'] ? new Date(item['問合日時']) : null,
          Platform: item['Platform'] || '不明',
          登録市区町村: item['登録市区町村'] || '不明',
          ユーザーID: item['ユーザーID'] || '',
          問合種別: item['問合種別'] || '不明'
        }));
        setAllData(formatted);
        setDisplayData(formatted);

        // メーカーリスト・年リスト
        const makerSet = new Set();
        const yearSet = new Set();
        formatted.forEach(d => {
          if (d.機種) makerSet.add(d.機種.split(' ')[0]);
          if (d.rawDate) yearSet.add(d.rawDate.getFullYear());
        });
        setMakers(Array.from(makerSet).sort());
        setYears(Array.from(yearSet).sort((a, b) => b - a));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 検索処理
  function handleSearch() {
    let filtered = allData;
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;

    if (title || content || answer) {
      if (keyword) {
        filtered = filtered.filter(item => {
          let hit = false;
          if (title) hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
          if (content) hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
          if (answer) hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
          return hit;
        });
      }
    }
    // メーカー
    if (selectedMaker) filtered = filtered.filter(d => d.機種 && d.機種.startsWith(selectedMaker));
    // 年月
    if (selectedYear && selectedMonth) {
      filtered = filtered.filter(item => {
        if (!item.rawDate) return false;
        const y = item.rawDate.getFullYear();
        const m = item.rawDate.getMonth() + 1;
        return y === parseInt(selectedYear) && m === parseInt(selectedMonth);
      });
    } else if (selectedYear) {
      filtered = filtered.filter(item => {
        if (!item.rawDate) return false;
        const y = item.rawDate.getFullYear();
        return y === parseInt(selectedYear);
      });
    }
    setDisplayData(filtered);
    setAnalysisMode(false);
    setKeywordAnalysis(null);
  }

  // キーワード分析
  function handleKeywordAnalysis() {
    if (!searchInput.trim()) return alert('検索ワードを入力してください');
    // 条件に合うデータだけで分析
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let data = allData.filter(item => {
      let hit = false;
      if (title) hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
      if (content) hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
      if (answer) hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
      return hit;
    });
    // 年月条件
    if (selectedYear && selectedMonth) {
      data = data.filter(item => {
        if (!item.rawDate) return false;
        const y = item.rawDate.getFullYear();
        const m = item.rawDate.getMonth() + 1;
        return y === parseInt(selectedYear) && m === parseInt(selectedMonth);
      });
    } else if (selectedYear) {
      data = data.filter(item => {
        if (!item.rawDate) return false;
        const y = item.rawDate.getFullYear();
        return y === parseInt(selectedYear);
      });
    }
    // 地域別
    const cityCount = {};
    data.forEach(d => {
      const city = d.登録市区町村 || '不明';
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cityArr = Object.entries(cityCount).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count);
    // メーカー別
    const makerCount = {};
    data.forEach(d => {
      if (d.機種) {
        const maker = d.機種.split(' ')[0];
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    const makerArr = Object.entries(makerCount).map(([maker, count]) => ({ maker, count })).sort((a, b) => b.count - a.count);
    setKeywordAnalysis({
      keyword: searchInput,
      total: data.length,
      cities: cityArr,
      makers: makerArr,
      data
    });
    setAnalysisMode(true);
  }

  // リセット
  function handleReset() {
    setSearchInput('');
    setSelectedMaker('');
    setSelectedYear('');
    setSelectedMonth('');
    setSearchFields({ title: true, content: true, answer: true });
    setDisplayData(allData);
    setAnalysisMode(false);
    setKeywordAnalysis(null);
  }

  // 詳細モーダル移動
  const currentIdx = selectedItem ? displayData.findIndex(d => d.id === selectedItem.id) : -1;
  function prevDetail() { if (currentIdx > 0) setSelectedItem(displayData[currentIdx - 1]); }
  function nextDetail() { if (currentIdx < displayData.length - 1) setSelectedItem(displayData[currentIdx + 1]); }

  // --- レンダリング ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-12">
      <div className="py-6 text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">問い合わせ分析システム</h1>
        <div className="text-sm text-gray-700">
          総データ件数: {allData.length}件 | 表示件数: {displayData.length}件
        </div>
      </div>

      {/* 検索・分析UI */}
      <SearchFilterUI
        searchInput={searchInput} setSearchInput={setSearchInput}
        searchFields={searchFields} setSearchFields={setSearchFields}
        selectedMaker={selectedMaker} setSelectedMaker={setSelectedMaker}
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
        makers={makers} years={years} months={months}
        onSearch={handleSearch}
        onKeywordAnalysis={handleKeywordAnalysis}
        onReset={handleReset}
      />

      {/* 分析結果表示 */}
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
              {renderBarChart(keywordAnalysis.cities, 'count', 'city', 10)}
            </div>
            <div>
              <div className="font-semibold mb-2 text-gray-700">メーカー別</div>
              {renderBarChart(keywordAnalysis.makers, 'count', 'maker', 10)}
            </div>
          </div>
        </div>
      )}

      {/* 一覧 */}
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
                  <td className="py-2 px-3">{item.問合日時}</td>
                  <td className="py-2 px-3">{item.題名}</td>
                  <td className="py-2 px-3">{item.機種}</td>
                  <td className="py-2 px-3 truncate max-w-[320px]">{item.内容}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye size={15} /> 詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayData.length === 0 && (
            <div className="py-6 text-center text-gray-500">データがありません</div>
          )}
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
          disableNext={currentIdx >= displayData.length - 1}
        />
      )}
    </div>
  );
}

export default App;
