import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Warehouse,
  FileCheck,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const ERPDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchERPData = async () => {
      try {
        const response = await api.get('/reports/erp');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load ERP statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchERPData();
  }, []);

  if (loading || !data) {
    return <div className="h-96 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />;
  }

  const { summary, stockValuation, invoiceSummary, monthlyPL } = data;

  const financialCards = [
    { name: 'Yalpi tushum', value: `$${summary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', desc: 'Jami sotilgan fakturalar' },
    { name: 'Tovar tannarxi (COGS)', value: `$${summary.totalCOGS.toLocaleString()}`, icon: Briefcase, color: 'bg-violet-50 text-violet-600', desc: 'Zaxira sotib olish qiymati' },
    { name: 'Yalpi foyda marjasi', value: `${summary.grossProfitMargin}%`, icon: Percent, color: 'bg-teal-50 text-teal-600', desc: `Yalpi foyda: $${summary.grossProfit.toLocaleString()}` },
    { name: 'Operatsion xarajatlar', value: `$${summary.totalExpenses.toLocaleString()}`, icon: Briefcase, color: 'bg-rose-50 text-rose-600', desc: 'Oylik ish haqi, ijara, kommunal' },
    { name: 'Sof foyda', value: `$${summary.netProfit.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', desc: `Sof foyda marjasi: ${summary.netProfitMargin}%` },
    { name: 'Tovar zaxirasi tannarxi', value: `$${stockValuation.totalCost.toLocaleString()}`, icon: Warehouse, color: 'bg-amber-50 text-amber-600', desc: `Bozor qiymati: $${stockValuation.totalRetailValue.toLocaleString()}` }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {financialCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-full ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Chart & Invoice Collection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-950 text-base">Oylik tushum, tannarx va OpEx taqqoslamasi</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`]} />
                <Legend />
                <Bar dataKey="revenue" name="Sotuv tushumi" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cogs" name="Tovar tannarxi (COGS)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="OpEx xarajatlar" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Summary Ledger */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-950 text-base flex items-center">
            <FileCheck className="h-4.5 w-4.5 mr-2 text-slate-500" /> Fakturalar va debitorlik qarzlar kitobi
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>TO'LANGAN FAKTURALAR</span>
                <span className="text-emerald-600 font-bold">${invoiceSummary.paid.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(invoiceSummary.paid / invoiceSummary.total) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>TO'LANMAGAN QARZLAR</span>
                <span className="text-amber-600 font-bold">${invoiceSummary.unpaid.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(invoiceSummary.unpaid / invoiceSummary.total) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>MUDDATI O'TGAN QARZLAR</span>
                <span className="text-rose-600 font-bold">${invoiceSummary.overdue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${(invoiceSummary.overdue / invoiceSummary.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-sm font-bold text-slate-900">
              <span>Umumiy balans summasi:</span>
              <span>${invoiceSummary.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ERPDashboard;
