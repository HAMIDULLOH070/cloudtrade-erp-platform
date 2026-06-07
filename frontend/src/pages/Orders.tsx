import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Trash
} from 'lucide-react';

export const Orders: React.FC = () => {
  const { hasRole } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Create Form State
  const [customerId, setCustomerId] = useState('');
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [orderItems, setOrderItems] = useState<any[]>([{ productId: '', quantity: 1, price: 0 }]);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders', {
        params: {
          status: selectedStatus || undefined,
          search: search || undefined,
          page,
          limit: 10
        }
      });
      setOrders(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Sotuv buyurtmalarini yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/products?limit=100')
      ]);
      setCustomers(custRes.data.items);
      setProducts(prodRes.data.items);
      if (custRes.data.items.length > 0) setCustomerId(custRes.data.items[0].id);
      if (prodRes.data.items.length > 0) {
        setOrderItems([{ productId: prodRes.data.items[0].id, quantity: 10, price: prodRes.data.items[0].price }]);
      }
    } catch (err) {
      console.error('Metama\'lumotlarni yuklashda xatolik yuz berdi.', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, search, page]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleOpenDetails = (o: any) => {
    setSelectedOrder(o);
    setShowDetailsModal(true);
  };

  const handleCompleteOrder = async (id: string) => {
    if (!window.confirm('Ushbu sotuv buyurtmasini YAKUNLANGAN deb belgilaysizmi? Bu ombor zaxirasini kamaytiradi va chakana fakturani shakllantiradi.')) return;
    try {
      await api.put(`/orders/${id}`, { status: 'COMPLETED' });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Buyurtmani yakunlash muvaffaqiyatsiz tugadi.');
    }
  };

  const handleAddLineItem = () => {
    const defaultProduct = products[0];
    if (defaultProduct) {
      setOrderItems([...orderItems, { productId: defaultProduct.id, quantity: 10, price: defaultProduct.price }]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    if (orderItems.length === 1) return;
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemProductChange = (index: number, pId: string) => {
    const prod = products.find(p => p.id === pId);
    if (!prod) return;
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      productId: pId,
      price: prod.price
    };
    setOrderItems(newItems);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = qty;
    setOrderItems(newItems);
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify valid items
    const invalidItem = orderItems.find(i => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      setError('Iltimos, tanlangan tovarlar va miqdorlarni tekshiring.');
      return;
    }

    try {
      await api.post('/orders', {
        customerId,
        status: orderStatus,
        items: orderItems
      });
      setShowModal(false);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sotuv buyurtmasini yuborish muvaffaqiyatsiz tugadi.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-250';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-250';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'KUTILMOQDA';
      case 'COMPLETED': return 'YAKUNLANGAN';
      case 'CANCELLED': return 'BEKOR QILINGAN';
      default: return status;
    }
  };

  const calculateTotalOrderValue = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
              placeholder="Buyurtma raqami yoki mijoz nomi bo'yicha qidirish..."
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
              <option value="">Barcha holatlar</option>
              <option value="PENDING">Kutilmoqda</option>
              <option value="COMPLETED">Yakunlangan</option>
              <option value="CANCELLED">Bekor qilingan</option>
            </select>
          </div>
        </div>

        {isSalesOrAdmin && (
          <button
            onClick={() => { setError(null); setShowModal(true); }}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow flex items-center transition-colors self-start sm:self-center"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Buyurtma yaratish
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
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Sotuv buyurtmalari topilmadi.</div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Buyurtma ID</th>
                <th className="py-3 px-4">Mijoz</th>
                <th className="py-3 px-4">Sanasi</th>
                <th className="py-3 px-4 text-right">Turlar soni</th>
                <th className="py-3 px-4 text-right">Jami summa</th>
                <th className="py-3 px-4 text-center">Holati</th>
                <th className="py-3 px-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">{o.orderNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{o.customer.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-650">{o.items.length} turdagi</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">${o.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    <button onClick={() => handleOpenDetails(o)} className="p-1 text-slate-400 hover:text-brand-700 hover:bg-slate-100 rounded" title="Batafsil ko'rish">
                      <Eye className="h-4 w-4" />
                    </button>
                    {o.status === 'PENDING' && isSalesOrAdmin && (
                      <button onClick={() => handleCompleteOrder(o.id)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded" title="Tasdiqlash va yakunlash">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </td>
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

      {/* Details View Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sotuv buyurtmasi tafsilotlari</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                {getStatusLabel(selectedOrder.status)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
              <p><span className="font-bold text-slate-800">Mijoz (Chakana savdo):</span> {selectedOrder.customer.name}</p>
              <p><span className="font-bold text-slate-800">Buyurtma sanasi:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
              <p><span className="font-bold text-slate-800">Etkazib berish manzili:</span> {selectedOrder.customer.address}</p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                    <th className="py-2 px-3">Tovar nomi</th>
                    <th className="py-2 px-3 text-right">Miqdori</th>
                    <th className="py-2 px-3 text-right">Narxi</th>
                    <th className="py-2 px-3 text-right">Oraliq summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.product.name}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{item.quantity} dona</td>
                      <td className="py-2 px-3 text-right text-slate-500">${item.price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 font-bold text-slate-900">
                    <td colSpan={3} className="py-2 px-3 text-right uppercase tracking-wider text-[10px]">Jami buyurtma summasi:</td>
                    <td className="py-2 px-3 text-right text-sm text-success">${selectedOrder.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-850 rounded-md text-xs font-semibold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">Sotuv buyurtmasini yaratish</h3>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{error}</div>
            )}
            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mijozni tanlang</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Buyurtma holati</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="PENDING">KUTILMOQDA (Qoralama buyurtma)</option>
                    <option value="COMPLETED">YAKUNLANGAN (Zaxirani darhol hisobdan chiqarish)</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Buyurtma tarkibidagi tovarlar</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-success hover:underline"
                  >
                    + Yangi tovar qo'shish
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-md border border-slate-150">
                    <div className="flex-grow">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-success bg-white"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min={1}
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                        className="w-full border border-slate-300 rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-success bg-white"
                        placeholder="Miqdor"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-800 w-20 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Hisoblangan jami buyurtma summasi:</span>
                <span className="text-success text-base">${calculateTotalOrderValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Orders;
