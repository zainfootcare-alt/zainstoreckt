import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  Users,
  Calculator,
  MoreHorizontal,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Bell,
  CheckSquare,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../common/ZainLogo';
import { SalesNotificationToast } from '../common/SalesNotificationToast';
import { InvoiceDetailModal } from '../common/InvoiceDetailModal';
import { MyProfileModal } from '../auth/MyProfileModal';
import { SaleRecord } from '../../types/database.types';

export const AppLayout: React.FC = () => {
  const {
    activeShop,
    userProfile,
    activeRole,
    hasPermission,
    isLoading,
    logoutUser,
    openProfileModal,
    latestNotificationSale,
    clearNotificationSale,
  } = useShop();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [toastSelectedSale, setToastSelectedSale] = useState<SaleRecord | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !userProfile && location.pathname.startsWith('/app')) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, userProfile, location.pathname, navigate]);

  // Primary 5 Navigation Tabs (Centered Sale & To-Do before More)
  const primaryNavItems = [
    { label: 'Home', path: '/app/dashboard', icon: Home, matchPaths: ['/app/dashboard', '/app'] },
    { label: 'Parties', path: '/app/parties', icon: Building2, matchPaths: ['/app/parties', '/app/vendors'] },
    { label: 'Sale', path: '/app/pos', icon: Calculator, isSale: true, matchPaths: ['/app/pos'] },
    { label: 'To-Do', path: '/app/todos', icon: CheckSquare, matchPaths: ['/app/todos'] },
    { label: 'More', path: '/app/more', icon: MoreHorizontal, matchPaths: ['/app/more', '/app/expenses', '/app/finance', '/app/staff', '/app/reports', '/app/counter', '/app/settings', '/app/my-attendance'] },
  ];

  const isCurrentActive = (item: typeof primaryNavItems[0]) => {
    return item.matchPaths.some((p) => location.pathname === p || (p !== '/app' && location.pathname.startsWith(p)));
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  const isPosPage = location.pathname === '/app/pos';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col lg:flex-row font-sans antialiased">
      {/* DESKTOP COMPACT SIDEBAR (Hidden on full-screen POS) */}
      {!isPosPage && (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen z-30 justify-between">
          <div>
            {/* Logo Brand Header */}
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
              <Link to="/app/dashboard" className="flex items-center">
                <ZainLogo size="sm" showText={true} />
              </Link>
            </div>

            {/* Shop Branch Badge */}
            <div className="px-4 py-3 border-b border-slate-100/80 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <Building2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="truncate">{activeShop?.name || 'Main Branch'}</span>
              </div>
            </div>

            {/* 5 Primary Navigation Links */}
            <nav className="p-3 space-y-1.5 mt-2">
              {primaryNavItems.map((item) => {
                const active = isCurrentActive(item);
                const Icon = item.icon;

                if (item.isSale) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all shadow-xs ${
                        active
                          ? 'bg-[#ff6600] text-white shadow-orange-500/20'
                          : 'bg-orange-50 text-orange-700 hover:bg-orange-100/80'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : 'bg-orange-200/50'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span>{item.label}</span>
                        <span className="block text-[10px] font-medium opacity-80">New Bill / Fast POS</span>
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      active
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-orange-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Admin Analytics Link */}
              {activeRole === 'ADMIN' && (
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                  <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Intelligence
                  </span>
                  <Link
                    to="/app/analytics"
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      location.pathname.startsWith('/app/analytics')
                        ? 'bg-[#ff6600] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-orange-50/70'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 ${location.pathname.startsWith('/app/analytics') ? 'text-white' : 'text-orange-600'}`} />
                    <div className="flex items-center justify-between flex-1">
                      <span>Analytics</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        location.pathname.startsWith('/app/analytics') ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
                      }`}>
                        Scale
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Sidebar Footer User Profile */}
          <div className="p-3 border-t border-slate-100">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <button
                type="button"
                onClick={openProfileModal}
                className="flex items-center space-x-2.5 min-w-0 text-left hover:bg-orange-50/70 p-1 -m-1 rounded-lg transition-colors cursor-pointer group"
                title="Manage My Profile & PIN"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-orange-500 flex-shrink-0 group-hover:scale-105 transition-transform">
                  {userProfile?.full_name?.charAt(0) || 'Z'}
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-orange-600 transition-colors">{userProfile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{activeRole}</p>
                </div>
              </button>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* COMPACT TOP HEADER (Hidden on full-screen POS) */}
        {!isPosPage && (
          <header className="h-14 sm:h-16 bg-white border-b border-slate-200/90 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Brand Logo on Mobile / Tablet */}
              <div className="lg:hidden">
                <Link to="/app/dashboard">
                  <ZainLogo size="sm" showText={true} />
                </Link>
              </div>

              {/* Today Date Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                <span>Today, {todayFormatted}</span>
              </div>
            </div>

            {/* Right Header Utilities */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">

              <button
                type="button"
                onClick={() => navigate('/app/notifications')}
                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Desktop Profile Button */}
              <button
                type="button"
                onClick={openProfileModal}
                className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
                title="My Profile & Security"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center text-[10px] border border-orange-500">
                  {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">{userProfile?.full_name || 'My Profile'}</span>
                <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                  {activeRole}
                </span>
              </button>

              {/* Mobile User Profile Dropdown */}
              <div className="relative lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-1 p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs border border-slate-800 shadow-2xs">
                    {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-900 truncate">{userProfile?.full_name || 'Saif'}</p>
                      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{activeRole}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        openProfileModal();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700 flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-orange-500" />
                      <span>My Profile & Security</span>
                    </button>
                    {hasPermission('settings:manage') ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/app/settings');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings & Users</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/app/my-attendance');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Attendance Punch</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 border-t border-slate-100 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* MAIN OUTLET (Full-width / responsive container) */}
        <main className={`flex-1 overflow-y-auto ${isPosPage ? 'p-0 pb-0' : 'pb-28 lg:pb-8'}`}>
          <Outlet />
        </main>
      </div>

      {/* MOBILE / TABLET BOTTOM NAVIGATION BAR (Hidden on full-screen POS) */}
      {!isPosPage && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 z-40 flex items-center justify-around shadow-lg pb-[max(0.6rem,env(safe-area-inset-bottom))]">
          {primaryNavItems.map((item) => {
            const active = isCurrentActive(item);
            const Icon = item.icon;

            if (item.isSale) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center -mt-4 px-1"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#ff6600] text-white flex items-center justify-center shadow-md shadow-orange-500/30 active:scale-95 transition-transform border-2 border-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-[#ff6600] mt-0.5">Sale</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[50px] transition-all ${
                  active ? 'text-[#ff6600] font-black' : 'text-slate-500 font-semibold hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#ff6600]' : 'text-slate-400'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* REAL-TIME SALE AUDIO-VISUAL NOTIFICATION TOAST */}
      <SalesNotificationToast
        latestSale={latestNotificationSale}
        onViewInvoice={(sale) => setToastSelectedSale(sale)}
        onDismiss={clearNotificationSale}
      />

      {/* QUICK INVOICE DETAIL & RETURN MODAL */}
      <InvoiceDetailModal
        sale={toastSelectedSale}
        isOpen={!!toastSelectedSale}
        onClose={() => setToastSelectedSale(null)}
      />

      {/* MODAL: MY PROFILE MANAGEMENT */}
      <MyProfileModal />
    </div>
  );
};

export default AppLayout;
