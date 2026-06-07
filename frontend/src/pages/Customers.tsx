import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Customers: React.FC = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
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
    address: '',
    category: 'B2B Butik',
    creditLimit: 15000,
    debt: 0
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers', {
        params: {
          category: selectedCategory || undefined,
          search: search || undefined,
          page,
          limit: 10
        }
      });
      setCustomers(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Mijozlarni yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const catRes = await api.get('/customers/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error('Mijozlar toifalarini yuklashda xatolik yuz berdi.', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedCategory, search, page]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      category: 'B2B Butik',
      creditLimit: 15000,
      debt: 0
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditId(c.id);
    setFormData({
      name: c.name,
      contactName: c.contactName || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      category: c.category,
      creditLimit: c.creditLimit,
      debt: c.debt
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu mijoz ma\'lumotlarini o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Mijozni o\'chirish muvaffaqiyatsiz tugadi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editId) {
        await api.put(`/customers/${editId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      fetchCustomers();
      fetchMetadata();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mijoz ma\'lumotlarini saqlash muvaffaqiyatsiz tugadi.');
    }
  };

  const isSalesOrAdmin = hasRole(['Admin', 'Sales Staff', 'Manager']);

  const getCategoryLabel = (catName: string) => {
    switch (catName) {
      case 'B2B Boutique':
      case 'B2B Butik':
        return 'B2B Butik';
      case 'Wholesale Retailer':
      case 'Ulgurji savdogar':
        return 'Ulgurji savdogar';
      case 'Department Store':
      case 'Univermag':
        return 'Univermag';
      case 'E-commerce':
      case 'E-savdo':
        return 'E-savdo';
      default:
        return catName;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 font-sans">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center flex-grow max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nomi, aloqa shaxsi yoki telefon bo'yicha qidirish..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-success"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-success appearance-none bg-white"
            >
              <option value="">Barcha toifalar</option>
              {categories.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
            </select>
          </div>
        </div>

        {isSalesOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow flex items-center self-start sm:self-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Yangi mijoz qo'shish
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4 py-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Mos keladigan mijozlar topilmadi.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Mijoz nomi</th>
                <th className="py-3 px-4">Mas'ul xodim</th>
                <th className="py-3 px-4">Aloqa (Tel/Email)</th>
                <th className="py-3 px-4">Toifa</th>
                <th className="py-3 px-4 text-right">Kredit limiti</th>
                <th className="py-3 px-4 text-right">Amaldagi qarz</th>
                {isSalesOrAdmin && <th className="py-3 px-4 text-center">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-700">{c.contactName || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-555">
                    <div>{c.phone || '-'}</div>
                    <div className="text-xs text-slate-400">{c.email || '-'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {getCategoryLabel(c.category)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-700">${c.creditLimit.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`font-bold ${c.debt > c.creditLimit ? 'text-rose-600' : c.debt > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                      ${c.debt.toLocaleString()}
                    </span>
                  </td>
                  {isSalesOrAdmin && (
                    <td className="py-3.5 px-4 text-center space-x-2">
                      <button onClick={() => handleOpenEdit(c)} className="p-1 text-slate-400 hover:text-brand-700 hover:bg-slate-100 rounded">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {hasRole(['Admin', 'Manager']) && (
                        <button onClick={() => handleDelete(c.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded">
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editId ? 'Mijoz ma\'lumotlarini tahrirlash' : 'Yangi B2B mijoz qo\'shish'}
            </h3>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mijoz do'kon nomi</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="Premium Apparel LLC"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mas'ul shaxs (Aloqa)</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="Ali Valiyev"
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
                    placeholder="buyer@apparel.com"
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

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Toifa</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="B2B Butik">B2B Butik</option>
                    <option value="Ulgurji savdogar">Ulgurji savdogar</option>
                    <option value="Univermag">Univermag</option>
                    <option value="E-savdo">E-savdo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kredit limiti ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Manzil</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success h-16"
                  placeholder="Toshkent shahri, Amir Temur ko'chasi, 12-uy"
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
export default Customers;
