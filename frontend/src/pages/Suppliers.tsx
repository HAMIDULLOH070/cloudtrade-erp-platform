import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const Suppliers: React.FC = () => {
  const { hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/suppliers', {
        params: {
          search: search || undefined,
          page,
          limit: 10
        }
      });
      setSuppliers(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Yetkazib beruvchilarni yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, page]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: ''
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditId(s.id);
    setFormData({
      name: s.name,
      contactName: s.contactName || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || ''
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu yetkazib beruvchi ma\'lumotlarini o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Yetkazib beruvchini o\'chirish muvaffaqiyatsiz tugadi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editId) {
        await api.put(`/suppliers/${editId}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Yetkazib beruvchi ma\'lumotlarini saqlash muvaffaqiyatsiz tugadi.');
    }
  };

  const isFinancialOrAdmin = hasRole(['Admin', 'Accountant', 'Manager']);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 font-sans">
      {/* Search and Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Yetkazib beruvchi nomi, kontakt yoki e-mail bo'yicha qidirish..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-success"
          />
        </div>

        {isFinancialOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow flex items-center transition-colors self-start sm:self-center"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Yetkazib beruvchi qo'shish
          </button>
        )}
      </div>

      {/* Grid Layout of Suppliers cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Yetkazib beruvchilar topilmadi.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => (
            <div key={s.id} className="border border-slate-200 rounded-lg p-5 bg-slate-50/20 hover:bg-slate-50/50 hover:shadow-sm transition-all duration-150 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{s.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Vakil: {s.contactName || 'Mavjud emas'}</p>
                </div>
                {isFinancialOrAdmin && (
                  <div className="flex space-x-1">
                    <button onClick={() => handleOpenEdit(s)} className="p-1 text-slate-400 hover:text-brand-700 hover:bg-slate-150 rounded">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {hasRole(['Admin', 'Manager']) && (
                      <button onClick={() => handleDelete(s.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-150 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs text-slate-650">
                <div className="flex items-center"><Mail className="h-3.5 w-3.5 text-slate-400 mr-2" /> {s.email || 'N/A'}</div>
                <div className="flex items-center"><Phone className="h-3.5 w-3.5 text-slate-400 mr-2" /> {s.phone || 'N/A'}</div>
                <div className="flex items-start"><MapPin className="h-3.5 w-3.5 text-slate-400 mr-2 mt-0.5" /> <span className="leading-snug">{s.address || 'N/A'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-150 pt-4 text-slate-500 text-xs">
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

      {/* Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editId ? 'Yetkazib beruvchi ma\'lumotlarini tahrirlash' : 'Yangi yetkazib beruvchi qo\'shish'}
            </h3>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yetkazib beruvchi tashkilot nomi</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="Apex Textiles Ltd"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mas'ul shaxs (Kontakt)</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="sales@apex.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon raqami</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="+998-90-123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Manzil</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success h-20"
                  placeholder="Toshkent shahri, Chorsu bozori"
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
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
