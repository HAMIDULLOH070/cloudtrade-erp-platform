import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShieldAlert,
  UserPlus,
  KeyRound
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const rolesRes = await api.get('/auth/roles');
      setRoles(rolesRes.data);
      if (rolesRes.data.length > 0) setRoleId(rolesRes.data[0].id);

      // If user is Admin, they can fetch all users
      if (user?.role.name === 'Admin') {
        const usersRes = await api.get('/auth/users');
        setUsersList(usersRes.data);
      }
    } catch (err) {
      console.error('Sozlamalar ma\'lumotlarini yuklashda xatolik yuz berdi.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, [user]);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    try {
      await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        roleId
      });
      setFormSuccess(true);
      // Reset form fields
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      fetchUsersAndRoles();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Foydalanuvchi hisobini yaratish muvaffaqiyatsiz tugadi.');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Warehouse Staff': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Sales Staff': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Accountant': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isAdmin = user?.role.name === 'Admin';

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return 'Administrator';
      case 'Manager': return 'Menejer';
      case 'Warehouse Staff': return 'Ombor xodimi';
      case 'Sales Staff': return 'Sotuv menejeri';
      case 'Accountant': return 'Hisobchi';
      default: return roleName;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Role matrix explanation card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-950 text-base flex items-center">
          <KeyRound className="h-5 w-5 mr-2 text-slate-500" /> Tizim xavfsizlik rollari matritsasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="border border-slate-100 rounded p-3 bg-slate-50/45 text-xs space-y-1">
            <span className="font-bold text-rose-700">ADMINISTRATOR:</span>
            <p className="text-slate-500 leading-normal">Mahsulotlar, yetkazib beruvchilar, mijozlar, lidlar, fakturalar, to'lovlar, xarajatlar, bulutli infratuzilma va foydalanuvchi hisoblarini yaratishga to'liq ruxsat.</p>
          </div>
          <div className="border border-slate-100 rounded p-3 bg-slate-50/45 text-xs space-y-1">
            <span className="font-bold text-blue-700">MENEJER:</span>
            <p className="text-slate-500 leading-normal">Operatsion hisobotlarni ko'rish, sotuv va xarid buyurtmalarini tasdiqlash, ombor harakati jurnallari va bulutli telemetriya holatini kuzatish.</p>
          </div>
          <div className="border border-slate-100 rounded p-3 bg-slate-50/45 text-xs space-y-1">
            <span className="font-bold text-indigo-700">OMBOR XODIMI:</span>
            <p className="text-slate-500 leading-normal">Mahsulotlar katalogini, yetkazib beruvchilarni boshqarish, xarid buyurtmalarini yaratish, kirim buyurtmalarini qabul qilish, omborda ko'chirishlarni bajarish va zaxira harakati tarixini ko'rish.</p>
          </div>
          <div className="border border-slate-100 rounded p-3 bg-slate-50/45 text-xs space-y-1">
            <span className="font-bold text-teal-700">SOTUV MENEJERI:</span>
            <p className="text-slate-500 leading-normal">Mijozlar ro'yxatini boshqarish, yangi lidlarni yaratish, sotuv buyurtmalarini joylashtirish va sotuv voronkasi bosqichlarini yangilash.</p>
          </div>
          <div className="border border-slate-100 rounded p-3 bg-slate-50/45 text-xs space-y-1">
            <span className="font-bold text-amber-700">HISOBCHI:</span>
            <p className="text-slate-500 leading-normal">Moliyaviy hisobotlarga kirish, fakturalar reestrini ko'rish, mijozlar to'lovlarini qayd etish, kommunal va boshqa operatsion xarajatlarni kiritish.</p>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Registration Form (Admin Only) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-slate-500" /> Xodim uchun hisob yaratish
          </h3>
          {!isAdmin ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center text-xs text-slate-400 space-y-2">
              <ShieldAlert className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="font-bold">Ruxsat cheklangan</p>
              <p>Faqat <span className="font-semibold text-rose-600">Administrator (Admin)</span> yangi xodim hisoblarini ro'yxatdan o'tkaza oladi.</p>
            </div>
          ) : (
            <form onSubmit={handleRegisterUser} className="space-y-4 text-xs font-semibold text-slate-700">
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-emerald-800">
                  Hisob muvaffaqiyatli yaratildi!
                </div>
              )}
              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-rose-800">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Ismi</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-slate-350 rounded p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-success"
                    placeholder="Lobar"
                  />
                </div>
                <div>
                  <label className="block mb-1">Familiyasi</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-slate-350 rounded p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-success"
                    placeholder="Alimova"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Elektron pochta manzili (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-350 rounded p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-success"
                  placeholder="lobar.alimova@company.com"
                />
              </div>

              <div>
                <label className="block mb-1">Hisob paroli</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-350 rounded p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-success"
                  placeholder="Kamida 6 ta belgi"
                />
              </div>

              <div>
                <label className="block mb-1">Tizim roli huquqi</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full border border-slate-350 rounded p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-success bg-white"
                >
                  {roles.map(r => <option key={r.id} value={r.id}>{getRoleLabel(r.name)}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-success hover:bg-success/90 text-white rounded text-xs font-bold shadow transition-colors"
              >
                Hisobni yaratish
              </button>
            </form>
          )}
        </div>

        {/* User Account Registry list */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-bold text-slate-950 text-base flex items-center">
            <Users className="h-5 w-5 mr-2 text-slate-500" /> Faol xodimlar reestri
          </h3>

          {!isAdmin ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center text-xs text-slate-400 space-y-2">
              <ShieldAlert className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="font-bold">Ruxsat cheklangan</p>
              <p>Faol xodimlar ro'yxatini faqat Administrator ko'ra oladi.</p>
            </div>
          ) : loading ? (
            <div className="space-y-3 py-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Xodimning ismi</th>
                    <th className="py-2.5 px-3">Elektron pochta (Email)</th>
                    <th className="py-2.5 px-3">Xavfsizlik roli</th>
                    <th className="py-2.5 px-3">Yaratilgan sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{u.firstName} {u.lastName}</td>
                      <td className="py-2.5 px-3 text-slate-550 font-mono">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(u.role.name)}`}>
                          {getRoleLabel(u.role.name)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-450">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Settings;
