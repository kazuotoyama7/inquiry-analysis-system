import React, { useState, useEffect } from 'react';
import { Search, Filter, BarChart3, Eye, ChevronLeft, ChevronRight, Copy, Loader2 } from 'lucide-react';
import './App.css';

const InquiryAnalysisApp = () => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [makers, setMakers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    response: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}?action=getData`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('データが見つかりません');
      }

      const formattedData = result.data.map((item, index) => {
        return {
          id: item['ユーザーID'] || index,
          題名: item['題名'] || item['回答題名'] || '未設定',
          機種: item['機種'] || item['Model'] || '不明',
          内容: item['内容'] || item['相談内容'] || '',
          回答: item['回答'] || '',
          問合日時: item['問合日時'] ? new Date(item['問合日時']).toLocaleDateString('ja-JP') : '不明',
          Platform: item['Platform'] || '不明',
          登録市区町村: item['登録市区町村'] || '不明',
          ユーザーID: item['ユーザーID'] || '',
          問合種別: item['問合種別'] || '不明'
        };
      });
      
      setData(formattedData);
      setFilteredData(formattedData);
      
      // メーカー一覧を作成
      const makerSet = new Set();
      formattedData.forEach(item => {
        if (item.機種) {
          const maker = item.機種.split(' ')[0];
          makerSet.add(maker);
        }
      });
      setMakers(Array.from(makerSet));
      
      setError(null);
    } catch (err) {
      setError(`データの取得に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 検索・フィルタリング
  const performFilter = () => {
    let filtered = data;

    // 検索語フィルタ
    if (searchTerm) {
      const keywords = searchTerm.split(' ');
      filtered = filtered.filter(item => {
        return keywords.every(keyword => {
          const keywordLower = keyword.toLowerCase();
          return (
            (searchFields.title && item.題名.toLowerCase().includes(keywordLower)) ||
            (searchFields.content && item.内容.toLowerCase().includes(keywordLower)) ||
            (searchFields.response && item.回答.toLowerCase().includes(keywordLower))
          );
        });
      });
    }

    // メーカーフィルタ
    if (selectedMaker) {
      filtered = filtered.filter(item => item.機種.includes(selectedMaker));
    }

    setFilteredData(filtered);
  };

  // Enterキーでの検索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performFilter();
    }
  };

  // 複数選択の処理
  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // 選択されたアイテムをコピー
  const copySelectedItems = () => {
    const selectedData = filteredData.filter(item => selectedItems.has(item.id));
    const headers = ['日付', '題名', '機種', '内容', '回答'];
    const rows = selectedData.map(item => [
      item.問合日時,
      item.題名,
      item.機種,
      item.内容,
      item.回答
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join('\t'))
      .join('\n');
    
    navigator.clipboard.writeText(csvContent);
    alert(`${selectedData.length}行をコピーしました`);
  };

  // 詳細表示モーダル
  const DetailView = ({ item, onClose, onPrevious, onNext }) => (
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
            onClick={() => navigator.clipboard.writeText(item.回答)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Copy size={16} />
            回答をコピー
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onPrevious}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft size={16} />
              前へ
            </button>
            <button 
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              次へ
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
          <p className="text-xl text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">総データ件数: {data.length}件</p>
        </div>

        {/* 検索・フィルターエリア */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* 検索語入力 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">検索語</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="キーワードを入力..."
                />
              </div>
            </div>

            {/* メーカー選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">メーカー</label>
              <select
                value={selectedMaker}
                onChange={(e) => setSelectedMaker(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">すべて</option>
                {makers.map(maker => (
                  <option key={maker} value={maker}>{maker}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 検索対象チェックボックス */}
          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchFields.title}
                onChange={(e) => setSearchFields({...searchFields, title: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">題名</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchFields.content}
                onChange={(e) => setSearchFields({...searchFields, content: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">内容</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchFields.response}
                onChange={(e) => setSearchFields({...searchFields, response: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">回答</span>
            </label>
          </div>

          {/* ボタンエリア */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={performFilter}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"
            >
              <Search size={20} />
              検索
            </button>

            {selectedItems.size > 0 && (
              <button
                onClick={copySelectedItems}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg"
              >
                <Copy size={20} />
                選択項目をコピー ({selectedItems.size})
              </button>
            )}
          </div>
        </div>

        {/* データ表示エリア */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              検索結果 ({filteredData.length}件)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(filteredData.map(item => item.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">題名</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">機種</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">内容</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
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
        </div>

        {/* 詳細ビューモーダル */}
        {selectedItem && (
          <DetailView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onPrevious={() => {
              const currentIndex = filteredData.findIndex(item => item.id === selectedItem.id);
              if (currentIndex > 0) {
                setSelectedItem(filteredData[currentIndex - 1]);
              }
            }}
            onNext={() => {
              const currentIndex = filteredData.findIndex(item => item.id === selectedItem.id);
              if (currentIndex < filteredData.length - 1) {
                setSelectedItem(filteredData[currentIndex + 1]);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

function App() {
  return <InquiryAnalysisApp />;
}

export default App;
