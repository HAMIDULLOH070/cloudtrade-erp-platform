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
  Workflow
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      title: 'DASHBOARDS',
      items: [
        { name: 'Main Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'ERP Dashboard', href: '/dashboard/erp', icon: TrendingUp },
        { name: 'CRM Dashboard', href: '/dashboard/crm', icon: Workflow },
        { name: 'WMS Dashboard', href: '/dashboard/wms', icon: Building },
        { name: 'Cloud Infrastructure', href: '/dashboard/cloud', icon: Cloud },
      ]
    },
    {
      title: 'ERP MODULE',
      items: [
        { name: 'Products Catalog', href: '/products', icon: Package },
        { name: 'Suppliers Directory', href: '/suppliers', icon: Truck },
        { name: 'Sales Orders', href: '/orders', icon: FileText },
        { name: 'Purchase Orders', href: '/purchase-orders', icon: Inbox },
      ]
    },
    {
      title: 'CRM MODULE',
      items: [
        { name: 'Customers list', href: '/customers', icon: Users },
        { name: 'Leads & Pipeline', href: '/leads', icon: TrendingUp },
      ]
    },
    {
      title: 'FINANCE & WAREHOUSE',
      items: [
        { name: 'Invoices & Payments', href: '/invoices', icon: CreditCard },
        { name: 'Stock Movements', href: '/movements', icon: Truck },
      ]
    },
    {
      title: 'REPORTS & CONFIG',
      items: [
        { name: 'Monthly & Yearly Reports', href: '/reports', icon: BarChart3 },
        { name: 'System Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Warehouse Staff': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Sales Staff': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Accountant': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-brand-900 border-r border-brand-800 text-brand-100">
        <div className="h-16 flex items-center px-6 border-b border-brand-800 bg-brand-950">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-success flex items-center justify-center font-bold text-white tracking-wider text-sm shadow">
              RM
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-wide">ReModule</span>
              <span className="text-xs text-brand-400 block -mt-1 font-medium">ERP PLATFORM</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          {navigation.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-brand-400 tracking-wider uppercase">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                          isActive
                            ? 'bg-success text-white shadow-sm'
                            : 'hover:bg-brand-800 hover:text-white text-brand-200'
                        }`}
                      >
                        <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-brand-300 group-hover:text-white'
                        }`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-800 bg-brand-950 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-brand-800 flex items-center justify-center text-white font-semibold border border-brand-700">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 uppercase tracking-wide ${getRoleColor(user?.role.name || '')}`}>
                {user?.role.name}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-3 py-2 text-sm font-semibold rounded-md border border-brand-800 text-brand-300 hover:bg-brand-800 hover:text-white transition-all duration-150"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-brand-900 text-brand-100 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md hover:bg-brand-850 text-brand-300 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-16 flex items-center px-6 border-b border-brand-800 bg-brand-950">
              <span className="font-bold text-white text-base">ReModule ERP</span>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {navigation.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-brand-400 tracking-wider uppercase">
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
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                              isActive ? 'bg-success text-white' : 'hover:bg-brand-800 hover:text-white text-brand-200'
                            }`}
                          >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="p-4 border-t border-brand-800 bg-brand-950 flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-850 flex items-center justify-center font-bold">
                  {user?.firstName[0]}{user?.lastName[0]}
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-brand-400 font-medium">{user?.role.name}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-3 py-1.5 text-xs font-semibold rounded-md border border-brand-800 text-brand-300 hover:bg-brand-800 hover:text-white"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {location.pathname === '/dashboard' && 'Dashboard Overview'}
              {location.pathname === '/dashboard/erp' && 'Enterprise Resource Planning (ERP)'}
              {location.pathname === '/dashboard/crm' && 'Customer Relationship Management (CRM)'}
              {location.pathname === '/dashboard/wms' && 'Warehouse Management System (WMS)'}
              {location.pathname === '/dashboard/cloud' && 'Cloud Infrastructure Status'}
              {location.pathname === '/products' && 'Product Inventory Catalog'}
              {location.pathname === '/suppliers' && 'Suppliers Directory'}
              {location.pathname === '/orders' && 'Customer Sales Orders'}
              {location.pathname === '/purchase-orders' && 'Supplier Purchase Orders'}
              {location.pathname === '/customers' && 'Customers Directory'}
              {location.pathname === '/leads' && 'CRM Leads Pipeline'}
              {location.pathname === '/invoices' && 'Invoices Ledger & Expense Management'}
              {location.pathname === '/movements' && 'Warehouse Inventory Movements'}
              {location.pathname === '/reports' && 'Business Intelligence Reports'}
              {location.pathname === '/settings' && 'User Management & Access Control'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 font-medium">
              System Time: <span className="font-semibold text-slate-700">2026-06-05</span>
            </span>
          </div>
        </header>

        {/* Content Page body */}
        <main className="flex-grow p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
