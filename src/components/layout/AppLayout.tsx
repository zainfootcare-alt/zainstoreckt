import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  Calculator,
  Truck,
  ShoppingCart,
  CreditCard,
  Receipt,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
  Bell,
  LogOut,
  User,
  Building2,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useShop, ActiveRole } from '../../context/ShopContext';
import { ZainLogo } from '../common/ZainLogo';
import { PwaInstallButton } from '../common/PwaInstallButton';

export const AppLayout: React.FC = () => {
  const { organization, shops, activeShop, setActiveShop, userProfile, activeRole, hasPermission, logoutUser } = useShop();
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!userProfile && location.pathname.startsWith('/app')) {
      navigate('/login', { replace: true });
    }
  }, [userProfile, location.pathname, navigate]);

  // The 9 core operational modules matching prompt requirements
  const navigationItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: Home, perm: 'dashboard:view' },
    { label: 'Sales / Calculator', path: '/app/pos', icon: Calculator, perm: 'sales:create' },
    { label: 'Parties / Suppliers', path: '/app/vendors', icon: Truck, perm: 'vendors:view' },
    { label: 'Purchases', path: '/app/purchases', icon: ShoppingCart, perm: 'purchases:view' },
    { label: 'Finance & Accounts', path: '/app/finance', icon: CreditCard, perm: 'finance:view' },
    { label: 'Expenses', path: '/app/expenses', icon: Receipt, perm: 'expenses:view' },
    { label: 'Staff & Attendance', path: '/app/staff', icon: Users, perm: 'staff:view' },
    { label: 'Reports', path: '/app/reports', icon: BarChart3, perm: 'reports:view' },
    { label: 'User & System Roles', path: '/app/settings', icon: Settings, perm: 'settings:manage' },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased pb-24 lg:pb-0">
      {/* COMPACT STICKY TOP BAR OPTIMIZED FOR MOBILE */}
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Toggle navigation drawer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Official Zain Footwear Logo (Icon only on phone, full text on tablet+) */}
          <Link to="/app/dashboard" className="flex items-center">
            <span className="sm:hidden">
              <ZainLogo size="sm" showText={false} />
            </span>
            <span className="hidden sm:inline-block">
              <ZainLogo size="sm" showText={true} />
            </span>
          </Link>

          {/* Fresh Static Shop Name Badge (No Dropdown Popup) */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-orange-50/80 rounded-xl border border-orange-200/80 text-xs font-extrabold text-orange-950 min-h-[34px] ml-1 sm:ml-3">
            <Building2 className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            <span className="max-w-[110px] sm:max-w-[180px] truncate text-[11px] font-black">
              {activeShop ? activeShop.name.replace('Zain Footwear ', '') : 'Main Store'}
            </span>
          </div>
        </div>

        {/* Right Topbar Controls: PWA Install Button, Notifications & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <PwaInstallButton className="hidden sm:inline-flex" />

          <button
            onClick={() => navigate('/app/notifications')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="w-2 h-2 rounded-full bg-[#ff6600] absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-1.5 p-1 hover:bg-slate-100 rounded-xl text-xs font-medium text-slate-700 transition-colors min-h-[36px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-xs border border-orange-500">
                {userProfile?.full_name?.charAt(0) || 'Z'}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-bold text-slate-900 leading-tight text-xs">{userProfile?.full_name || 'User'}</p>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{activeRole}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 sm:w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{userProfile?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{userProfile?.email}</p>
                  <div className="mt-2 text-[10px] uppercase font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block">
                    Logged In Role: {activeRole}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>User & System Roles</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR (230px) */}
        <aside className="hidden lg:block w-[230px] bg-white border-r border-slate-200 flex-shrink-0 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Shop Operations Navigation
          </div>
          {navigationItems
            .filter((item) => hasPermission(item.perm))
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[42px] ${
                    isActive
                      ? 'bg-[#ff6600] text-white shadow-md'
                      : 'text-slate-600 hover:bg-orange-50 hover:text-orange-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </aside>

        {/* MOBILE DRAWER */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
            <div className="relative w-[270px] bg-white h-full shadow-2xl flex flex-col p-4 z-50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <ZainLogo size="sm" showText={true} />
                <button onClick={() => setIsMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-1">
                {navigationItems
                  .filter((item) => hasPermission(item.perm))
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${
                          isActive ? 'bg-[#ff6600] text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY AREA (With ample bottom padding for floating mobile dock) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* FLOATING BOTTOM ACTION DOCK (Featuring Official Zain Logo Theme & Central Floating Calculator Button) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-2xl flex items-center justify-around">
        {/* Tab 1: Home */}
        <Link
          to="/app/dashboard"
          className={`flex flex-col items-center justify-center text-[10px] font-extrabold transition-colors py-1 ${
            location.pathname === '/app/dashboard' ? 'text-[#ff6600]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        {/* Tab 2: Parties */}
        <Link
          to="/app/vendors"
          className={`flex flex-col items-center justify-center text-[10px] font-extrabold transition-colors py-1 ${
            location.pathname.startsWith('/app/vendors') ? 'text-[#ff6600]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>Parties</span>
        </Link>

        {/* PROMINENT CENTER FLOATING CIRCULAR CALCULATOR BUTTON */}
        <Link
          to="/app/pos"
          className="relative -top-4 flex items-center justify-center"
          title="Open Sales Calculator POS"
        >
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center border-4 border-orange-500 hover:scale-105 transition-transform active:scale-95 group">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff6600] group-hover:rotate-12 transition-transform" />
          </div>
        </Link>

        {/* Tab 4: Finance */}
        <Link
          to="/app/finance"
          className={`flex flex-col items-center justify-center text-[10px] font-extrabold transition-colors py-1 ${
            location.pathname.startsWith('/app/finance') ? 'text-[#ff6600]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>Finance</span>
        </Link>

        {/* Tab 5: Reports */}
        <Link
          to="/app/reports"
          className={`flex flex-col items-center justify-center text-[10px] font-extrabold transition-colors py-1 ${
            location.pathname.startsWith('/app/reports') ? 'text-[#ff6600]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </Link>
      </div>
    </div>
  );
};
