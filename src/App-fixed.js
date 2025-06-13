import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Copy, ChevronLeft, ChevronRight, Filter, BarChart3, Download, TrendingUp } from 'lucide-react';
import './App.css';

function App() {
  // 基本の状態
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchFields, setSearchFields] = useState({ title: true, content: true, answer: true });
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // API URL
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // データ取得
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?action=getData`);
        if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) throw new Error('データが見つかりません');
        const formatted = result.data.map((item, idx) => ({
          id: idx,
          題名: item['題名'] || item['回答題名'] || '未設定',
          機種: item['機種'] || item['Model'] || '不明',
          内容: item['内容'] || item['相談内容'] || '',
          回答: item['回答'] || '',
          問合日時: item['問合日時'] ? new Date(item['問合日時']).toLocaleDateString('ja-JP') : '不明',
          rawDate: item['問合日時'] ? new Date(item['問合日時']) : null,
          登録市区町村: item['登録市区町村'] || '不明',
        }));
        // 年のリストを取得
        const yearSet = new Set();
        formatted.forEach(item => { if (item.rawDate) yearSet.add(item.rawDate.getFullYear()); });
        const yearArr = Array.from(yearSet).sort((a, b) => b - a);
        setYears(['すべて', ...yearArr]);
        setAllData(formatted);
        setDisplayData(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // 検索
  function executeSearch() {
    if (loading) return;
    let filtered = [...allData];
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;

    // 年フィルタ
    if (selectedYear && selectedYear !== 'すべて') {
      filtered = filtered.filter(item => item.rawDate && item.rawDate.getFullYear().toString() === selectedYear.toString());
    }
    // キーワードフィルタ
    if ((title || content || answer) && keyword) {
      filtered = filtered.filter(item => {
        let hit = false;
        if (title) hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
        if (content) hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
        if (answer) hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
        return hit;
      });
    }
    setDisplayData(filtered);
    setCurrentPage(1);
  }

  // チェックボックス
  function handleCheckboxChange(field) {
    setSearchFields(prev => ({ ...prev, [field]: !prev[field] }));
  }

  // ページネーション
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayData.slice(start, start + itemsPerPage);
  }, [displayData, currentPage, itemsPerPage]);

  // 詳細モーダル
  function DetailModal({ item, onClose, goPrev, goNext }) {
    if (!item) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-start rounded-t-xl">
            <div>
              <h3 className="text-xl font-bold mb-2">{item.題名}</h3>
              <p className="text-blue-100">機種: {item.機種}</p>
              <p className="text-blue-100 text-sm">問合日時: {item.問合日時}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg text-2xl"
              style={{ lineHeight: 1 }}
              aria-label="閉じる"
            >✕</button>
          </div>
          {/* 内容 */}
          <div className="flex-1 p-6 overflow-y-auto min-h-32" style={{ minHeight: 0 }}>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">問い合わせ内容
                <button
                  onClick={() => {navigator.clipboard.writeText(item.内容 || '');}}
                  className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs hover:bg-blue-200 transition"
                  title="内容コピー"
                ><Copy size={14} className="inline mr-1" />コピー</button>
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700 text-sm">{item.内容}</div>
            </div>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">回答
                <button
                  onClick={() => {navigator.clipboard.writeText(item.回答 || '');}}
                  className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs hover:bg-green-200 transition"
                  title="回答コピー"
                ><Copy size={14} className="inline mr-1" />コピー</button>
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700 text-sm">{item.回答}</div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p>登録市区町村: {item.登録市区町村}</p>
            </div>
          </div>
          {/* 下部操作バー */}
          <div className="border-t p-4 flex justify-between items-center bg-gray-50 sticky bottom-0 z-10">
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={item.id === displayData[0]?.id}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              ><ChevronLeft size={16} />前へ</button>
              <button
                onClick={goNext}
                disabled={item.id === displayData[displayData.length - 1]?.id}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >次へ<ChevronRight size={16} /></button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >閉じる</button>
          </div>
        </div>
      </div>
    );
  }

  // --- UI ---

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">データを読み込み中...</p>
      </div>
    </div>
  );

  if (error) return (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">総データ件数: {allData.length}件 | 表示件数: {displayData.length}件</p>
        </div>
        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && executeSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="キーワードを入力..."
                  disabled={loading}
                  style={{ backgroundPosition: '8px 50%' }}
                />
                <button
                  onClick={executeSearch}
                  disabled={loading}
                  className="flex items-center gap-1 px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                  style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                >
                  <Search size={18} />検索
                </button>
              </div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={searchFields.title} onChange={() => handleCheckboxChange('title')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">題名</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={searchFields.content} onChange={() => handleCheckboxChange('content')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">内容</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={searchFields.answer} onChange={() => handleCheckboxChange('answer')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">回答</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">年</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">表示件数</label>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {[10, 20, 50, 100].map(num => (
                  <option key={num} value={num}>{num}件</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* 問い合わせ一覧 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">検索結果 ({displayData.length}件)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">題名</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">機種</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">内容</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">詳細</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                  <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.問合日時}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{item.題名}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.機種}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{item.内容}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm font-bold shadow"
                        style={{ minWidth: 70 }}
                        title="詳細を見る"
                      >
                        <Eye size={16} />詳細
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">データがありません</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* ページネーション */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 border rounded text-sm disabled:opacity-50">&laquo;</button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded text-sm disabled:opacity-50">&lt;</button>
                <span className="px-2">{currentPage} / {pageCount}</span>
                <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="px-2 py-1 border rounded text-sm disabled:opacity-50">&gt;</button>
                <button onClick={() => setCurrentPage(pageCount)} disabled={currentPage === pageCount} className="px-2 py-1 border rounded text-sm disabled:opacity-50">&raquo;</button>
              </div>
            </div>
          )}
        </div>
        {/* 詳細モーダル */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            goPrev={() => {
              const idx = displayData.findIndex(i => i.id === selectedItem.id);
              if (idx > 0) setSelectedItem(displayData[idx - 1]);
            }}
            goNext={() => {
              const idx = displayData.findIndex(i => i.id === selectedItem.id);
              if (idx < displayData.length - 1) setSelectedItem(displayData[idx + 1]);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
