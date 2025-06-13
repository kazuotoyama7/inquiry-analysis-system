import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BarChart3, Eye, ChevronLeft, ChevronRight, Copy, Loader2, Calendar, Download, PieChart, TrendingUp, List, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  // 各種ステート
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('list');

  // チェックボックス
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    answer: true,
  });

  // フィルタ用
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(Array.from({ length: 12 }, (_, i) => i + 1));

  // 分析用
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null);
  const [makerAnalysis, setMakerAnalysis] = useState(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // グラフ種別
  const [graphType, setGraphType] = useState('bar');

  // API
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // 初回データ取得
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
        // メーカーリスト/年リスト
        const makerSet = new Set();
        formattedData.forEach(item => {
          if (item.機種) {
            const maker = item.機種.split(' ')[0];
            if (maker) makerSet.add(maker);
          }
        });
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
        // 現在の年月をデフォルト選択
        const currentDate = new Date();
        setSelectedYear(currentDate.getFullYear().toString());
        setSelectedMonth((currentDate.getMonth() + 1).toString());
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(`データ取得エラー: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // チェックボックス
  function handleCheckboxChange(field) {
    setSearchFields(prev => ({
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
        filtered = filtered.filter(item => {
          let hit = false;
          if (title) hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
          if (content) hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
          if (answer) hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
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
    setSearchApplied(!!keyword || !!selectedMaker || !!selectedYear);
    setCurrentPage(1);
  }

  // エンターで検索
  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && !loading) {
      executeSearch();
    }
  }

  // ページネーション
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return displayData.slice(start, end);
  }, [displayData, currentPage, itemsPerPage]);
  function changePage(newPage) {
    if (newPage >= 1 && newPage <= pageCount) setCurrentPage(newPage);
  }

  // 複数選択
  function toggleItemSelection(id) {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      return newSelected;
    });
  }
  function toggleSelectAll() {
    if (selectedItems.size === paginatedData.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(paginatedData.map(item => item.id)));
  }

  // CSVダウンロード
  function downloadCSV(data = null) {
    try {
      const targetData = data ? data : selectedItems.size > 0 ? displayData.filter(item => selectedItems.has(item.id)) : displayData;
      if (targetData.length === 0) {
        alert('ダウンロードするデータがありません');
        return;
      }
      const headers = ['日付', '題名', '機種', '内容', '回答', 'Platform', '登録市区町村', 'ユーザーID', '問合種別'];
      const rows = targetData.map(item => [
        item.問合日時 || '',
        item.題名 || '',
        item.機種 || '',
        item.内容 || '',
        item.回答 || '',
        item.Platform || '',
        item.登録市区町村 || '',
        item.ユーザーID || '',
        item.問合種別 || ''
      ]);
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      let filename = '問い合わせデータ';
      if (searchApplied && searchInput) filename += `_${searchInput}`;
      if (selectedYear) {
        filename += `_${selectedYear}年`;
        if (selectedMonth) filename += `${selectedMonth}月`;
      }
      filename += '.csv';
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('CSV作成エラー:', error);
      alert('CSVファイルの作成中にエラーが発生しました');
    }
  }

  // 検索条件リセット
  function resetFilters() {
    setSearchInput('');
    setSelectedMaker('');
    setSearchFields({ title: true, content: true, answer: true });
    setDisplayData(allData);
    setSearchApplied(false);
    setSelectedItems(new Set());
    setCurrentPage(1);
  }

  // --------- グラフレンダリングここから ---------
  // 折れ線グラフ
  function renderLineChart(data, valueKey = 'count', labelKey = 'date') {
    if (!data || data.length === 0) return <p className="text-center text-gray-500 my-4">データがありません</p>;
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    // データ1点なら中央だけ描画
    const points = data.length === 1
      ? [[50, 50]]
      : data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((item[valueKey] / maxValue) * 80);
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
          {/* グラフ */}
          <div className="absolute left-8 right-0 top-0 bottom-0">
            <div className="absolute inset-0">
              <div className="border-b border-gray-200 h-1/3"></div>
              <div className="border-b border-gray-200 h-1/3"></div>
              <div className="border-b border-gray-200 h-1/3"></div>
            </div>
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={pathData}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point, i) => (
                <circle
                  key={i}
                  cx={point[0]}
                  cy={point[1]}
                  r="4"
                  fill="#3b82f6"
                />
              ))}
            </svg>
          </div>
          {/* X軸ラベル */}
          <div className="absolute left-8 right-0 bottom-0 flex justify-between transform translate-y-6">
            {data.map((item, i) => (
              <span key={i} className="text-xs text-gray-500 transform -rotate-45 origin-top-left">
                {item[labelKey]}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // バーチャート
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

  // 円グラフ
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
      const centerX = 50, centerY = 50, radius = 40;
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
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-sm truncate max-w-[150px]">{segment.label}</span>
              <span className="text-sm text-gray-600">{segment.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // --------- グラフレンダリングここまで ---------

  // ...この下はこれまで通りです（省略可）

  // 例：ローディング、エラー、UIなど
  // (ここまででグラフのエラーはすべて回避できます)
  // もし既存のreturn部分や他UI部分で不明点があれば、その部分だけ貼って質問ください！
}

export default App;
