import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Receipt,
  Truck,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  DollarSign,
  History,
  ShieldCheck,
  Building2,
  LogOut,
  ChevronRight,
  Calculator,
  Bell,
  Coins,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const MoreHubPage: React.FC = () => {
  const { activeShop, userProfile, activeRole, logoutUser } = useShop();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const sections = [
    {
      title: 'Operations',
      items: [
        {
          label: 'Expenses & Petty Cash',
          desc: 'Shop rent, tea, transport & daily bills',
          path: '/app/expenses',
          icon: Receipt,
          color: 'text-amber-600 bg-amber-50',
        },
        {
          label: 'Suppliers & Purchases',
          desc: 'Vendor directory, bills & weekly payouts',
          path: '/app/vendors',
          icon: Truck,
          color: 'text-blue-600 bg-blue-50',
        },
        {
          label: 'Staff, Attendance & Payroll',
          desc: 'Daily punch, advances & salary disbursement',
          path: '/app/staff',
          icon: Users,
          color: 'text-purple-600 bg-purple-50',
        },
        {
          label: 'Cash Drawer & Shifts',
          desc: 'Opening float, denomination check & EOD audit',
          path: '/app/counter',
          icon: Coins,
          color: 'text-emerald-600 bg-emerald-50',
        },
      ],
    },
    {
      title: 'Business & Intelligence',
      items: [
        {
          label: 'All Sales History',
          desc: 'Search past receipts, order records & filters',
          path: '/app/sales',
          icon: History,
          color: 'text-orange-600 bg-orange-50',
        },
        {
          label: 'Finance & Profit / Loss',
          desc: 'Net operating margins, COGS & accounts',
          path: '/app/finance',
          icon: DollarSign,
          color: 'text-indigo-600 bg-indigo-50',
        },
        {
          label: 'Reports & Tax Summary',
          desc: 'Category sales, payment distribution & CSV export',
          path: '/app/reports',
          icon: BarChart3,
          color: 'text-cyan-600 bg-cyan-50',
        },
      ],
    },
    {
      title: 'System & Preferences',
      items: [
        {
          label: 'User Management & Roles',
          desc: 'Admin, Manager, Cashier credentials & PINs',
          path: '/app/settings',
          icon: Settings,
          color: 'text-slate-600 bg-slate-100',
        },
        {
          label: 'Alerts & Notifications',
          desc: 'Drawer approvals & vendor due reminders',
          path: '/app/notifications',
          icon: Bell,
          color: 'text-rose-600 bg-rose-50',
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">More Operations</h1>
        <p className="text-xs font-semibold text-slate-500">Secondary tools, reports, staff & administration</p>
      </div>

      {/* Active User Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center border border-orange-500">
            {userProfile?.full_name?.charAt(0) || 'Z'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{userProfile?.full_name || 'User'}</h3>
            <p className="text-xs text-slate-500">{activeShop?.name || 'Zain Footwear Main Store'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[10px] font-black uppercase rounded-lg border border-orange-200">
            {activeRole}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Menu Categorized Sections */}
      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-2.5">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
              {sec.title}
            </h2>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {sec.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{item.desc}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreHubPage;
