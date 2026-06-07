import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  Briefcase, 
  Calculator, 
  Package, 
  Users, 
  ArrowLeft 
} from 'lucide-react';

const rolesConfig = [
  {
    key: 'Admin',
    title: 'Administrator',
    description: 'Tizim sozlamalari, foydalanuvchilar, rollar va barcha operativ modullarni to\'liq boshqarish.',
    defaultEmail: 'admin@cloudtrade.com',
    defaultPassword: 'Admin12345',
    colorClass: 'hover:shadow-[0_0_35px_rgba(239,68,68,0.18)] hover:border-rose-500/50 hover:bg-rose-950/15',
    iconColor: 'text-rose-400 group-hover:text-rose-300',
    iconBg: 'bg-rose-500/20 group-hover:bg-rose-500/30',
    accentColor: 'rose',
    tag: 'To\'liq Ruxsat',
    tagColor: 'text-rose-350 bg-rose-950/60 border-rose-800/40',
    icon: ShieldCheck
  },
  {
    key: 'Manager',
    title: 'Menejer',
    description: 'Biznes tahliliy hisobotlari, sotuv va xarid buyurtmalarini tasdiqlash hamda monitoring.',
    defaultEmail: 'manager@cloudtrade.com',
    defaultPassword: 'Manager123',
    colorClass: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.18)] hover:border-amber-500/50 hover:bg-amber-950/15',
    iconColor: 'text-amber-400 group-hover:text-amber-300',
    iconBg: 'bg-amber-500/20 group-hover:bg-amber-500/30',
    accentColor: 'amber',
    tag: 'Boshqaruv & Tahlil',
    tagColor: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    icon: Briefcase
  },
  {
    key: 'Accountant',
    title: 'Hisobchi',
    description: 'Moliyaviy P&L hisoboti, fakturalar, debitorlik qarzlari, to\'lovlar va oylik xarajatlar.',
    defaultEmail: 'accountant@cloudtrade.com',
    defaultPassword: 'Accountant123',
    colorClass: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.18)] hover:border-emerald-500/50 hover:bg-emerald-950/15',
    iconColor: 'text-emerald-400 group-hover:text-emerald-300',
    iconBg: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    accentColor: 'emerald',
    tag: 'Moliya & Hisobot',
    tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    icon: Calculator
  },
  {
    key: 'Warehouse Staff',
    title: 'Ombor xodimi',
    description: 'Zaxiralar kirim/chiqimi, ichki ko\'chirishlar, ombor zonalari va mahsulotlar katalogi.',
    defaultEmail: 'warehouse@cloudtrade.com',
    defaultPassword: 'Warehouse123',
    colorClass: 'hover:shadow-[0_0_35px_rgba(197,148,115,0.18)] hover:border-brand-400/50 hover:bg-brand-900/30',
    iconColor: 'text-brand-300 group-hover:text-brand-200',
    iconBg: 'bg-brand-700/20 group-hover:bg-brand-700/30',
    accentColor: 'brand',
    tag: 'Zaxira & Logistika',
    tagColor: 'text-brand-200 bg-brand-950/60 border-brand-800/50',
    icon: Package
  },
  {
    key: 'Sales Staff',
    title: 'Sotuv xodimi',
    description: 'Mijozlar bazasi, CRM lidlar, sotuv buyurtmalari va muzokaralar quvuri (pipeline).',
    defaultEmail: 'sales@cloudtrade.com',
    defaultPassword: 'Sales123',
    colorClass: 'hover:shadow-[0_0_35px_rgba(249,115,22,0.18)] hover:border-orange-500/50 hover:bg-orange-950/15',
    iconColor: 'text-orange-450 group-hover:text-orange-300',
    iconBg: 'bg-orange-500/20 group-hover:bg-orange-500/30',
    accentColor: 'orange',
    tag: 'Savdo & CRM',
    tagColor: 'text-orange-400 bg-orange-950/60 border-orange-800/40',
    icon: Users
  }
];

