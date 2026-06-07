import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Receipt,
  FileText,
  DollarSign,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'expenses'>('invoices');
  
  // Data State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Record Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("Bank o'tkazmasi");
  const [payReference, setPayReference] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Add Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Logistika');
  const [expenseAmount, setExpenseAmount] = useState(100);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'invoices') {
        const res = await api.get('/invoices', { params: { page, limit: 10 } });
        setInvoices(res.data.items);
        setTotalPages(res.data.totalPages);
      } else if (activeTab === 'payments') {
        const res = await api.get('/payments', { params: { page, limit: 10 } });
        setPayments(res.data.items);
        setTotalPages(res.data.totalPages);
      } else if (activeTab === 'expenses') {
        const res = await api.get('/expenses', { params: { page, limit: 10 } });
        setExpenses(res.data.items);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Moliyaviy ma\'lumotlarni yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const handleOpenPayment = (inv: any) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.amount);
    setPayReference('');
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    try {
      await api.post(`/invoices/${selectedInvoice.id}/payments`, {
        amount: payAmount,
        paymentMethod: payMethod,
        reference: payReference
      });
      setShowPaymentModal(false);
      fetchData();
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'To\'lovni ro\'yxatga olish muvaffaqiyatsiz tugadi.');
    }
  };

  const handleCreateExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);
    try {
      await api.post('/expenses', {
        title: expenseTitle,
        category: expenseCategory,
        amount: expenseAmount,
        description: expenseDesc
      });
      setShowExpenseModal(false);
      // reset form
      setExpenseTitle('');
      setExpenseAmount(100);
      setExpenseDesc('');
      fetchData();
    } catch (err: any) {
      setExpenseError(err.response?.data?.message || 'Xarajatni qo\'shish muvaffaqiyatsiz tugadi.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNPAID': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OVERDUE': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isAccountantOrAdmin = hasRole(['Admin', 'Accountant']);

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'TO\'LANGAN';
      case 'UNPAID': return 'TO\'LANMAGAN';
      case 'OVERDUE': return 'MUDDATI O\'TGAN';
      default: return status;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'Rent':
      case 'Ijara':
        return 'Ijara';
      case 'Utilities':
      case 'Kommunal':
        return 'Kommunal';
      case 'Logistics':
      case 'Logistika':
        return 'Logistika';
      case 'Marketing':
        return 'Marketing';
      case 'Salaries':
      case 'Oyliklar':
      case 'Oylik maosh':
        return 'Oylik maosh';
      case 'Office':
      case 'Ofis':
        return 'Ofis xarajatlari';
      default:
        return cat;
    }
  };

  const getPayMethodLabel = (method: string) => {
    switch (method) {
      case 'Bank Transfer':
      case 'Bank o\'tkazmasi':
        return 'Bank o\'tkazmasi';
      case 'Credit Card':
      case 'Kredit karta':
        return 'Kredit karta';
      case 'Check':
      case 'Chek':
        return 'Chek';
      case 'Cash':
      case 'Naqd pul':
        return 'Naqd pul';
      default:
        return method;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 font-sans">
      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => { setActiveTab('invoices'); setPage(1); }}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'invoices' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Fakturalar ro'yxati
          </button>
          <button
            onClick={() => { setActiveTab('payments'); setPage(1); }}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'payments' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            To'lovlar jurnali
          </button>
          <button
            onClick={() => { setActiveTab('expenses'); setPage(1); }}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'expenses' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Operatsion xarajatlar
          </button>
        </div>

        {activeTab === 'expenses' && isAccountantOrAdmin && (
          <button
            onClick={() => { setExpenseError(null); setShowExpenseModal(true); }}
            className="px-3.5 py-1.5 bg-success hover:bg-success/90 text-white rounded text-xs font-bold shadow flex items-center transition-colors self-start sm:self-center"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Xarajat qo'shish
          </button>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="space-y-4 py-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'invoices' && (
            invoices.length === 0 ? <div className="text-center py-12 text-slate-400 text-sm">Fakturalar topilmadi.</div> : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                      <th className="py-3 px-4">Faktura ID</th>
                      <th className="py-3 px-4">Sotuv buyurtmasi</th>
                      <th className="py-3 px-4">Mijoz</th>
                      <th className="py-3 px-4 text-right">Summa</th>
                      <th className="py-3 px-4">Muddati</th>
                      <th className="py-3 px-4 text-center">Holati</th>
                      {isAccountantOrAdmin && <th className="py-3 px-4 text-center">Amallar</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{inv.order.orderNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.order.customer.name}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(inv.status)}`}>
                            {getInvoiceStatusLabel(inv.status)}
                          </span>
                        </td>
                        {isAccountantOrAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            {inv.status !== 'PAID' ? (
                              <button
                                onClick={() => handleOpenPayment(inv)}
                                className="px-3 py-1 bg-success hover:bg-success/90 text-white rounded text-xs font-semibold shadow-sm animate-pulse"
                              >
                                To'lovni yozish
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Yopilgan</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === 'payments' && (
            payments.length === 0 ? <div className="text-center py-12 text-slate-400 text-sm">To'lov yozuvlari topilmadi.</div> : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                      <th className="py-3 px-4">To'lov ID</th>
                      <th className="py-3 px-4">Faktura kodi</th>
                      <th className="py-3 px-4">Chakana mijoz</th>
                      <th className="py-3 px-4">To'lov usuli</th>
                      <th className="py-3 px-4">Kvitansiya kodi</th>
                      <th className="py-3 px-4 text-right">Qabul qilingan summa</th>
                      <th className="py-3 px-4">Qabul qilingan sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">{p.paymentNumber}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{p.invoice.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.invoice.order.customer.name}</td>
                        <td className="py-3.5 px-4 text-slate-650 font-medium">{getPayMethodLabel(p.paymentMethod)}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{p.reference || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">${p.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-550">{new Date(p.paymentDate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === 'expenses' && (
            expenses.length === 0 ? <div className="text-center py-12 text-slate-400 text-sm">Xarajatlar qayd etilmagan.</div> : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                      <th className="py-3 px-4">Nomi</th>
                      <th className="py-3 px-4">Toifa</th>
                      <th className="py-3 px-4">Tavsif</th>
                      <th className="py-3 px-4 text-right">Summa</th>
                      <th className="py-3 px-4">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{e.title}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${
                            e.category === 'Rent' || e.category === 'Ijara' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                            e.category === 'Salaries' || e.category === 'Oyliklar' || e.category === 'Oylik maosh' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            e.category === 'Marketing' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            {getCategoryLabel(e.category)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate">{e.description || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-rose-600">${e.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-555">{new Date(e.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
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

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-success" /> Mijoz to'lovini qayd etish
            </h3>
            <p className="text-xs text-slate-500">Invoys bo'yicha B2B o'tkazmasini yozib olish: <span className="font-mono font-bold text-slate-800">{selectedInvoice.invoiceNumber}</span>.</p>
            {paymentError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{paymentError}</div>
            )}
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Invoys summasi ($)</label>
                <input
                  type="number"
                  disabled
                  value={selectedInvoice.amount}
                  className="w-full border border-slate-200 bg-slate-50 rounded-md p-2 text-sm text-slate-500 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">To'langan summa ($)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoice.amount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usul</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="Bank o'tkazmasi">Bank o'tkazmasi</option>
                    <option value="Kredit karta">Kredit karta</option>
                    <option value="Chek">Chek</option>
                    <option value="Naqd pul">Naqd pul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tranzaksiya kodi</label>
                  <input
                    type="text"
                    required
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="TX-109200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
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

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-rose-500" /> Operatsion xarajatlarni kiritish
            </h3>
            {expenseError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800">{expenseError}</div>
            )}
            <form onSubmit={handleCreateExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Xarajat nomi</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="Ofis jihozlari uchun xarajat"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Toifa</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success"
                  >
                    <option value="Ijara">Ijara</option>
                    <option value="Kommunal">Kommunal</option>
                    <option value="Logistika">Logistika</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Oyliklar">Oylik maosh</option>
                    <option value="Ofis">Ofis xarajatlari</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Summa ($)</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batafsil/Tavsif</label>
                <textarea
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-success h-16"
                  placeholder="Xarajat tavsifini kiriting..."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md text-sm font-bold shadow"
                >
                  Xarajatni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Invoices;
