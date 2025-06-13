import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import './App.css';

const InquiryAnalysisApp = () => {
  // APIエンドポイント
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APIからデータを取得
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('データ取得を開始...');
      
      const response = await fetch(`${API_URL}?action=getData`);
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('取得したデータ:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // データが存在するかチェック
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('データが見つかりません');
      }
      
      // データ形式を統一（安全にマッピング）
      const formattedData = result.data.map((item, index) => {
        try {
          return {
            id: item['ユーザーID'] || index,
            題名: item['回答題名'] || '未設定',
            機種: item['Model'] || '不明',
            内容: item['相談内容'] || '',
            回答: item['回答'] || '',
            問合日時: item['問合日時'] ? new Date(item['問合日時']).toLocaleDateString('ja-JP') : '不明',
            ユーザーID: item['ユーザーID'] || '',
            登録市区町村: item['登録市区町村'] || '不明',
            Platform: item['Platform'] || '不明',
            問合種別: item['問合種別'] || '不明'
          };
        } catch (err) {
          console.error('データ変換エラー:', err, item);
          return {
            id: index,
            題名: 'データエラー',
            機種: '不明',
            内容: '表示できません',
            回答: '表示できません',
            問合日時: '不明',
            ユーザーID: '',
            登録市区町村: '不明',
            Platform: '不明',
            問合種別: '不明'
          };
        }
      });
      
      console.log('変換後のデータ:', formattedData.slice(0, 3));
      setData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`データの取得に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初期データ取得
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

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              検索結果 ({data.length}件)
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
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((item, index) => (
                  <tr key={item.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.問合日時}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{item.題名}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.機種}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-md truncate">{item.内容}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return <InquiryAnalysisApp />;
}

export default App;
