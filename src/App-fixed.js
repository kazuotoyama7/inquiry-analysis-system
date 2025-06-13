import React, { useState, useEffect } from 'react';
import { Search, Eye, Copy } from 'lucide-react';
import './App.css';

function App() {
  // 基本的な状態
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // データを取得する関数
  useEffect(() => {
    async function fetchInitialData() {
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

        // データの整形
        const formattedData = result.data.map((item, index) => ({
          id: index,
          題名: item['題名'] || item['回答題名'] || '未設定',
          機種: item['機種'] || item['Model'] || '不明',
          内容: item['内容'] || item['相談内容'] || '',
          回答: item['回答'] || '',
          問合日時: item['問合日時'] ? new Date(item['問合日時']).toLocaleDateString('ja-JP') : '不明',
          Platform: item['Platform'] || '不明',
          登録市区町村: item['登録市区町村'] || '不明',
          ユーザーID: item['ユーザーID'] || '',
          問合種別: item['問合種別'] || '不明'
        }));
        
        console.log('データ取得成功:', formattedData.length, '件');
        setAllData(formattedData);
        setDisplayData(formattedData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(`データ取得エラー: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInitialData();
  }, []);

  // 検索を実行する関数
  function executeSearch() {
    if (!searchInput.trim()) {
      // 検索語が空の場合は全データを表示
      setDisplayData(allData);
      setSearchApplied(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const keyword = searchInput.trim().toLowerCase();
      
      // 検索フィルターの適用
      const results = allData.filter(item => {
        return (
          (item.題名 && item.題名.toLowerCase().includes(keyword)) ||
          (item.内容 && item.内容.toLowerCase().includes(keyword)) ||
          (item.回答 && item.回答.toLowerCase().includes(keyword))
        );
      });
      
      console.log('検索結果:', results.length, '件');
      setDisplayData(results);
      setSearchApplied(true);
    } catch (error) {
      console.error('検索エラー:', error);
      // エラー時は全データを表示
      setDisplayData(allData);
    } finally {
      setLoading(false);
    }
  }

  // 詳細表示モーダル
  function DetailModal({ item, onClose }) {
    if (!item) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{item.題名}</h3>
                <p className="text-blue-100">機種: {item.機種} | {item.Platform}</p>
                <p className="text-blue-100 text-sm">問合日時: {item.問合日時}</p>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">問い合わせ内容</h4>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{item.内容}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">回答</h4>
              <p className="text-gray-600 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">{item.回答}</p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>ユーザーID: {item.ユーザーID}</p>
              <p>登録地域: {item.登録市区町村}</p>
              <p>問合種別: {item.問合種別}</p>
            </div>
          </div>
          
          <div className="border-t p-4 flex justify-between items-center bg-gray-50">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(item.回答 || '')
                  .then(() => alert('回答をコピーしました'))
                  .catch(() => alert('コピーに失敗しました'));
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Copy size={16} />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl text-red-600 mb-4">エラーが発生しました</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // メインのUI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">総データ件数: {allData.length}件 | 表示件数: {displayData.length}件</p>
        </div>

        {/* 検索エリア */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative flex">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
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
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">題名</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">内容</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">回答</span>
            </label>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              検索結果 ({displayData.length}件)
              {searchApplied && searchInput && (
                <span className="text-sm font-normal text-gray-600 ml-2">「{searchInput}」で検索中</span>
              )}
            </h2>
          </div>
          
          {loading && allData.length > 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">検索中...</p>
            </div>
          ) : displayData.length > 0 ? (
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
                  {displayData.map((item, index) => (
                    <tr key={index} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
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
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">検索条件に一致するデータが見つかりませんでした</p>
            </div>
          )}
        </div>

        {/* 詳細モーダル */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
