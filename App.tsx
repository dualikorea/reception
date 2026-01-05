
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  PlusCircle, 
  BarChart3, 
  BrainCircuit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  X
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Category, Status, ProcessType, RequestItem } from './types';
import { getAIDiagnosis } from './services/geminiService';

// --- Helper Components ---

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: any, colorClass: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'receive' | 'process'>('dashboard');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<RequestItem>>({
    category: Category.REPAIR,
    status: Status.PENDING,
    receiveDate: new Date().toISOString().split('T')[0],
    qty: 1
  });

  // AI Advice States
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<{ [id: string]: string }>({});

  // Initialize Data
  useEffect(() => {
    const saved = localStorage.getItem('smart-ledger-data');
    if (saved) {
      setRequests(JSON.parse(saved));
    } else {
      // Sample data
      const sample: RequestItem[] = [
        {
          id: '1',
          category: Category.REPAIR,
          customer: '삼성전자',
          receiveDate: '2024-05-15',
          product: 'OLED 패널',
          qty: 10,
          issue: '화면 잔상 현상 및 데드픽셀 발생',
          buyDate: '2023-10-01',
          status: Status.PENDING
        },
        {
          id: '2',
          category: Category.DEVELOPMENT,
          customer: 'LG 이노텍',
          receiveDate: '2024-05-16',
          product: '카메라 모듈 v2',
          qty: 1,
          issue: '저조도 노이즈 개선 펌웨어 개발 요청',
          buyDate: '2024-01-10',
          status: Status.IN_PROGRESS
        }
      ];
      setRequests(sample);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smart-ledger-data', JSON.stringify(requests));
  }, [requests]);

  // Derived Stats
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === Status.PENDING).length,
      inProgress: requests.filter(r => r.status === Status.IN_PROGRESS).length,
      completed: requests.filter(r => r.status === Status.COMPLETED).length
    };
  }, [requests]);

  const chartData = useMemo(() => [
    { name: '미정', value: stats.pending, color: '#f59e0b' },
    { name: '진행중', value: stats.inProgress, color: '#3b82f6' },
    { name: '완료', value: stats.completed, color: '#10b981' },
  ], [stats]);

  // Handlers
  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const item: RequestItem = {
      ...newRequest as RequestItem,
      id: Date.now().toString(),
    };
    setRequests(prev => [item, ...prev]);
    setShowAddForm(false);
    setNewRequest({
      category: Category.REPAIR,
      status: Status.PENDING,
      receiveDate: new Date().toISOString().split('T')[0],
      qty: 1
    });
    setActiveTab('receive');
  };

  const updateRequest = (id: string, updates: Partial<RequestItem>) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates };
        if (updates.status === Status.COMPLETED && !updated.processDate) {
          updated.processDate = new Date().toISOString().split('T')[0];
        }
        return updated;
      }
      return r;
    }));
  };

  const deleteRequest = (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAIDiagnosis = async (item: RequestItem) => {
    setAiLoading(item.id);
    const result = await getAIDiagnosis(item.issue, item.product);
    setAiAdvice(prev => ({ ...prev, [item.id]: result }));
    setAiLoading(null);
  };

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filterCategory === 'all' || r.category === filterCategory;
    const matchesSearch = r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.issue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-4">
        <div className="flex items-center gap-3 mb-10 px-2 pt-4">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Smart Ledger</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">대시보드</span>
          </button>
          <button 
            onClick={() => setActiveTab('receive')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'receive' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">접수 내역</span>
          </button>
          <button 
            onClick={() => setActiveTab('process')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'process' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">처리 현황</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            신규 접수
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">
              {activeTab === 'dashboard' ? '운영 현황 대시보드' : activeTab === 'receive' ? '신규 접수 현황' : '처리 관리 시스템'}
            </h2>
            <p className="text-slate-500">데이터를 실시간으로 관리하고 분석합니다.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
              <input 
                type="text" 
                placeholder="검색..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">전체 구분</option>
              <option value={Category.REPAIR}>{Category.REPAIR}</option>
              <option value={Category.DEVELOPMENT}>{Category.DEVELOPMENT}</option>
            </select>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="총 접수 건수" value={stats.total} icon={ClipboardList} colorClass="bg-slate-700" />
              <StatCard title="대기 중" value={stats.pending} icon={Clock} colorClass="bg-amber-500" />
              <StatCard title="진행 중" value={stats.inProgress} icon={AlertCircle} colorClass="bg-blue-500" />
              <StatCard title="완료 건수" value={stats.completed} icon={CheckCircle2} colorClass="bg-emerald-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  처리 상태 비중
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                  월별 접수량 추이
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'receive' || activeTab === 'process') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">구분 / 고객</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">제품 정보</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">접수일</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">증상 및 요청사항</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map(item => (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-50/50 transition-colors ${item.status === Status.COMPLETED ? 'bg-slate-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${item.category === Category.REPAIR ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                              {item.category}
                            </span>
                            <span className="font-semibold text-slate-900">{item.customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{item.product}</span>
                            <span className="text-xs text-slate-400">수량: {item.qty}개</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.receiveDate}</td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-slate-600" title={item.issue}>
                            {item.issue}
                          </div>
                          {activeTab === 'process' && (
                            <button 
                              onClick={() => handleAIDiagnosis(item)}
                              disabled={aiLoading === item.id}
                              className="mt-2 text-[10px] flex items-center gap-1 text-indigo-600 font-bold uppercase tracking-tighter hover:text-indigo-800 disabled:opacity-50"
                            >
                              <BrainCircuit className={`w-3 h-3 ${aiLoading === item.id ? 'animate-pulse' : ''}`} />
                              {aiLoading === item.id ? 'AI 진단 중...' : 'AI 솔루션 제안'}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={item.status}
                            onChange={(e) => updateRequest(item.id, { status: e.target.value as Status })}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-all ${
                              item.status === Status.COMPLETED ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                              item.status === Status.IN_PROGRESS ? 'bg-blue-50 border-blue-200 text-blue-600' :
                              'bg-amber-50 border-amber-200 text-amber-600'
                            }`}
                          >
                            <option value={Status.PENDING}>{Status.PENDING}</option>
                            <option value={Status.IN_PROGRESS}>{Status.IN_PROGRESS}</option>
                            <option value={Status.COMPLETED}>{Status.COMPLETED}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => deleteRequest(item.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* AI Advice Sub-row */}
                      {aiAdvice[item.id] && (
                        <tr className="bg-indigo-50/30 border-l-4 border-indigo-500">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="flex gap-3 items-start">
                              <div className="bg-indigo-500 p-2 rounded-lg text-white">
                                <BrainCircuit className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-bold text-indigo-900">AI 추천 진단 결과</h4>
                                  <button onClick={() => setAiAdvice(prev => {
                                    const next = {...prev};
                                    delete next[item.id];
                                    return next;
                                  })} className="text-indigo-400 hover:text-indigo-600">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="text-xs text-indigo-800 whitespace-pre-wrap leading-relaxed">
                                  {aiAdvice[item.id]}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* Processing Details Sub-row */}
                      {activeTab === 'process' && item.status !== Status.PENDING && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500">처리 구분:</span>
                                <select 
                                  value={item.processType || ''}
                                  onChange={(e) => updateRequest(item.id, { processType: e.target.value as ProcessType })}
                                  className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="">선택</option>
                                  {Object.values(ProcessType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <span className="font-bold text-slate-500">처리 내역:</span>
                                <input 
                                  type="text"
                                  value={item.processNote || ''}
                                  onChange={(e) => updateRequest(item.id, { processNote: e.target.value })}
                                  placeholder="작업 내용을 입력하세요..."
                                  className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                              {item.processDate && (
                                <div className="flex items-center gap-2 text-slate-500 italic">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  처리 완료일: {item.processDate}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="w-10 h-10 opacity-20" />
                          <p>데이터가 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Request Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <PlusCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold">신규 요청 접수</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="hover:bg-indigo-500 p-2 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddRequest} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">접수 구분</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({...newRequest, category: e.target.value as Category})}
                >
                  <option value={Category.REPAIR}>{Category.REPAIR}</option>
                  <option value={Category.DEVELOPMENT}>{Category.DEVELOPMENT}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">거래처명</label>
                <input 
                  required
                  type="text" 
                  placeholder="예: 현대모비스"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.customer || ''}
                  onChange={(e) => setNewRequest({...newRequest, customer: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">제품명</label>
                <input 
                  required
                  type="text" 
                  placeholder="모델명 또는 제품명"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.product || ''}
                  onChange={(e) => setNewRequest({...newRequest, product: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">수량</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.qty || 1}
                  onChange={(e) => setNewRequest({...newRequest, qty: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-600">증상 및 요청사항</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="고객이 접수한 증상을 상세히 기재하세요."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.issue || ''}
                  onChange={(e) => setNewRequest({...newRequest, issue: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">접수 일자</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.receiveDate || ''}
                  onChange={(e) => setNewRequest({...newRequest, receiveDate: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600">구매/설치 일자</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={newRequest.buyDate || ''}
                  onChange={(e) => setNewRequest({...newRequest, buyDate: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  접수 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
