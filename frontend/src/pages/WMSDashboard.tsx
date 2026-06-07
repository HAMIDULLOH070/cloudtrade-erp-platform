import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Building2,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const WMSDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Form State
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [fromZone, setFromZone] = useState('ZONE-A');
  const [toZone, setToZone] = useState('ZONE-B');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [reportRes, zonesRes, lowRes, prodRes] = await Promise.all([
        api.get('/reports/wms'),
        api.get('/warehouse/zones'),
        api.get('/warehouse/low-stock'),
        api.get('/products?limit=100') // fetch products for dropdown
      ]);
      setReportData(reportRes.data);
      setZones(zonesRes.data);
      setLowStock(lowRes.data);
      setProducts(prodRes.data.items);
    } catch (err) {
      console.error('Failed to load WMS data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(false);

    try {
      await api.post('/warehouse/transfers', {
        productId: selectedProduct,
        quantity,
        fromZone,
        toZone
      });
      setTransferSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setTransferSuccess(false);
        setSelectedProduct('');
      }, 1500);
      fetchData(); // reload stats
    } catch (err: any) {
      setTransferError(err.response?.data?.message || 'Zaxirani ko\'chirish muvaffaqiyatsiz tugadi. Zaxira miqdorini tekshiring.');
    }
  };

  if (loading || !reportData) {
    return <div className="h-96 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />;
  }

  const { summary, monthlyMovements } = reportData;

  const movementCards = [
    { name: 'Jami operatsiyalar jurnallari', value: summary.total, icon: FileSpreadsheet, color: 'bg-fuchsia-50 text-fuchsia-600' },
    { name: 'Kirim zaxira operatsiyalari', value: summary.incoming, icon: ArrowDownCircle, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Chiqim zaxira operatsiyalari', value: summary.outgoing, icon: ArrowUpCircle, color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {movementCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.name} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-full ${c.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warehouse Layout Map (Zones) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-950 text-base flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-slate-500" /> Ombor zonalari bandligi
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-success hover:bg-success/90 text-white rounded-md text-xs font-bold shadow flex items-center transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" /> Zaxirani ko'chirish
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map((zone) => {
            const usagePercent = Math.round((zone.currentUsage / zone.capacity) * 100);
            return (
              <div key={zone.code} className="border border-slate-200 rounded-lg p-4 bg-slate-50/55 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{zone.name}</h4>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">{zone.code}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    usagePercent > 85 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {usagePercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${usagePercent > 85 ? 'bg-rose-500' : 'bg-success'}`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Foydalanilmoqda: {zone.currentUsage} dona</span>
                  <span>Sig'imi: {zone.capacity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement Chart & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movements Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-950 text-base">Oylik tovarlar harakati hajmi</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyMovements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="incoming" name="Kirim zaxira" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="outgoing" name="Chiqim zaxira" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 overflow-y-auto max-h-[380px]">
          <h3 className="font-bold text-slate-950 text-base flex items-center text-amber-700">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" /> Kam qolgan tovarlar
          </h3>
          {lowStock.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">Barcha mahsulotlar zaxirasi yetarli darajada.</div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((prod) => (
                <div key={prod.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/40 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{prod.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.sku} | {prod.category}</p>
                    <p className="text-[10px] text-slate-550 font-semibold mt-0.5">Yetkazib beruvchi: {prod.supplier.name}</p>
                  </div>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2 py-1 rounded">
                    {prod.quantityInStock} dona qoldi
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <ArrowRightLeft className="h-5 w-5 mr-2 text-success" /> Ichki zaxira ko'chirish
            </h3>
            {transferSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm text-emerald-800 font-semibold">
                Zaxira muvaffaqiyatli ko'chirildi!
              </div>
            )}
            {transferError && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-sm text-rose-800">
                {transferError}
              </div>
            )}
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mahsulotni tanlang</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                >
                  <option value="">-- Mahsulotni tanlash --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Zaxira: {p.quantityInStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ko'chirish miqdori</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chiquvchi zona</label>
                  <select
                    value={fromZone}
                    onChange={(e) => setFromZone(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    {zones.map(z => <option key={z.code} value={z.code}>{z.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kiruvchi zona</label>
                  <select
                    value={toZone}
                    onChange={(e) => setToZone(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    {zones.map(z => <option key={z.code} value={z.code}>{z.code}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow"
                >
                  Ko'chirishni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
