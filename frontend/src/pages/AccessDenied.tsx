import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 font-sans">
      <div className="p-4 bg-amber-50 rounded-full text-amber-600 border border-amber-200">
        <ShieldAlert className="h-14 w-14" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ruxsat rad etildi</h2>
      <p className="text-sm text-slate-500 max-w-md leading-normal">
        Sizning foydalanuvchi rolingiz ushbu modulni ko'rish huquqiga ega emas. Agar bu xato deb hisoblasangiz, tizim administratoriga murojaat qiling.
      </p>
      <div className="pt-2">
        <Link to="/dashboard" className="px-4.5 py-2 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold rounded shadow transition-all">
          Boshqaruv paneliga qaytish
        </Link>
      </div>
    </div>
  );
};
export default AccessDenied;
