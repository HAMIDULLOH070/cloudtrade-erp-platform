import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 font-sans">
      <div className="p-4 bg-rose-50 rounded-full text-rose-600 border border-rose-200">
        <AlertCircle className="h-14 w-14" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">404 - Sahifa topilmadi</h2>
      <p className="text-sm text-slate-500 max-w-md leading-normal">
        Siz qidirayotgan sahifa o'chirilgan, nomi o'zgartirilgan yoki vaqtincha mavjud bo'lmasligi mumkin.
      </p>
      <div className="pt-2">
        <Link to="/dashboard" className="px-4.5 py-2 bg-success hover:bg-success/90 text-white text-xs font-bold rounded shadow transition-all">
          Boshqaruv paneliga qaytish
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
