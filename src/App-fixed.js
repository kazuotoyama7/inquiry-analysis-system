import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BarChart3, Eye, ChevronLeft, ChevronRight, Copy, Loader2, Calendar, Download, PieChart, TrendingUp, ArrowLeft } from 'lucide-react';
import './App.css';

// --- グラフ描画関数 ---
function renderLineChart(data, valueKey = 'count', labelKey = 'date') {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 my-4">データがありません</p>;
  const maxValue = Math.max(...data.map(item => item[valueKey]));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item[valueKey] / maxValue) * 80); // 80%の高さ
    return [x, y];
  });
  const pathData = points.map((point, i) =>
    (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
  ).join(' ');

  return (
    <div className="mt-6">
      <div className="relative h-60 w-full">
        {/* Y軸 */}
        <div className="absolute left-0 top-0 h-full border-r border-gray-300 flex flex-col justify-between items-end pr-2">
          <span className="text-xs text-gray-500">{maxValue}</span>
          <span className="text-xs text-gray-500">{Math.round(maxValue / 2)}</span>
          <span className="text-xs text-gray-500">0</span>
        </div>
        {/* グラフエリア */}
        <div className="absolute left-8 right-0 top-0 bottom-0">
          {/* グリッド線 */}
          <div className="absolute inset-0">
            <div className="border-b border-gray-200 h-1/3"></div>
            <div className="border-b border-gray-200 h-1/3"></div>
            <div className="border-b border-gray-200 h-1/3"></div>
          </div>
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, i) => (
              <circle key={i} cx={point[0]} cy={point[1]} r="4" fill="#3b82f6" />
            ))}
          </svg>
        </div>
        {/* X軸ラベル */}
        <div className="absolute left-8 right-0 bottom-0 flex justify-between transform translate-y-6">
          {data.map((item, i) => (
            <span key={i} className="text-xs text-gray-500 transform -rotate-45 origin-top-left">{item[labelKey]}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderPieChart(data, valueKey, labelKey, maxSlices = 5) {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 my-4">データがありません</p>;
  const chartData = data.slice(0, maxSlices);
  const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#0ea5e9', '#6366f1'];
  let startAngle = 0;
  const segments = chartData.map((item, index) => {
    const value = item[valueKey];
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const largeArcFlag = angle > 180 ? 1 : 0;
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    const pathData = [
      `M ${centerX},${centerY}`,
      `L ${startX},${startY}`,
      `A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`,
      'Z'
    ].join(' ');
    startAngle = endAngle;
    return { pathData, color: colors[index % colors.length], label: item[labelKey], value, percentage: percentage.toFixed(1) };
  });
  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {segments.map((segment, index) => (
            <path key={index} d={segment.pathData} fill={segment.color} stroke="#fff" strokeWidth="1" />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
            <span className="text-sm truncate max-w-[150px]">{segment.label}</span>
            <span className="text-sm text-gray-600">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

// --- メインApp ---
function App() {
  // --- 状態管理 ---
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'analysis', 'keyword-analysis'
  const [searchFields, setSearchFields] = useState({ title: true, content: true, answer: true });
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(Array.from({ length: 12 }, (_, i) => i + 1));
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null);
  const [makerAnalysis, setMakerAnalysis] = useState(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [graphType, setGraphType] = useState('bar');
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // --- データ取得 ---
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?action=getData`);
        if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        if (!result.data || !Array.isArray(result.data)) throw new Error('データが見つかりません');
        const formattedData = result.data.map((item, index) => ({
          id: index,
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
        const makerSet = new Set();
        formattedData.forEach(item => { if (item.機種) { const maker = item.機種.split(' ')[0]; if (maker) makerSet.add(maker); } });
        const yearSet = new Set();
        formattedData.forEach(item => { if (item.rawDate) { const year = item.rawDate.getFullYear(); yearSet.add(year); } });
        setAllData(formattedData);
        setDisplayData(formattedData);
        setMakers(Array.from(makerSet).sort());
        setYears(Array.from(yearSet).sort().reverse());
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
    setSearchFields(prev => ({ ...prev, [field]: !prev[field] }));
  }

  // --- 検索実行 ---
  function executeSearch() {
    if (loading) return;
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;
    let filtered = [...allData];
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
    if (selectedMaker) filtered = filtered.filter(item => item.機種 && item.機種.startsWith(selectedMaker));
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
    setSearchApplied(!!keyword || !!selectedMaker || !!selectedYear);
    setCurrentPage(1);
  }
  // エンターキー対応
  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && !loading) executeSearch();
  }

  // --- 月別分析 ---
  function performMonthlyAnalysis() {
    if (!selectedYear || !selectedMonth) {
      alert('年と月を選択してください');
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
    let filteredMonthData = [...monthData];
    if (searchInput.trim()) {
      const keyword = searchInput.trim().toLowerCase();
      const { title, content, answer } = searchFields;
      filteredMonthData = filteredMonthData.filter(item => {
        let hit = false;
        if (title) hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
        if (content) hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
        if (answer) hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
        return hit;
      });
    }
    // 地域別集計
    const cityCount = {};
    filteredMonthData.forEach(item => {
      const city = item.登録市区町村 || '不明';
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
    // 機種別集計
    const modelCount = {};
    filteredMonthData.forEach(item => {
      const model = item.機種 || '不明';
      modelCount[model] = (modelCount[model] || 0) + 1;
    });
    const models = Object.entries(modelCount)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count);
    // メーカー別集計
    const makerCount = {};
    filteredMonthData.forEach(item => {
      if (item.機種) {
        const maker = item.機種.split(' ')[0] || '不明';
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    const makerData = Object.entries(makerCount)
      .map(([maker, count]) => ({ maker, count }))
      .sort((a, b) => b.count - a.count);
    setMonthlyAnalysis({
      year: selectedYear,
      month: selectedMonth,
      total: filteredMonthData.length,
      cities: cities,
      models: models,
      searchTerm: searchInput,
      totalRaw: monthData.length,
      data: filteredMonthData
    });
    setMakerAnalysis({
      makers: makerData,
      total: filteredMonthData.length
    });
    setCurrentView('analysis');
  }

  // --- キーワード分析 ---
  function performKeywordAnalysis() {
    if (!searchInput.trim()) {
      alert('検索キーワードを入力してください');
      return;
    }
    setLoading(true);
    try {
      const keyword = searchInput.trim().toLowerCase();
      const { title, content, answer } = searchFields;
      let keywordData = allData.filter(item => {
        let hit = false;
        if (title) hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
        if (content) hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
        if (answer) hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
        return hit;
      });
      // 年月別の集計
      const timeSeriesData = {};
      keywordData.forEach(item => {
        if (item.rawDate) {
          const year = item.rawDate.getFullYear();
          const month = item.rawDate.getMonth() + 1;
          const key = `${year}/${month}`;
          timeSeriesData[key] = (timeSeriesData[key] || 0) + 1;
        }
      });
      const timeSeriesArray = Object.entries(timeSeriesData)
        .map(([date, count]) => {
          const [year, month] = date.split('/').map(Number);
          return { date, year, month, count };
        })
        .sort((a, b) => (a.year !== b.year) ? a.year - b.year : a.month - b.month);
      // 地域別集計
      const cityCount = {};
      keywordData.forEach(item => {
        const city = item.登録市区町村 || '不明';
        cityCount[city] = (cityCount[city] || 0) + 1;
      });
      const cities = Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count);
      // メーカー別集計
      const makerCount = {};
      keywordData.forEach(item => {
        if (item.機種) {
          const maker = item.機種.split(' ')[0] || '不明';
          makerCount[maker] = (makerCount[maker] || 0) + 1;
        }
      });
      const makerData = Object.entries(makerCount)
        .map(([maker, count]) => ({ maker, count }))
        .sort((a, b) => b.count - a.count);
      // 機種別集計
      const modelCount = {};
      keywordData.forEach(item => {
        const model = item.機種 || '不明';
        modelCount[model] = (modelCount[model] || 0) + 1;
      });
      const models = Object.entries(modelCount)
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      // タイトルパターン
      const titlePatterns = {};
      keywordData.forEach(item => {
        if (item.題名) {
          const title = item.題名.trim();
          titlePatterns[title] = (titlePatterns[title] || 0) + 1;
        }
      });
      const commonTitles = Object.entries(titlePatterns)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setKeywordAnalysis({
        keyword: searchInput,
        total: keywordData.length,
        timeSeries: timeSeriesArray,
        cities: cities,
        makers: makerData,
        models: models,
        commonTitles: commonTitles,
        data: keywordData
      });
      setCurrentView('keyword-analysis');
    } catch (error) {
      alert('分析中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  // --- 検索条件リセット ---
  function resetFilters() {
    setSearchInput('');
    setSelectedMaker('');
    setSearchFields({ title: true, content: true, answer: true });
    setDisplayData(allData);
    setSearchApplied(false);
    setSelectedItems(new Set());
    setCurrentPage(1);
    setSelectedYear('');
    setSelectedMonth('');
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

  // --- UIコンポーネント ---
  // ... DetailModal、copySelectedItems、downloadCSV などは省略（元コードでOK）

  // --- ローディング or エラー ---
  if (loading && allData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-xl text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl text-red-600 mb-4">エラーが発生しました</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // --- キーワード分析画面 ---
  if (currentView === 'keyword-analysis' && keywordAnalysis) {
    // ここに renderLineChart/renderPieChart/renderBarChart を使ったUIを挿入
    // …（省略：前回の回答どおり。要望があれば展開します）
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              キーワード分析
            </h1>
            <h2 className="text-2xl font-bold text-gray-800">
              「{keywordAnalysis.keyword}」の分析結果
            </h2>
            <p className="text-gray-600 mt-2">関連する問い合わせ: {keywordAnalysis.total}件</p>
          </div>
          {/* アクションボタン */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
              一覧表示に戻る
            </button>
            <button
              onClick={() => downloadCSV(keywordAnalysis.data)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Download size={18} />
              CSVダウンロード
            </button>
          </div>
          {/* グラフ表示切替 */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">グラフ表示:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setGraphType('bar')}
                  className={`px-4 py-2 rounded-md ${graphType === 'bar' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                >棒グラフ</button>
                <button
                  onClick={() => setGraphType('pie')}
                  className={`px-4 py-2 rounded-md ${graphType === 'pie' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                >円グラフ</button>
                <button
                  onClick={() => setGraphType('line')}
                  className={`px-4 py-2 rounded-md ${graphType === 'line' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                >折れ線グラフ</button>
              </div>
            </div>
          </div>
          {/* 時系列推移グラフ */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="font-bold mb-2">月別推移</div>
            {graphType === 'line' && renderLineChart(keywordAnalysis.timeSeries)}
            {graphType === 'bar' && renderBarChart(keywordAnalysis.timeSeries, 'count', 'date', 20)}
            {graphType === 'pie' && renderPieChart(keywordAnalysis.timeSeries, 'count', 'date', 8)}
          </div>
          {/* 地域別 */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="font-bold mb-2">地域別集計</div>
            {graphType === 'bar' && renderBarChart(keywordAnalysis.cities, 'count', 'city', 10)}
            {graphType === 'pie' && renderPieChart(keywordAnalysis.cities, 'count', 'city')}
          </div>
          {/* ...他のカード・リストなど省略 */}
        </div>
      </div>
    );
  }

  // --- 月別分析画面（UI/グラフ/集計） ---
  if (currentView === 'analysis' && monthlyAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              問い合わせ分析システム
            </h1>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthlyAnalysis.year}年{monthlyAnalysis.month}月の分析結果
              {monthlyAnalysis.searchTerm && (
                <span className="text-lg font-normal text-gray-600 ml-2">「{monthlyAnalysis.searchTerm}」で絞り込み</span>
              )}
            </h2>
          </div>
          {/* グラフUI例 */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="font-bold mb-2">月内 地域別</div>
            {renderBarChart(monthlyAnalysis.cities, 'count', 'city', 10)}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="font-bold mb-2">月内 機種別</div>
            {renderBarChart(monthlyAnalysis.models, 'count', 'model', 10)}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="font-bold mb-2">月内 メーカー別</div>
            {renderBarChart(makerAnalysis.makers, 'count', 'maker', 10)}
          </div>
        </div>
      </div>
    );
  }

  // --- メインUI（一覧表示） ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">総データ件数: {allData.length}件 | 表示件数: {displayData.length}件</p>
        </div>
        {/* 検索UI */}
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
                    onChange={() => handleCheckboxChange('title')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">題名</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields.content}
                    onChange={() => handleCheckboxChange('content')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">内容</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields.answer}
                    onChange={() => handleCheckboxChange('answer')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">回答</span>
                </label>
              </div>
            </div>
            {/* メーカー選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">メーカー</label>
              <select
                value={selectedMaker}
                onChange={(e) => setSelectedMaker(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="">すべて</option>
                {makers.map(maker => (
                  <option key={maker} value={maker}>{maker}</option>
                ))}
              </select>
            </div>
            {/* 年月選択（修正済み） */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">年</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedMonth('');
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
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={!selectedYear}
                >
                  <option value="">すべて</option>
                  {months.map(month => (
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
            {(searchApplied || selectedMaker || selectedYear) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
              >
                <Filter size={18} />
                条件リセット
              </button>
            )}
            {displayData.length > 0 && (
              <button
                onClick={() => downloadCSV()}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm ml-auto"
              >
                <Download size={18} />
                CSVダウンロード
              </button>
            )}
          </div>
        </div>
        {/* 検索結果表示は省略。必要なら展開します */}
      </div>
    </div>
  );
}

export default App;
