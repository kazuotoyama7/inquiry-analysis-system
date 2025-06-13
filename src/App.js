import React, { useState, useEffect } from 'react';
import { Search, Filter, BarChart3, Eye, ChevronLeft, ChevronRight, Copy, Loader2 } from 'lucide-react';
import './App.css';

const InquiryAnalysisApp = () => {
  // APIエンドポイント
  const API_URL = 'https://script.google.com/macros/s/AKfycbxOJsztqvr2_h1Kl02ZvW2ttYuLYwOhCWX_5RoL9eea8CXPLu_7zc_tbjWxvoiYwiXm/exec';

  // State管理
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [makers, setMakers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    response: true
  });
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentView, setCurrentView] = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // APIからデータを取得
  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        action: 'getData',
        ...params
      });
      
      const response = await fetch(`${API_URL}?${queryParams}`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // データ形式を統一
      const formattedData = result.data.map(item => ({
        id: item['ユーザーID'] || Math.random(),
        題名: item['回答題名'] || '',
        機種: item['Model'] || '',
        内容: item['相談内容'] || '',
        回答: item['回答'] || '',
        問合日時: new Date(item['問合日時']).toISOString().split('T')[0],
        ユーザーID: item['ユーザーID'] || '',
        登録市区町村: item['登録市区町村'] || '不明',
        Platform: item['Platform'] || '',
        問合種別: item['問合種別'] || ''
      }));
      
      setData(formattedData);
      setError(null);
    } catch (err) {
      setError(`データの取得に失敗しました: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // メーカー一覧を取得
  const fetchMakers = async () => {
    try {
      const response = await fetch(`${API_URL}?action=getMakers`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setMakers(result.makers || []);
    } catch (err) {
      console.error('Makers fetch error:', err);
    }
  };

  // 月別分析を取得
  const fetchAnalysis = async () => {
    if (!selectedYear || !selectedMonth) return;
    
    try {
      setAnalysisLoading(true);
      const queryParams = new URLSearchParams({
        action: 'getAnalysis',
        year: selectedYear,
        month: selectedMonth,
        searchTerm: searchTerm,
        searchTitle: searchFields.title,
        searchContent: searchFields.content,
        searchResponse: searchFields.response,
        maker: selectedMaker
      });
      
      const response = await fetch(`${API_URL}?${queryParams}`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setMonthlyAnalysis(result);
    } catch (err) {
      console.error('Analysis fetch error:', err);
      setMonthlyAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchData();
    fetchMakers();
  }, []);

  // 検索・フィルタリング
  const performFilter = () => {
    const params = {};
    
    if (searchTerm) {
      params.searchTerm = searchTerm;
      params.searchTitle = searchFields.title;
