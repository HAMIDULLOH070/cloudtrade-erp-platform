import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Workflow
} from 'lucide-react';

export const Leads: React.FC = () => {
  const { hasRole } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'NEW',
    value: 5000,
    source: 'Veb-sayt',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leads', {
        params: {
          status: selectedStatus || undefined,
          search: search || undefined,
          page,
          limit: 10
        }
      });
      setLeads(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Lidlarni yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers?limit=100');
      setCustomers(response.data.items);
      if (response.data.items.length > 0) {
        setFormData(prev => ({ ...prev, customerId: response.data.items[0].id }));
      }
    } catch (err) {
      console.error('Mijozlar ro\'yxatini yuklashda xatolik yuz berdi.', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus, search, page]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      customerId: customers[0]?.id || '',
      status: 'NEW',
      value: 10000,
      source: 'Veb-sayt',
      notes: ''
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (l: any) => {
    setEditId(l.id);
    setFormData({
      customerId: l.customerId,
      status: l.status,
      value: l.value,
      source: l.source,
      notes: l.notes || ''
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu lid ma\'lumotlarini o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lidni o\'chirish muvaffaqiyatsiz tugadi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editId) {
        await api.put(`/leads/${editId}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      setShowModal(false);
      fetchLeads();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lid ma\'lumotlarini saqlash muvaffaqiyatsiz tugadi.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'CONTACTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROPOSAL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'NEGOTIATION': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WON': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOST': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const getSourceLabel = (src: string) => {
    switch (src) {
      case 'Referral':
      case 'Tavsiya':
        return 'Tavsiya';
      case 'Trade Show':
      case 'Ko\'rgazma':
        return 'Ko\'rgazma';
      case 'Website':
      case 'Veb-sayt':
        return 'Veb-sayt';
      case 'Cold Call':
      case 'Sovuq qo\'ng\'iroq':
        return 'Sovuq qo\'ng\'iroq';
      default:
        return src;
    }
  };

  const isSalesOrAdmin = hasRole(['Admin', 'Sales Staff', 'Manager']);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 font-sans">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center flex-grow max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Mijoz kompaniyasi, eslatmalar yoki manba bo'yicha qidirish..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-success"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-success appearance-none bg-white"
            >
              <option value="">Barcha bosqichlar</option>
              <option value="NEW">Yangi</option>
              <option value="CONTACTED">Bog'lanilgan</option>
              <option value="PROPOSAL">Taklif yuborilgan</option>
              <option value="NEGOTIATION">Muzokara</option>
              <option value="WON">Yutib olingan</option>
              <option value="LOST">Yo'qotilgan</option>
            </select>
          </div>
        </div>

        {isSalesOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow flex items-center transition-colors self-start sm:self-center"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Lid qo'shish
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4 py-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Sotuv voronkasida (pipeline) lidlar topilmadi.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Mijoz (Chakana savdo)</th>
                <th className="py-3 px-4">Bosqich holati</th>
                <th className="py-3 px-4 text-right">Potensial qiymati</th>
                <th className="py-3 px-4">Tavsiya manbai</th>
                <th className="py-3 px-4">Eslatmalar</th>
                {isSalesOrAdmin && <th className="py-3 px-4 text-center">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{l.customer.name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(l.status)}`}>
                      <Workflow className="h-3 w-3 mr-1" />
                      {getStatusLabel(l.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">${l.value.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-555 font-medium">{getSourceLabel(l.source)}</td>
                  <td className="py-3.5 px-4 text-slate-555 max-w-xs truncate">{l.notes || 'Eslatmalar qo\'shilmagan'}</td>
                  {isSalesOrAdmin && (
                    <td className="py-3.5 px-4 text-center space-x-2">
                      <button onClick={() => handleOpenEdit(l)} className="p-1 text-slate-400 hover:text-brand-700 hover:bg-slate-100 rounded">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {hasRole(['Admin', 'Manager']) && (
                        <button onClick={() => handleDelete(l.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
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

      {/* Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editId ? 'Lid holatini o\'zgartirish' : 'Yangi CRM lidi qo\'shish'}
            </h3>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maqsadli B2B mijoz</label>
                <select
                  required
                  disabled={!!editId}
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success disabled:bg-slate-100"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lid bosqichi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="NEW">Yangi</option>
                    <option value="CONTACTED">Bog'lanilgan</option>
                    <option value="PROPOSAL">Taklif yuborilgan</option>
                    <option value="NEGOTIATION">Muzokara</option>
                    <option value="WON">Yutib olingan</option>
                    <option value="LOST">Yo'qotilgan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Taxminiy qiymati ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tavsiya manbai</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success bg-white"
                >
                  <option value="Veb-sayt">Veb-sayt</option>
                  <option value="Tavsiya">Tavsiya</option>
                  <option value="Ko'rgazma">Ko'rgazma</option>
                  <option value="Sovuq qo'ng'iroq">Sovuq qo'ng'iroq</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Suhbat eslatmalari</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success h-20"
                  placeholder="Mijoz fikr-mulohazalari yoki so'ralgan kataloglar..."
                />
              </div>

              <div className="pt-3 border-t border-slate-150 flex justify-end space-x-3">
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
                  Lidni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Leads;
