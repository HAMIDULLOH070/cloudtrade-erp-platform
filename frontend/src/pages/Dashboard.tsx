import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Activity,
  Server,
  TrendingUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [cloudStatus, setCloudStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, cloudRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/cloud/status')
        ]);
        setStats(statsRes.data);
        setCloudStatus(cloudRes.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-10 h-10 bg-slate-200 rounded-full mb-3" />
              <div className="h-4 bg-slate-200 w-2/3 rounded mb-2" />
              <div className="h-6 bg-slate-200 w-1/2 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white border border-slate-200 rounded-lg p-5" />
          <div className="h-96 bg-white border border-slate-200 rounded-lg p-5" />
        </div>
      </div>
    );
  }

  const { metrics, charts, recentActivities } = stats;

  const COLORS = ['#10b981', '#8b5cf6', '#ef4444'];

  const statsCards = [
    {
      name: 'Umumiy tushum',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      subtext: `Yillik: $${metrics.yearlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      name: 'Sotuv buyurtmalari',
      value: metrics.totalOrders,
      subtext: `${metrics.completedOrders} yakunlandi / ${metrics.pendingOrders} kutilmoqda`,
      icon: ShoppingCart,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      name: 'B2B Mijozlar',
      value: metrics.totalCustomers,
      subtext: `${metrics.activeCustomers} faol xaridor`,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      name: 'Ombor bandligi',
      value: `${metrics.warehouseCapacityUsage}%`,
      subtext: `${metrics.lowStockProducts} ta kam zaxirali tovar`,
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin': return 'Admin';
      case 'Manager': return 'Menejer';
      case 'Warehouse Staff': return 'Ombor xodimi';
      case 'Sales Staff': return 'Sotuvchi';
      case 'Accountant': return 'Hisobchi';
      default: return role;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'Login': return 'Tizimga kirish';
      case 'Create Order': return 'Buyurtma yaratish';
      case 'Record Payment': return 'To\'lov yozish';
      case 'Stock Transfer': return 'Zaxira ko\'chirish';
      case 'User Creation': return 'Foydalanuvchi ochish';
      case 'System Setup': return 'Tizim o\'rnatish';
      case 'Lead Status Update': return 'Lid holatini o\'zgartirish';
      case 'Customer Note': return 'Mijoz eslatmasi';
      case 'Invoice Published': return 'Faktura yuborish';
      case 'Payment Verification': return 'To\'lovni tasdiqlash';
      case 'Report Export': return 'Hisobotni yuklash';
      case 'PO Approval': return 'Xarid buyurtmasini tasdiqlash';
      default: return action;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloud Health Header Alert */}
      {cloudStatus && (
        <div className={`border rounded-lg p-4 flex items-center justify-between shadow-sm ${
          cloudStatus.status === 'HEALTHY' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center space-x-3">
            <Server className={`h-6 w-6 ${cloudStatus.status === 'HEALTHY' ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-sm font-bold">Bulutli infratuzilma holati: {cloudStatus.status === 'HEALTHY' ? 'SOG\'LOM' : 'DEGRADASIYA'}</p>
              <p className="text-xs opacity-90">
                API tezligi: <span className="font-semibold">{cloudStatus.apiResponseTime}ms</span> | CPU yuklamasi: <span className="font-semibold">{cloudStatus.cpuUsage}%</span> | Tarmoq ishlash foizi: <span className="font-semibold">{cloudStatus.uptime}%</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`h-2.5 w-2.5 rounded-full animate-ping ${cloudStatus.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-650">Simulyatsiya faol</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Month */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-950 text-base">Oylik tushum dinamikasi</h3>
            <span className="text-xs font-semibold text-success bg-emerald-50 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> Oxirgi 12 oy
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.salesByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Tushum']} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Status distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-bold text-slate-950 text-base mb-4">Buyurtmalar holati</h3>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {charts.ordersByStatus.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Details Tables & Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-950 text-base">Eng ko'p sotilgan mahsulotlar</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left font-semibold text-slate-500 bg-slate-50/50">
                  <th className="py-2.5 px-3">Mahsulot nomi</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Sotilgan soni</th>
                  <th className="py-2.5 px-3 text-right">Daromad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {charts.topSellingProducts.map((p: any) => (
                  <tr key={p.sku} className="hover:bg-slate-50/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">{p.qty} dona</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">${p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log / Recent activities */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base flex items-center">
            <Activity className="h-4.5 w-4.5 mr-2 text-slate-550" /> Oxirgi operatsiyalar
          </h3>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {recentActivities.map((act: any) => (
              <div key={act.id} className="border-l-2 border-slate-200 pl-3.5 py-0.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{getActionLabel(act.action)}</span>
                  <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{act.details}</p>
                <p className="text-[10px] font-semibold text-brand-500">Xodim: {act.user}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
