import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  Printer,
  Calendar,
  Building,
  Users,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'finance' | 'warehouse' | 'crm'>('finance');
  
  // Data State
  const [financeData, setFinanceData] = useState<any>(null);
  const [wmsData, setWmsData] = useState<any>(null);
  const [crmData, setCrmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedReport === 'finance') {
        const res = await api.get('/reports/erp');
        setFinanceData(res.data);
      } else if (selectedReport === 'warehouse') {
        const res = await api.get('/reports/wms');
        setWmsData(res.data);
      } else if (selectedReport === 'crm') {
        const res = await api.get('/reports/crm');
        setCrmData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedReport]);

  const handlePrint = () => {
    window.print();
  };

  const getCrmStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW': return 'YANGI';
      case 'CONTACTED': return 'BOG\'LANILGAN';
      case 'PROPOSAL': return 'TAKLIF';
      case 'NEGOTIATION': return 'MUZOKARA';
      case 'WON': return 'YUTIB OLINGAN';
      case 'LOST': return 'YO\'QOTILGAN';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:bg-white">
      {/* Report Selector & Print actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-brand-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Tahliliy hisobotni tanlang</h3>
            <p className="text-xs text-slate-400">Oylik va yillik ma'lumotlar hisobotini shakllantirish</p>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="pl-3 pr-8 py-2 border border-slate-350 rounded-md text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-success appearance-none bg-white cursor-pointer"
            >
              <option value="finance">Moliyaviy foyda va zarar (P&L) hisoboti</option>
              <option value="warehouse">Ombor zaxiralari harakati hisoboti</option>
              <option value="crm">CRM mijozlar o'sishi va sotuv voronkasi</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-slate-300 rounded-md text-xs font-bold text-slate-650 hover:bg-slate-50 shadow-sm flex items-center transition-colors"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Hisobotni chop etish
          </button>
        </div>
      </div>

      {/* Main Report Body */}
      {loading ? (
        <div className="h-96 bg-white border border-slate-200 rounded-lg animate-pulse p-6" />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedReport === 'finance' && 'Konsolidatsiyalangan moliyaviy foyda va zarar (P&L) hisoboti'}
              {selectedReport === 'warehouse' && 'Omborda bajarilgan operatsiyalar jurnali hisoboti'}
              {selectedReport === 'crm' && 'CRM sotuv voronkasi va mijozlar bilan aloqalar hisoboti'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ReModule tarqatish kompaniyasi | Davr: <span className="font-semibold text-slate-700">Iyun 2025 - Iyun 2026</span>
            </p>
          </div>

          {/* FINANCE REPORT VIEW */}
          {selectedReport === 'finance' && financeData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Yalpi sotuv tushumi</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">${financeData.summary.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sotilgan tovarlar tannarxi (COGS)</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">${financeData.summary.totalCOGS.toLocaleString()}</span>
                </div>
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Operatsion xarajatlar (OpEx)</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">${financeData.summary.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sotishdan olingan sof foyda</span>
                  <span className={`text-lg font-bold block mt-1 ${financeData.summary.netProfit >= 0 ? 'text-success' : 'text-rose-600'}`}>
                    ${financeData.summary.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 border border-slate-200 p-4 rounded-lg bg-slate-50/20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeData.monthlyPL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" name="Sotuv tushumi" fill="#10b981" />
                    <Bar dataKey="profit" name="Sof foyda marjasi" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Statement Breakdown Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Moliyaviy hisobot jadvali</h4>
                <div className="overflow-x-auto border border-slate-150 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead>
                      <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3">Hisobot moddasi</th>
                        <th className="py-2.5 px-3 text-right">Qiymati</th>
                        <th className="py-2.5 px-3 text-right">Sotuvga nisbatan %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Ulgurji savdodan olingan yalpi tushum</td>
                        <td className="py-2.5 px-3 text-right font-semibold">${financeData.summary.totalRevenue.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-medium">100.0%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Sotilgan tovarlar tannarxi (COGS)</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">(${financeData.summary.totalCOGS.toLocaleString()})</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {((financeData.summary.totalCOGS / financeData.summary.totalRevenue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50 font-bold text-slate-900">
                        <td className="py-2.5 px-3">Yalpi operatsion marja</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600">${financeData.summary.grossProfit.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">{financeData.summary.grossProfitMargin}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Operatsion xarajatlar (OpEx)</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">(${financeData.summary.totalExpenses.toLocaleString()})</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {((financeData.summary.totalExpenses / financeData.summary.totalRevenue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="py-2.5 px-3 rounded-l">Soliq to'langunga qadar sof foyda</td>
                        <td className="py-2.5 px-3 text-right rounded-none text-emerald-400">${financeData.summary.netProfit.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right rounded-r">{financeData.summary.netProfitMargin}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* WAREHOUSE REPORT VIEW */}
          {selectedReport === 'warehouse' && wmsData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Omborga kirim operatsiyalari</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{wmsData.summary.incoming} ta hodisa</span>
                </div>
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ombordan chiqim operatsiyalari</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{wmsData.summary.outgoing} ta hodisa</span>
                </div>
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ichki zaxira ko'chirishlari</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{wmsData.summary.transfer} ta hodisa</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 border border-slate-200 p-4 rounded-lg bg-slate-50/20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wmsData.monthlyMovements} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incoming" name="Kirim miqdori" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="outgoing" name="Chiqim miqdori" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* CRM REPORT VIEW */}
          {selectedReport === 'crm' && crmData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mijozlarning jami debitorlik qarzi</span>
                  <span className="text-lg font-bold text-rose-600 block mt-1">${crmData.debtMetrics.totalOutstandingDebt.toLocaleString()}</span>
                </div>
                <div className="border border-slate-150 bg-slate-50/25 p-4 rounded-md">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Qarzdorligi bor chakana mijozlar</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{crmData.debtMetrics.customersWithDebt} ta do'kon</span>
                </div>
              </div>

              {/* Pipeline Breakdown Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Lidlar sotuv voronkasi (funnel) qiymatlari</h4>
                <div className="overflow-x-auto border border-slate-150 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead>
                      <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3">Lid bosqichi holati</th>
                        <th className="py-2.5 px-3 text-right">Faol lidlar soni</th>
                        <th className="py-2.5 px-3 text-right">Bosqichning potensial qiymati</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {crmData.pipelineFunnel.map((stage: any) => (
                        <tr key={stage.status}>
                          <td className="py-2.5 px-3 font-semibold">{getCrmStatusLabel(stage.status)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-650">{stage.count} ta lid</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">${stage.value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
