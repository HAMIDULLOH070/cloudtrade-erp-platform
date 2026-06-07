import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Workflow
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const CRMDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCRMData = async () => {
      try {
        const response = await api.get('/reports/crm');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load CRM dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCRMData();
  }, []);

  if (loading || !data) {
    return <div className="h-96 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />;
  }

  const { debtMetrics, customerCategories, pipelineFunnel } = data;

  const COLORS = ['#8b5cf6', '#10b981', '#d946ef', '#f59e0b'];

  const stats = [
    { name: 'Debitorlik qarzlari balansi', value: `$${debtMetrics.totalOutstandingDebt.toLocaleString()}`, icon: DollarSign, color: 'bg-rose-50 text-rose-600', desc: `${debtMetrics.customersWithDebt} ta do'kon qarzdorlikka ega` },
    { name: 'Faol lidlar soni (Pipeline)', value: pipelineFunnel.reduce((sum: number, l: any) => sum + (l.status !== 'WON' && l.status !== 'LOST' ? l.count : 0), 0), icon: Workflow, color: 'bg-violet-50 text-violet-600', desc: `Pipeline jami qiymati: $${pipelineFunnel.reduce((sum: number, l: any) => sum + l.value, 0).toLocaleString()}` },
    { name: 'Mijozlar guruhlari', value: customerCategories.length, icon: Users, color: 'bg-fuchsia-50 text-fuchsia-600', desc: 'B2B Do\'konlar, Butiklar, E-savdo' }
  ];

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'NEW': return 'Yangi';
      case 'CONTACTED': return 'Bog\'lanildi';
      case 'PROPOSAL': return 'Taklif yuborildi';
      case 'NEGOTIATION': return 'Muzokara';
      case 'WON': return 'Yutib olindi';
      case 'LOST': return 'Boy berildi';
      default: return stage;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'B2B Boutique': return 'B2B Butik';
      case 'Wholesale Retailer': return 'Ulgurji xaridor';
      case 'Department Store': return 'Yirik univermag';
      case 'E-commerce': return 'E-Tijorat';
      default: return cat;
    }
  };

  const chartData = pipelineFunnel.map((item: any) => ({
    ...item,
    statusLabel: getStageLabel(item.status)
  }));

  const pieData = customerCategories.map((item: any) => ({
    ...item,
    nameLabel: getCategoryLabel(item.name)
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.name} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-full ${c.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline Funnel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-950 text-base">Muzokaralar quvuri (Pipeline) qiymatlari</h3>
            <Link to="/leads" className="text-xs font-bold text-success hover:underline flex items-center">
              Lidlarni boshqarish <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="statusLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Pipeline Qiymati']} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => {
                    let color = '#8b5cf6';
                    if (entry.status === 'WON') color = '#10b981';
                    if (entry.status === 'LOST') color = '#ef4444';
                    if (entry.status === 'NEGOTIATION') color = '#f59e0b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Categories */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-950 text-base mb-4">Xaridorlar toifalari</h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={65}
                    dataKey="value"
                    nameKey="nameLabel"
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-650 mt-2">
            {pieData.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{item.nameLabel} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CRMDashboard;
