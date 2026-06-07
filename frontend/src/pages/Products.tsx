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

export const Products: React.FC = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
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
    sku: '',
    description: '',
    category: 'Futbolkalar',
    size: 'M',
    color: 'Qora',
    price: 19.99,
    cost: 8.50,
    quantityInStock: 100,
    supplierId: ''
  });
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          category: selectedCategory || undefined,
          search: search || undefined,
          page,
          limit: 10
        }
      });
      setProducts(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Mahsulotlarni yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/suppliers?limit=100')
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data.items);
      if (supRes.data.items.length > 0) {
        setFormData(prev => ({ ...prev, supplierId: supRes.data.items[0].id }));
      }
    } catch (err) {
      console.error('Metama\'lumotlarni yuklashda xatolik yuz berdi.', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search, page]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: 'Futbolkalar',
      size: 'M',
      color: 'Qora',
      price: 19.99,
      cost: 8.50,
      quantityInStock: 100,
      supplierId: suppliers[0]?.id || ''
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditId(p.id);
    setFormData({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category: p.category,
      size: p.size,
      color: p.color,
      price: p.price,
      cost: p.cost,
      quantityInStock: p.quantityInStock,
      supplierId: p.supplierId
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu mahsulotni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Mahsulotni o\'chirish muvaffaqiyatsiz tugadi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editId) {
        await api.put(`/products/${editId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      fetchProducts();
      fetchMetadata(); // reload categories just in case
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mahsulot ma\'lumotlarini saqlash muvaffaqiyatsiz tugadi.');
    }
  };

  const isWarehouseOrAdmin = hasRole(['Admin', 'Warehouse Staff', 'Manager']);

  const getCategoryLabel = (catName: string) => {
    switch (catName) {
      case 'T-shirts':
      case 'Futbolkalar':
        return 'Futbolkalar';
      case 'jeans':
      case 'Jinsilar':
        return 'Jinsilar';
      case 'jackets':
      case 'Kurtkalar':
        return 'Kurtkalar';
      case 'shirts':
      case 'Ko\'ylaklar':
        return 'Ko\'ylaklar';
      case 'dresses':
      case 'Ko\'ylak-yubkalar':
        return 'Ko\'ylak-yubkalar';
      case 'sportswear':
      case 'Sport kiyimlari':
        return 'Sport kiyimlari';
      case 'kidswear':
      case 'Bolalar kiyimlari':
        return 'Bolalar kiyimlari';
      case 'uniforms':
      case 'Formalar':
        return 'Formalar';
      case 'accessories':
      case 'Aksessuarlar':
        return 'Aksessuarlar';
      default:
        return catName;
    }
  };

  const getColorLabel = (colorName: string) => {
    switch (colorName) {
      case 'Black':
      case 'Qora':
        return 'Qora';
      case 'Navy':
      case 'To\'q ko\'k':
        return 'To\'q ko\'k';
      case 'Heather Gray':
      case 'Kulrang':
        return 'Kulrang';
      case 'Olive Green':
      case 'Zaytun rang':
        return 'Zaytun rang';
      case 'Crimson Red':
      case 'To\'q qizil':
        return 'To\'q qizil';
      case 'Off-White':
      case 'Sutrang':
        return 'Sutrang';
      case 'Indigo':
      case 'Ko\'k':
        return 'Ko\'k';
      default:
        return colorName;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 font-sans">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center flex-grow max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nomi yoki SKU bo'yicha qidirish..."
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

        {isWarehouseOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow flex items-center self-start sm:self-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Mahsulot qo'shish
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
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Mos keladigan mahsulotlar topilmadi.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Nomi</th>
                <th className="py-3 px-4">Toifa</th>
                <th className="py-3 px-4">O'lcham/Rang</th>
                <th className="py-3 px-4 text-right">Tannarx</th>
                <th className="py-3 px-4 text-right">Ulgurji narx</th>
                <th className="py-3 px-4 text-right">Zaxira darajasi</th>
                {isWarehouseOrAdmin && <th className="py-3 px-4 text-center">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-brand-700">{p.sku}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-555">{getCategoryLabel(p.category)}</td>
                  <td className="py-3.5 px-4 text-slate-555">{p.size} / {getColorLabel(p.color)}</td>
                  <td className="py-3.5 px-4 text-right text-slate-555">${p.cost.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-900">${p.price.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.quantityInStock < 15
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {p.quantityInStock < 15 && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {p.quantityInStock} dona
                    </span>
                  </td>
                  {isWarehouseOrAdmin && (
                    <td className="py-3.5 px-4 text-center space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-1 text-slate-400 hover:text-brand-700 hover:bg-slate-100 rounded">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {hasRole(['Admin', 'Manager']) && (
                        <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded">
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
              {editId ? 'Mahsulot ma\'lumotlarini tahrirlash' : 'Yangi kiyim mahsulotini qo\'shish'}
            </h3>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mahsulot nomi</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="To'q ko'k Ko'ylaklar - L"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SKU kodi</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="CT-HD-1090"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success h-16"
                  placeholder="Mahsulot materiallari haqida batafsil ma'lumot..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Toifa</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="Futbolkalar">Futbolkalar</option>
                    <option value="Jinsilar">Jinsilar</option>
                    <option value="Kurtkalar">Kurtkalar</option>
                    <option value="Ko'ylaklar">Ko'ylaklar</option>
                    <option value="Ko'ylak-yubkalar">Ko'ylak-yubkalar</option>
                    <option value="Sport kiyimlari">Sport kiyimlari</option>
                    <option value="Bolalar kiyimlari">Bolalar kiyimlari</option>
                    <option value="Formalar">Formalar</option>
                    <option value="Aksessuarlar">Aksessuarlar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">O'lcham</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rang</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="Qora / To'q ko'k / Sutrang"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tannarx narxi ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sotish narxi ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Boshlang'ich zaxira</label>
                  <input
                    type="number"
                    required
                    disabled={!!editId} // stock changes via PO / Warehouse Transfers
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Yetkazib beruvchi</label>
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success bg-white"
                >
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
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
export default Products;
