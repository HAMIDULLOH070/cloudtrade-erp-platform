import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  Cloud,
  Users,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Menu,
  X,
  CreditCard,
  Building,
  TrendingUp,
  Inbox,
  Bell,
  Search,
  ChevronRight,
  User,
  Workflow
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Simulyatsiya qilingan bildirishnomalar
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'Zaxira kamligi ogohlantirishi: Qizil futbolka - M o\'lchami 15 tadan kam qoldi', time: '5 daqiqa oldin', read: false },
    { id: '2', text: 'Toshkent City Retail tomonidan yangi SO-9011 buyurtmasi joylashtirildi', time: '1 soat oldin', read: false },
    { id: '3', text: 'Chorsu Kiyim-Kechak tomonidan INV-7022 invoysi uchun $5,400.00 to\'landi', time: '2 soat oldin', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const navigation = [
    {
      title: 'BOSHQARUV PANELLARI',
      items: [
        { name: 'Umumiy tahlillar', href: '/dashboard', icon: LayoutDashboard },
        { name: 'ERP tahlillari', href: '/dashboard/erp', icon: TrendingUp },
        { name: 'CRM tahlillari', href: '/dashboard/crm', icon: Workflow },
        { name: 'WMS ombor paneli', href: '/dashboard/wms', icon: Building },
        { name: 'Bulutli tarmoq', href: '/dashboard/cloud', icon: Cloud },
      ]
    },
    {
      title: 'ERP MODULI',
      items: [
        { name: 'Mahsulotlar katalogi', href: '/products', icon: Package },
        { name: 'Yetkazib beruvchilar', href: '/suppliers', icon: Truck },
        { name: 'Sotuv buyurtmalari', href: '/orders', icon: FileText },
        { name: 'Xarid buyurtmalari', href: '/purchase-orders', icon: Inbox },
      ]
    },
    {
      title: 'CRM MODULI',
      items: [
        { name: 'Mijozlar ro\'yxati', href: '/customers', icon: Users },
        { name: 'Lidlar (Pipeline)', href: '/leads', icon: Workflow },
      ]
    },
    {
      title: 'MOLIYA VA OMBOR',
      items: [
        { name: 'Faktura va Xarajatlar', href: '/invoices', icon: CreditCard },
        { name: 'Zaxira harakatlari', href: '/movements', icon: Truck },
      ]
    },
    {
      title: 'HISOBOT VA SOZLAMALAR',
      items: [
        { name: 'BI Hisobotlar markazi', href: '/reports', icon: BarChart3 },
        { name: 'Tizim sozlamalari', href: '/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Manager': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Warehouse Staff': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'Sales Staff': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Accountant': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return (
      <nav className="flex items-center space-x-1.5 text-xs font-semibold text-slate-550 mb-3.5 print:hidden">
        <Link to="/dashboard" className="hover:text-brand-900 transition-colors">Bosh sahifa</Link>
        {paths.map((path, idx) => {
          const href = `/${paths.slice(0, idx + 1).join('/')}`;
          const isLast = idx === paths.length - 1;
          let label = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
          if (path === 'dashboard') label = 'Tahlillar';
          if (path === 'erp') label = 'ERP';
          if (path === 'crm') label = 'CRM';
          if (path === 'wms') label = 'WMS';
          if (path === 'cloud') label = 'Bulutli tarmoq';
          if (path === 'products') label = 'Mahsulotlar';
          if (path === 'suppliers') label = 'Yetkazib beruvchilar';
          if (path === 'orders') label = 'Sotuv buyurtmalari';
          if (path === 'purchase-orders') label = 'Xarid buyurtmalari';
          if (path === 'customers') label = 'Mijozlar';
          if (path === 'leads') label = 'Lidlar';
          if (path === 'invoices') label = 'Fakturalar';
          if (path === 'movements') label = 'Ombor harakatlari';
          if (path === 'reports') label = 'BI Hisobotlar';
          if (path === 'settings') label = 'Sozlamalar';
          
          return (
            <React.Fragment key={path}>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              {isLast ? (
                <span className="text-slate-800 font-bold">{label}</span>
              ) : (
                <Link to={href} className="hover:text-brand-900 transition-colors">{label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 bg-brand-900 border-r border-brand-850 text-brand-100 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-brand-850 bg-brand-950">
          <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-success flex items-center justify-center font-bold text-white tracking-wider text-sm flex-shrink-0">
              CT
            </div>
            {!sidebarCollapsed && (
              <div className="animate-in fade-in duration-300">
                <span className="font-bold text-white text-base tracking-wide block">CloudTrade</span>
                <span className="text-[10px] text-brand-400 block -mt-1 font-bold">ERP PLATFORMA</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-brand-850 text-brand-300 hover:text-white hidden lg:block"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          {navigation.map((group) => (
            <div key={group.title} className="space-y-1">
              {!sidebarCollapsed && (
                <h3 className="px-3 text-[10px] font-bold text-brand-400 tracking-wider uppercase mb-2">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        title={sidebarCollapsed ? item.name : undefined}
                        className={`group flex items-center px-3 py-2 text-xs font-semibold rounded-md transition-all duration-150 ${
                          isActive
                            ? 'bg-success text-white shadow-sm'
                            : 'hover:bg-brand-800 hover:text-white text-brand-200'
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-brand-355 group-hover:text-white'
                        } ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-850 bg-brand-950 flex flex-col space-y-3">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-brand-800 flex items-center justify-center text-white font-semibold border border-brand-700 flex-shrink-0">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 uppercase tracking-wider ${getRoleColor(user?.role.name || '')}`}>
                  {getRoleLabel(user?.role.name || '')}
                </span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-3 py-2 text-xs font-bold rounded border border-brand-800 text-brand-350 hover:bg-brand-800 hover:text-white transition-all duration-150"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Tizimdan chiqish
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-grow flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-250 rounded-md px-3 py-1.5 w-64">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Global tizimli qidiruv..."
                className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileDropdownOpen(false); }}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 block h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white text-center leading-4">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800">Tizim xabarnomalari</span>
                    <button onClick={markAllRead} className="text-success hover:underline">Hammasini o'qildi qilish</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 text-xs leading-normal hover:bg-slate-50 ${!n.read ? 'bg-brand-50/20 font-semibold' : ''}`}>
                        <p className="text-slate-700">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotificationsOpen(false); }}
                className="flex items-center space-x-2.5 p-1 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-brand-900 text-white font-bold flex items-center justify-center text-sm">
                  {user?.firstName[0]}{user?.lastName[0]}
                </div>
                <span className="hidden md:inline text-xs font-bold">{user?.firstName}</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-slate-400">{user?.email}</p>
                  </div>
                  <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <User className="h-4 w-4 mr-2 text-slate-400" /> Profil sozlamalari
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-t border-slate-100">
                    <LogOut className="h-4 w-4 mr-2 text-slate-400" /> Tizimdan chiqish
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Page body */}
        <main className="flex-grow p-6 overflow-x-hidden">
          {generateBreadcrumbs()}
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-brand-900 text-brand-100 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4">
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-md hover:bg-brand-850 text-brand-300 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-16 flex items-center px-6 border-b border-brand-850 bg-brand-950">
              <span className="font-bold text-white text-base">CloudTrade ERP</span>
            </div>
            <nav className="flex-grow overflow-y-auto px-3 py-6 space-y-6">
              {navigation.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-bold text-brand-400 tracking-wider uppercase mb-1">
                    {group.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`flex items-center px-3 py-2 text-xs font-semibold rounded-md ${
                              isActive ? 'bg-success text-white' : 'hover:bg-brand-800 hover:text-white text-brand-200'
                            }`}
                          >
                            <Icon className="mr-3 h-4.5 w-4.5" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};
export default AppLayout;
