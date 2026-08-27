import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  Users,
  Calculator,
  FileText,
  MoreHorizontal,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Bell,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../common/ZainLogo';

export const AppLayout: React.FC = () => {
  const { activeShop, userProfile, activeRole, logoutUser } = useShop();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!userProfile && location.pathname.startsWith('/app')) {
      navigate('/login', { replace: true });
    }
  }, [userProfile, location.pathname, navigate]);

  // Primary 5 Navigation Tabs (Khatabook-inspired Simplicity)
  const primaryNavItems = [
    { label: 'Home', path: '/app/dashboard', icon: Home, matchPaths: ['/app/dashboard', '/app'] },
    { label: 'Parties', path: '/app/parties', icon: Users, matchPaths: ['/app/parties', '/app/vendors'] },
    { label: 'Sale', path: '/app/pos', icon: Calculator, isSale: true, matchPaths: ['/app/pos'] },
    { label: 'Estimates', path: '/app/estimates', icon: FileText, matchPaths: ['/app/estimates'] },
    { label: 'More', path: '/app/more', icon: MoreHorizontal, matchPaths: ['/app/more', '/app/expenses', '/app/finance', '/app/staff', '/app/reports', '/app/counter', '/app/settings'] },
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
            </nav>
          </div>

          {/* Sidebar Footer User Profile */}
          <div className="p-3 border-t border-slate-100">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-orange-500 flex-shrink-0">
                  {userProfile?.full_name?.charAt(0) || 'Z'}
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{userProfile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{activeRole}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/app/notifications')}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* Mobile User Profile Dropdown */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 hover:bg-slate-100 rounded-xl"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs border border-orange-500">
                    {userProfile?.full_name?.charAt(0) || 'Z'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{userProfile?.full_name}</p>
                      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{activeRole}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigate('/app/settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings & Users</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 border-t border-slate-100"
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
        <main className={`flex-1 overflow-y-auto ${isPosPage ? 'p-0 pb-0' : 'pb-20 lg:pb-6'}`}>
          <Outlet />
        </main>
      </div>

      {/* MOBILE / TABLET BOTTOM NAVIGATION BAR (Hidden on full-screen POS) */}
      {!isPosPage && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 z-40 flex items-center justify-around shadow-lg">
          {primaryNavItems.map((item) => {
            const active = isCurrentActive(item);
            const Icon = item.icon;

            if (item.isSale) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-[#ff6600] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform border-2 border-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#ff6600] mt-0.5">Sale</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg min-w-[56px] transition-colors ${
                  active ? 'text-[#ff6600] font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#ff6600]' : 'text-slate-500'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppLayout;