export const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (role: any) => {
    setSelectedRole(role);
    setEmail(role.defaultEmail);
    setPassword(role.defaultPassword);
    setError(null);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.accessToken, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Tizimga ulanishda xatolik yuz berdi. Iltimos login va parolni tekshiring yoki backend serverni ko\'ring.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ActiveIcon = selectedRole ? selectedRole.icon : null;

  return (
    <div className="min-h-screen bg-[#0e0704] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Warm Glow Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-[#c2410c]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#ab734f]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[25%] right-[15%] w-[400px] h-[400px] bg-[#d97706]/4 rounded-full blur-[110px] pointer-events-none animate-pulse" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(245,230,220,0.15) 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {selectedRole === null ? (
        // Role Selection Screen
        <div className="max-w-6xl w-full mx-auto z-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c2410c] to-[#d97706] rounded-lg blur opacity-50 group-hover:opacity-80 transition duration-300"></div>
                <div className="relative w-14 h-14 rounded-lg bg-[#1a0f0a] border border-[#38231a] flex items-center justify-center font-black text-white tracking-widest text-2xl shadow-xl">
                  CT
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-[#faf6f0] sm:text-5xl bg-gradient-to-r from-[#faf6f0] via-[#f4eae1] to-[#c59473] bg-clip-text text-transparent">
              CloudTrade ERP Platformasi
            </h2>
            <p className="text-sm text-[#ebdcd3] max-w-lg mx-auto leading-relaxed">
              Kompaniyaning operativ jarayonlarini boshqarish portaliga kirish uchun quyidagi rollardan birini tanlang
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {rolesConfig.map((role) => {
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.key}
                  onClick={() => handleSelectRole(role)}
                  className={`bg-[#1d0e06] border border-[#38231a] rounded-2xl p-6 flex flex-col text-left space-y-5 hover:-translate-y-2 hover:bg-[#28150a] transition-all duration-300 group ${role.colorClass}`}
                >
                  <div className={`p-3 rounded-xl ${role.iconBg} ${role.iconColor} self-start transition-all duration-300 shadow-inner`}>
                    <RoleIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 flex-grow">
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${role.tagColor}`}>
                      {role.tag}
                    </span>
                    <h3 className="text-lg font-bold text-[#faf6f0] group-hover:text-success transition-colors mt-3">
                      {role.title}
                    </h3>
                    <p className="text-xs text-[#ebdcd3] leading-relaxed font-medium mt-1">
                      {role.description}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] font-bold text-[#c2410c] group-hover:underline flex items-center gap-1">
                    Kirish sahifasi <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Login Form Screen
        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-xs font-bold text-[#ebdcd3] hover:text-white transition-colors mb-2 bg-[#1d0e06] border border-[#38231a] px-3 py-1.5 rounded-full shadow"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5 text-success" /> Bosh sahifaga qaytish
            </button>
            
            <div className="flex justify-center">
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300 ${
                  selectedRole.key === 'Admin' ? 'bg-rose-500' :
                  selectedRole.key === 'Manager' ? 'bg-amber-500' :
                  selectedRole.key === 'Accountant' ? 'bg-emerald-500' :
                  selectedRole.key === 'Warehouse Staff' ? 'bg-brand-500' :
                  'bg-orange-500'
                }`} />
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-2xl ${
                  selectedRole.key === 'Admin' ? 'bg-rose-500/20 border border-rose-500/35 text-rose-300' :
                  selectedRole.key === 'Manager' ? 'bg-amber-500/20 border border-amber-500/35 text-amber-300' :
                  selectedRole.key === 'Accountant' ? 'bg-emerald-500/20 border border-emerald-500/35 text-emerald-300' :
                  selectedRole.key === 'Warehouse Staff' ? 'bg-brand-800/20 border border-brand-700/35 text-brand-300' :
                  'bg-orange-500/20 border border-orange-500/35 text-orange-300'
                }`}>
                  {ActiveIcon && <ActiveIcon className="h-7 w-7" />}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black text-[#faf6f0] tracking-tight">
              {selectedRole.title}
            </h2>
            <p className="text-xs text-[#ebdcd3] font-semibold uppercase tracking-wider">
              {selectedRole.tag}
            </p>
          </div>

          <div className="mt-6">
            <div className={`bg-[#1d0e06] border rounded-2xl py-8 px-6 shadow-2xl sm:px-10 space-y-6 transition-all duration-300 ${
              selectedRole.key === 'Admin' ? 'border-rose-500/25 shadow-rose-950/20' :
              selectedRole.key === 'Manager' ? 'border-amber-500/25 shadow-amber-950/20' :
              selectedRole.key === 'Accountant' ? 'border-emerald-500/25 shadow-emerald-950/20' :
              selectedRole.key === 'Warehouse Staff' ? 'border-brand-500/25 shadow-brand-950/20' :
              'border-orange-500/25 shadow-orange-950/20'
            }`}>
              {error && (
                <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3.5 flex items-start space-x-2.5">
                  <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-sm text-rose-200 leading-normal font-medium">{error}</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#c59473] uppercase tracking-wider mb-1.5">
                    Elektron pochta manzili
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-brand-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-3 border border-[#38231a] bg-[#0e0704] rounded-xl text-white placeholder-brand-700 focus:outline-none focus:ring-2 focus:ring-success/50 focus:border-success/80 sm:text-sm transition-all"
                      placeholder="nom@kompaniya.uz"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-[#c59473] uppercase tracking-wider mb-1.5">
                    Maxfiy parol
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-brand-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-3 border border-[#38231a] bg-[#0e0704] rounded-xl text-white placeholder-brand-700 focus:outline-none focus:ring-2 focus:ring-success/50 focus:border-success/80 sm:text-sm transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-success hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0e0704] focus:ring-success transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {submitting ? 'Tizimga kirilmoqda...' : 'Tizimga kirish'}
                  </button>
                </div>
              </form>

              <div className="border-t border-[#38231a] pt-5">
                <div className="bg-[#0e0704] border border-[#2d1b14] rounded-xl p-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#faf6f0]">
                    <ShieldCheck className="h-4.5 w-4.5 text-success" />
                    <span>Tizimni sinab ko'rish (Demo):</span>
                  </div>
                  <div className="text-xs text-[#ebdcd3] space-y-1 bg-[#1d0e06]/60 p-2.5 rounded border border-[#38231a] font-mono">
                    <div className="flex justify-between">
                      <span>Email:</span> 
                      <span className="text-success select-all font-bold">{selectedRole.defaultEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parol:</span> 
                      <span className="text-success select-all font-bold">{selectedRole.defaultPassword}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
