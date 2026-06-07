import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft
} from 'lucide-react';

export const WarehouseMovements: React.FC = () => {
  const [movements, setMovements] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouse/movements', {
        params: {
          type: selectedType || undefined,
          page,
          limit: 15
        }
      });
      setMovements(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to load movements log', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [selectedType, page]);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'INCOMING': return <ArrowDownCircle className="h-5 w-5 text-emerald-600" />;
      case 'OUTGOING': return <ArrowUpCircle className="h-5 w-5 text-blue-600" />;
      case 'TRANSFER': return <ArrowRightLeft className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOMING': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OUTGOING': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TRANSFER': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INCOMING': return 'KIRIM';
      case 'OUTGOING': return 'CHIQIM';
      case 'TRANSFER': return 'KO\'CHIRISH';
      default: return type;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 font-sans">
      {/* Filtering */}
      <div className="flex justify-between items-center">
        <div className="relative w-48">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-success appearance-none bg-white"
          >
            <option value="">Barcha operatsiyalar</option>
            <option value="INCOMING">Kirim zaxirasi</option>
            <option value="OUTGOING">Chiqim zaxirasi</option>
            <option value="TRANSFER">Ichki ko'chirishlar</option>
          </select>
        </div>
        <span className="text-xs font-semibold text-slate-500">Tezkor operatsiyalar daftari</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4 py-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Hozircha tovarlar harakati qayd etilmagan.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-4 text-center">Turi</th>
                <th className="py-3 px-4">Mahsulot ma'lumotlari</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Miqdor</th>
                <th className="py-3 px-4">Ombor zonalari</th>
                <th className="py-3 px-4">Bajaruvchi</th>
                <th className="py-3 px-4">Vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getTypeColor(m.type)}`}>
                      {getMovementIcon(m.type)}
                      <span className="ml-1">{getTypeLabel(m.type)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{m.product.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{m.product.sku}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">{m.quantity} dona</td>
                  <td className="py-3.5 px-4 text-slate-555 font-medium">
                    {m.type === 'TRANSFER' && `${m.fromZone} ➔ ${m.toZone}`}
                    {m.type === 'INCOMING' && `➔ ${m.toZone}`}
                    {m.type === 'OUTGOING' && `${m.fromZone} ➔`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">
                    {m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Tizim tomonidan'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-450">{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-150 pt-4 text-slate-555 text-xs">
          <span>{page}-sahifa, jamisi {totalPages}</span>
          <div className="flex space-x-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 border border-slate-350 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 border border-slate-350 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
