// 折れ線グラフのレンダリング (時系列データ用)
  function renderLineChart(data, valueKey = 'count', labelKey = 'date') {
    if (!data || data.length === 0) return <p className="text-center text-gray-500 my-4">データがありません</p>;
    
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item[valueKey] / maxValue) * 80); // 80%の高さを使用
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
            {/* 水平グリッド線 */}
            <div className="absolute inset-0">
              <div className="border-b border-gray-200 h-1/3"></div>
              <div className="border-b border-gray-200 h-1/3"></div>
              <div className="border-b border-gray-200 h-1/3"></div>
            </div>
            
            {/* 折れ線 */}
            <svg className="absolute inset-0 h-full w-full overflow-visible">
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
                  cx={point[0] + '%'} 
                  cy={point[1] + '%'} 
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

  // ローディング表示
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

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

  // キーワード分析表示
  if (currentView === 'keyword-analysis' && keywordAnalysis) {
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
                >
                  棒グラフ
                </button>
                <button
                  onClick={() => setGraphType('pie')}
                  className={`px-4 py-2 rounded-md ${graphType === 'pie' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                >
                  円グラフ
                </button>
                <button
                  onClick={() => setGraphType('line')}
                  className={`px-4 py-2 rounded-md ${graphType === 'line' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                >
                  折れ線グラフ
                </button>
              </div>
            </div>
          </div>
          
          {/* 集計情報カード */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* 時系列推移 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <h3 className="text-xl font-bold text-gray-800">月別推移</h3>
              </div>
              <div className="p-4">
                {keywordAnalysis.timeSeries.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">「{keywordAnalysis.keyword}」に関する問い合わせの月別推移</p>
                    {renderLineChart(keywordAnalysis.timeSeries)}
                  </>
                ) : (
                  <p className="text-center text-gray-500 my-4">データがありません</p>
                )}
              </div>
            </div>
            
            {/* 地域別集計 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <h3 className="text-xl font-bold text-gray-800">地域別集計</h3>
              </div>
              <div className="p-4">
                {keywordAnalysis.cities.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">「{keywordAnalysis.keyword}」に関する問い合わせの地域分布</p>
                    {graphType === 'bar' && renderBarChart(keywordAnalysis.cities, 'count', 'city', 10)}
                    {graphType === 'pie' && renderPieChart(keywordAnalysis.cities, 'count', 'city')}
                  </>
                ) : (
                  <p className="text-center text-gray-500 my-4">データがありません</p>
                )}
              </div>
            </div>
          </div>
          
          {/* メーカー別とタイトルパターン */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* メーカー別集計 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <h3 className="text-xl font-bold text-gray-800">メーカー別集計</h3>
              </div>
              <div className="p-4">
                {keywordAnalysis.makers.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">「{keywordAnalysis.keyword}」に関する問い合わせのメーカー分布</p>
                    {graphType === 'bar' && renderBarChart(keywordAnalysis.makers, 'count', 'maker', 10)}
                    {graphType === 'pie' && renderPieChart(keywordAnalysis.makers, 'count', 'maker')}
                  </>
                ) : (
                  <p className="text-center text-gray-500 my-4">データがありません</p>
                )}
              </div>
            </div>
            
            {/* 機種別集計 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <h3 className="text-xl font-bold text-gray-800">機種別集計</h3>
              </div>
              <div className="p-4">
                {keywordAnalysis.models.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">「{keywordAnalysis.keyword}」に関する問い合わせの上位機種</p>
                    {graphType === 'bar' && renderBarChart(keywordAnalysis.models, 'count', 'model', 10)}
                    {graphType === 'pie' && renderPieChart(keywordAnalysis.models, 'count', 'model')}
                  </>
                ) : (
                  <p className="text-center text-gray-500 my-4">データがありません</p>
                )}
              </div>
            </div>
          </div>
          
          {/* よくある問題パターン */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <h3 className="text-xl font-bold text-gray-800">よくある問題パターン</h3>
            </div>
            <div className="p-4">
              {keywordAnalysis.commonTitles.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-2">「{keywordAnalysis.keyword}」に関する問い合わせの主なタイトル</p>
                  <div className="mt-4">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">タイトル</th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">件数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywordAnalysis.commonTitles.map((item, index) => (
                          <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.count}件</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 my-4">データがありません</p>
              )}
            </div>
          </div>
          
          {/* 検索結果一覧 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">関連する問い合わせ一覧</h3>
                <span className="text-sm font-medium text-gray-600">{keywordAnalysis.total}件</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">題名</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">機種</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">地域</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordAnalysis.data.slice(0, 20).map((item, index) => (
                    <tr key={item.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.問合日時}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{item.題名}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.機種}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.登録市区町村}</td>
                      <td className="px-4 py-3">
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
            
            {keywordAnalysis.data.length > 20 && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600">表示: 最初の20件 (合計 {keywordAnalysis.data.length}件)</p>
                <button
                  onClick={() => {
                    setDisplayData(keywordAnalysis.data);
                    setCurrentView('list');
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  全件表示
                </button>
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
  
  // 月別分析表示
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
          
          {/* 集計情報 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">総件数</h3>
                <Calendar size={24} className="text-blue-100" />
              </div>
              <p className="text-3xl font-bold mt-2">{monthlyAnalysis.total}件</p>
              {monthlyAnalysis.total !== monthlyAnalysis.totalRaw && (
                <p className="text-sm text-blue-100 mt-1">
                  検索条件適用前: {monthlyAnalysis.totalRaw}件
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">対象地域</h3>
                <PieChart size={24} className="text-green-100" />
              </div>
              <p className="text-3xl font-bold mt-2">{monthlyAnalysis.cities.length}地域</p>
              {monthlyAnalysis.cities.length > 0 && (
                <p className="text-sm text-green-100 mt-1">
                  最多: {monthlyAnalysis.cities[0].city} ({monthlyAnalysis.cities[0].count}件)
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">機種数</h3>
                <Filter size={24} className="text-amber-100" />
              </div>
              <p className="text-3xl font-bold mt-2">{monthlyAnalysis.models.length}機種</p>
              {monthlyAnalysis.models.length > 0 && (
                <p className="text-sm text-amber-100 mt-1">
                  最多: {monthlyAnalysis.models[0].model} ({monthlyAnalysis.models[0].count}件)
                </p>
              )}
            </div>
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
              onClick={() => downloadCSV(monthlyAnalysis.data)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Download size={18} />
              CSVダウンロード
            </button>
          </div>
          
          {/* 地域別集計 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <h3 className="text-xl font-bold text-gray-800">地域別内訳</h3>
            </div>
            
            {monthlyAnalysis.cities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">自治体</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">件数</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">割合</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">グラフ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyAnalysis.cities.map(({city, count}, index) => (
                      <tr key={city} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">{city}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{count}件</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {((count / monthlyAnalysis.total) * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(count / monthlyAnalysis.total) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">地域データがありません</p>
              </div>
            )}
          </div>
          
          {/* メーカー別集計 */}
          {makerAnalysis && makerAnalysis.makers.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <h3 className="text-xl font-bold text-gray-800">メーカー別内訳</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">メーカー</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">件数</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">割合</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">グラフ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {makerAnalysis.makers.map(({maker, count}, index) => (
                      <tr key={maker} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">{maker}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{count}件</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {((count / makerAnalysis.total) * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(count / makerAnalysis.total) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // メインUI（一覧表示）
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            問い合わせ分析システム
          </h1>
          <p className="text-gray-600">総データ件数: {allData.length}件 | 表示件数: {displayData.length}件</p>
        </div>

        {/* 検索・フィルターエリア */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 検索語入力 */}
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

            {/* 年月選択 */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">年</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
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

          {/* アクションボタンエリア */}
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

        {/* 検索結果エリア */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              検索結果 ({displayData.length}件)
              {searchApplied && searchInput && (
                <span className="text-sm font-normal text-gray-600 ml-2">「{searchInput}」で検索中</span>
              )}
              {selectedMaker && (
                <span className="text-sm font-normal text-gray-600 ml-2">「{selectedMaker}」で絞り込み中</span>
              )}
              {selectedYear && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  「{selectedYear}年{selectedMonth ? `${selectedMonth}月` : ''}」で絞り込み中
                </span>
              )}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
              <p className="text-gray-500">データを処理中...</p>
            </div>
          ) : displayData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={paginatedData.length > 0 && selectedItems.size === paginatedData.length}
                          onChange={toggleSelectAll}
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
                    {paginatedData.map((item, index) => (
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
              
              {/* ページネーション */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">表示件数: </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // 件数変更時はページを1に戻す
                      }}
                      className="p-1 border rounded text-sm"
                    >
                      {[10, 20, 50, 100].map(num => (
                        <option key={num} value={num}>{num}件</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changePage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      &laquo;
                    </button>
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      &lt;
                    </button>
                    
                    <span className="px-4 py-1 text-sm">
                      {currentPage} / {pageCount}
                    </span>
                    
                    <button
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      &gt;
                    </button>
                    <button
                      onClick={() => changePage(pageCount)}
                      disabled={currentPage === pageCount}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      &raquo;
                    </button>
                  </div>
                  
                  {selectedItems.size > 0 && (
                    <button
                      onClick={copySelectedItems}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      <Copy size={14} />
                      選択項目をコピー ({selectedItems.size})
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">検索条件に一致するデータが見つかりませんでした</p>
              {searchApplied && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  検索条件をリセット
                </button>
              )}
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

export default App;import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BarChart3, Eye, ChevronLeft, ChevronRight, Copy, Loader2, Calendar, Download, PieChart, TrendingUp, List, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  // 基本的な状態管理
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'analysis', 'keyword-analysis'

  // チェックボックス用のstate
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    answer: true,
  });

  // フィルタリング用の状態
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [makers, setMakers] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState(Array.from({length: 12}, (_, i) => i + 1));

  // 分析用の状態
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null);
  const [makerAnalysis, setMakerAnalysis] = useState(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  
  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 複数選択用の状態
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // グラフ表示用の状態
  const [graphType, setGraphType] = useState('bar'); // 'bar', 'pie', 'line'
  
  // API URLとデータ取得
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // 初期データ取得
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?action=getData`);
        if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        if (!result.data || !Array.isArray(result.data)) throw new Error('データが見つかりません');
        
        // データ整形
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
        
        // メーカー一覧を抽出
        const makerSet = new Set();
        formattedData.forEach(item => {
          if (item.機種) {
            const maker = item.機種.split(' ')[0];
            if (maker) makerSet.add(maker);
          }
        });
        
        // 年の一覧を抽出
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
        
        // 現在の年月をデフォルト値として設定
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

  // チェックボックスのonChange処理
  function handleCheckboxChange(field) {
    setSearchFields(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  // 検索実行
  function executeSearch() {
    if (loading) return;
    
    const keyword = searchInput.trim().toLowerCase();
    const { title, content, answer } = searchFields;

    // フィルタリングの基準
    let filtered = [...allData];
    
    // 検索するフィールドが1つも選ばれていなければフィルタリングしない
    if (title || content || answer) {
      if (keyword) {
        filtered = filtered.filter(item => {
          let hit = false;
          if (title) {
            hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
          }
          if (content) {
            hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
          }
          if (answer) {
            hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
          }
          return hit;
        });
      }
    }
    
    // メーカーフィルタリング
    if (selectedMaker) {
      filtered = filtered.filter(item => 
        item.機種 && item.機種.startsWith(selectedMaker)
      );
    }
    
    // 年月フィルタリング
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
    setCurrentPage(1); // 検索実行時はページを1に戻す
  }
  
  // エンターキー対応
  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && !loading) {
      executeSearch();
    }
  }
  
  // 月別分析の実行
  function performMonthlyAnalysis() {
    if (!selectedYear || !selectedMonth) {
      alert('年と月を選択してください');
      return;
    }
    
    // 指定年月のデータを抽出
    const targetYear = parseInt(selectedYear);
    const targetMonth = parseInt(selectedMonth);
    
    const monthData = allData.filter(item => {
      if (!item.rawDate) return false;
      const itemYear = item.rawDate.getFullYear();
      const itemMonth = item.rawDate.getMonth() + 1;
      return itemYear === targetYear && itemMonth === targetMonth;
    });
    
    // 検索条件も適用
    let filteredMonthData = [...monthData];
    if (searchInput.trim()) {
      const keyword = searchInput.trim().toLowerCase();
      const { title, content, answer } = searchFields;
      
      filteredMonthData = filteredMonthData.filter(item => {
        let hit = false;
        if (title) {
          hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
        }
        if (content) {
          hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
        }
        if (answer) {
          hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
        }
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
      totalRaw: monthData.length
    });
    
    setMakerAnalysis({
      makers: makerData,
      total: filteredMonthData.length
    });
    
    setCurrentView('analysis');
  }
  
  // キーワード分析の実行
  function performKeywordAnalysis() {
    if (!searchInput.trim()) {
      alert('検索キーワードを入力してください');
      return;
    }
    
    setLoading(true);
    
    try {
      // キーワードに一致するデータを抽出
      const keyword = searchInput.trim().toLowerCase();
      const { title, content, answer } = searchFields;
      
      let keywordData = allData.filter(item => {
        let hit = false;
        if (title) {
          hit = hit || String(item.題名 || '').toLowerCase().includes(keyword);
        }
        if (content) {
          hit = hit || String(item.内容 || '').toLowerCase().includes(keyword);
        }
        if (answer) {
          hit = hit || String(item.回答 || '').toLowerCase().includes(keyword);
        }
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
      
      // 時系列データを配列に変換して日付順にソート
      const timeSeriesArray = Object.entries(timeSeriesData)
        .map(([date, count]) => {
          const [year, month] = date.split('/').map(Number);
          return { date, year, month, count };
        })
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
      
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
        .slice(0, 10); // 上位10件のみ表示
      
      // キーワード関連の問題パターンを分析（タイトルの頻出パターン）
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
        .slice(0, 10); // 上位10件のみ表示
      
      // 分析結果をセット
      setKeywordAnalysis({
        keyword: searchInput,
        total: keywordData.length,
        timeSeries: timeSeriesArray,
        cities: cities,
        makers: makerData,
        models: models,
        commonTitles: commonTitles,
        data: keywordData // 生データも保存
      });
      
      // ビューを切り替え
      setCurrentView('keyword-analysis');
      
    } catch (error) {
      console.error('キーワード分析エラー:', error);
      alert('分析中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }
  
  // 複数選択の処理
  function toggleItemSelection(id) {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }
  
  // 全選択/解除処理
  function toggleSelectAll() {
    if (selectedItems.size === paginatedData.length) {
      // 全解除
      setSelectedItems(new Set());
    } else {
      // 全選択（現在のページのみ）
      setSelectedItems(new Set(paginatedData.map(item => item.id)));
    }
  }
  
  // 選択されたアイテムをコピー
  function copySelectedItems() {
    try {
      const selectedData = displayData.filter(item => selectedItems.has(item.id));
      if (selectedData.length === 0) {
        alert('コピーする項目が選択されていません');
        return;
      }
      
      const headers = ['日付', '題名', '機種', '内容', '回答'];
      const rows = selectedData.map(item => [
        item.問合日時 || '',
        item.題名 || '',
        item.機種 || '',
        item.内容 || '',
        item.回答 || ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join('\t'))
        .join('\n');
      
      navigator.clipboard.writeText(csvContent)
        .then(() => {
          alert(`${selectedData.length}行をコピーしました`);
        })
        .catch((err) => {
          console.error('コピーエラー:', err);
          alert('コピーに失敗しました。ブラウザの設定を確認してください。');
        });
    } catch (error) {
      console.error('コピー処理エラー:', error);
      alert('コピー処理中にエラーが発生しました');
    }
  }
  
  // CSVダウンロード機能
  function downloadCSV(data = null) {
    try {
      // 対象データを決定（引数で渡された場合はそれを、なければ選択中または表示中のデータを使用）
      const targetData = data ? data : 
                        selectedItems.size > 0 ? displayData.filter(item => selectedItems.has(item.id)) : 
                        displayData;
        
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
      
      // ファイル名を設定（検索条件などを含める）
      let filename = '問い合わせデータ';
      if (searchApplied && searchInput) {
        filename += `_${searchInput}`;
      }
      if (selectedYear) {
        filename += `_${selectedYear}年`;
        if (selectedMonth) {
          filename += `${selectedMonth}月`;
        }
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
  
  // 検索条件のリセット
  function resetFilters() {
    setSearchInput('');
    setSelectedMaker('');
    setSearchFields({
      title: true,
      content: true,
      answer: true,
    });
    setDisplayData(allData);
    setSearchApplied(false);
    setSelectedItems(new Set());
    setCurrentPage(1);
  }
  
  // ページネーション処理
  const pageCount = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return displayData.slice(start, end);
  }, [displayData, currentPage, itemsPerPage]);
  
  // ページ移動
  function changePage(newPage) {
    if (newPage >= 1 && newPage <= pageCount) {
      setCurrentPage(newPage);
    }
  }

  // 詳細モーダル
  function DetailModal({ item, onClose }) {
    if (!item) return null;
    
    // 前後のアイテムへの移動
    function navigateToPrevious() {
      const currentIndex = displayData.findIndex(i => i.id === item.id);
      if (currentIndex > 0) {
        setSelectedItem(displayData[currentIndex - 1]);
      }
    }
    
    function navigateToNext() {
      const currentIndex = displayData.findIndex(i => i.id === item.id);
      if (currentIndex < displayData.length - 1) {
        setSelectedItem(displayData[currentIndex + 1]);
      }
    }
    
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
            
            <div className="flex gap-2">
              <button 
                onClick={navigateToPrevious}
                disabled={displayData.findIndex(i => i.id === item.id) <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                前へ
              </button>
              <button 
                onClick={navigateToNext}
                disabled={displayData.findIndex(i => i.id === item.id) >= displayData.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

  // グラフのレンダリング (簡易バージョン)
  function renderBarChart(data, valueKey, labelKey, maxBars = 10) {
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
  
  // 円グラフのレンダリング (簡易バージョン - CSSのみ)
  function renderPieChart(data, valueKey, labelKey, maxSlices = 5) {
    const chartData = data.slice(0, maxSlices);
    const total = chartData.reduce((sum, item) => sum + item[valueKey], 0);
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#0ea5e9', '#6366f1'];
    
    let cumulativePercent = 0;
    
    return (
      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {chartData.map((item, index) => {
              const percent = (item[valueKey] / total) * 100;
              const startPercent = cumulativePercent;
              cumulativePercent += percent;
              
              return (
                <div 
                  key={index} 
                  className="absolute inset-0"
                  style={{
                    background: colors[index % colors.length],
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * startPercent / 100)}% ${50 + 50 * Math.sin(2 * Math.PI * startPercent / 100)}%, ${50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100)}% ${50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100)}%, 50% 50%)`
                  }}
                ></div>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm truncate max-w-[150px]">{item[labelKey]}</span>
              <span className="text-sm text-gray-600">{((item[valueKey] / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 折れ線グラフのレンダリング (時系列データ用)
  function renderLineChart(data, valueKey = 'count', labelKey =
