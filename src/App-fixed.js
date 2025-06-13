import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 基本的な状態
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // 初期データの読み込み
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?action=getData`);
        
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('データが見つかりません');
        }

        // データ整形
        const formattedData = result.data.map((item, index) => ({
          id: index,
          題名: item['題名'] || item['回答題名'] || '未設定',
          機種: item['機種'] || item['Model'] || '不明',
          内容: item['内容'] || item['相談内容'] || '',
          回答: item['回答'] || '',
          問合日時: item['問合日時'] ? new Date(item['問合日時']).toLocaleDateString('ja-JP') : '不明'
        }));
        
        setAllData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(`データ取得エラー: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // 検索実行
  function doSearch() {
    // 検索語が空の場合は全データを表示
    if (!searchInput.trim()) {
      setFilteredData(allData);
      return;
    }
    
    // 検索実行
    const keyword = searchInput.trim().toLowerCase();
    const results = allData.filter(item => 
      (item.題名 && item.題名.toLowerCase().includes(keyword)) ||
      (item.内容 && item.内容.toLowerCase().includes(keyword)) ||
      (item.回答 && item.回答.toLowerCase().includes(keyword))
    );
    
    setFilteredData(results);
  }

  // 詳細表示モーダル
  function DetailView() {
    if (!selectedItem) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedItem.題名}</h3>
                <p className="text-blue-100">機種: {selectedItem.機種}</p>
                <p className="text-blue-100 text-sm">問合日時: {selectedItem.問合日時}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">問い合わせ内容</h4>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{selectedItem.内容}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">回答</h4>
              <p className="text-gray-600 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">{selectedItem.回答}</p>
            </div>
          </div>
          
          <div className="border-t p-4 flex justify-between items-center bg-gray-50">
            <button 
              onClick={() => {
                try {
                  navigator.clipboard.writeText(selectedItem.回答 || '');
                  alert('回答をコピーしました');
                } catch (e) {
                  alert('コピーに失敗しました');
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              回答をコピー
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ローディング表示
  if (loading && allData.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl text-red-600 mb-4">エラーが発生しました</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // メインUI
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">問い合わせ分析システム</h1>
          <p className="text-gray-600">総データ件数: {allData.length}件 | 表示件数: {filteredData.length}件</p>
        </div>

        {/* 検索エリア */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg"
              placeholder="キーワードを入力..."
            />
            <button
              onClick={doSearch}
              className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
            >
              検索
            </button>
          </div>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked readOnly className="text-blue-500" />
              <span className="text-sm">題名</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked readOnly className="text-blue-500" />
              <span className="text-sm">内容</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked readOnly className="text-blue-500" />
              <span className="text-sm">回答</span>
            </label>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h2 className="text-lg font-bold">
              検索結果 ({filteredData.length}件)
              {searchInput && <span className="text-sm font-normal ml-2">「{searchInput}」</span>}
            </h2>
          </div>
          
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">日付</th>
                    <th className="px-4 py-2 text-left">題名</th>
                    <th className="px-4 py-2 text-left">機種</th>
                    <th className="px-4 py-2 text-left">内容</th>
                    <th className="px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm">{item.問合日時}</td>
                      <td className="px-4 py-2 text-sm font-medium max-w-xs truncate">{item.題名}</td>
                      <td className="px-4 py-2 text-sm">{item.機種}</td>
                      <td className="px-4 py-2 text-sm max-w-md truncate">{item.内容}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">検索条件に一致するデータが見つかりませんでした</p>
            </div>
          )}
        </div>

        {/* 詳細モーダル */}
        {selectedItem && <DetailView />}
      </div>
    </div>
  );
}

export default App;
