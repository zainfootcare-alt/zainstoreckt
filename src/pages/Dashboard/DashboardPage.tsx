import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  ShoppingBag,
  IndianRupee,
  CreditCard,
  ShoppingCart,
  Receipt,
  Users,
  AlertCircle,
  TrendingUp,
  Wallet,
  Calculator,
  ShieldCheck,
  Target,
  Truck,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ZainLogo } from '../../components/common/ZainLogo';

export const DashboardPage: React.FC = () => {
  const {
    sales,
    purchases,
    vendorPayments,
    expenses,
    paymentAccounts,
    attendance,
    vendors,
    activeRole,
    userProfile,
  } = useShop();

  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Today's Totals
  const todaySalesList = sales.filter((s) => s.created_at.startsWith(todayStr));
  const todaySalesTotal = todaySalesList.reduce((sum, s) => sum + s.total, 0);
  const todayCashReceived = todaySalesList.reduce((sum, s) => sum + s.cash_amount, 0);
  const todayOnlineReceived = todaySalesList.reduce((sum, s) => sum + s.online_amount, 0);

  const partyOutstandingTotal = vendors.reduce((sum, v) => sum + v.current_balance, 0);

  // Money Position (Accounts)
  const cashAccountBalance = paymentAccounts.find((a) => a.type === 'cash')?.current_balance || 0;
  const onlineAccountBalances = paymentAccounts
    .filter((a) => a.type !== 'cash')
    .reduce((sum, a) => sum + a.current_balance, 0);
  const totalMoneyPosition = cashAccountBalance + onlineAccountBalances;

  // Monthly Summary
  const currentMonthPrefix = todayStr.substring(0, 7);
  const thisMonthSales = sales
    .filter((s) => s.created_at.startsWith(currentMonthPrefix))
    .reduce((sum, s) => sum + s.total, 0);

  // Salesperson Personal Metrics
  const currentUserSales = sales.filter(
    (s) => s.created_by_user_id === (userProfile?.id || 'emp-03') && s.created_at.startsWith(todayStr)
  );
  const mySalesTotal = currentUserSales.reduce((sum, s) => sum + s.total, 0);
  const myTxnCount = currentUserSales.length;
  const dailyTarget = 25000;
  const targetProgress = Math.min(100, Math.round((mySalesTotal / dailyTarget) * 100));

  // The 9 Core Grid App Items (Inspired by screenshot grid cards)
  const adminGridItems = [
    { label: 'POS Sale', path: '/app/pos', icon: Calculator, badge: 'POS', highlight: true },
    { label: 'Purchases', path: '/app/purchases', icon: ShoppingCart },
    { label: 'Parties', path: '/app/vendors', icon: Truck, badge: `${vendors.length}` },
    { label: 'Finance', path: '/app/finance', icon: CreditCard },
    { label: 'Expenses', path: '/app/expenses', icon: Receipt },
    { label: 'Staff Log', path: '/app/staff', icon: Users },
    { label: 'Reports', path: '/app/reports', icon: BarChart3 },
    { label: 'Closing', path: '/app/counter', icon: Wallet },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12">
      {/* PURE WHITE CLEAN HEADER WITH OFFICIAL LOGO & ROLE SWITCH */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs flex flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ZainLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                {activeRole} DASHBOARD
              </h1>
              <span className="text-[9px] font-extrabold uppercase text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Zain
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px] sm:max-w-none">
              {userProfile?.full_name || 'Admin'} • Operations
            </p>
          </div>
        </div>

        {/* Quick Action POS Launcher */}
        <Link
          to="/app/pos"
          className="px-3 py-2 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1 flex-shrink-0"
        >
          <Calculator className="w-4 h-4" />
          <span className="hidden sm:inline">Open POS</span>
          <span className="sm:hidden">POS</span>
        </Link>
      </div>

      {/* 3x3 MAIN GRID ACTION TILES (Responsive for Mobile Screens) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Quick Action Modules</h2>
          <span className="text-[10px] font-bold text-slate-400">Touch Grid</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {adminGridItems.map((item) => {
            const Icon = item.icon;
            const isPos = item.highlight;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col items-center justify-center text-center space-y-1.5 group shadow-2xs ${
                  isPos
                    ? 'bg-black text-white border-orange-500 hover:scale-[1.02] shadow-md'
                    : 'bg-white text-slate-800 border-slate-200/90 hover:border-orange-400'
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isPos ? 'bg-[#ff6600] text-white' : 'bg-orange-50 text-[#ff6600]'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className={`font-black text-[11px] sm:text-xs leading-tight tracking-tight ${isPos ? 'text-white' : 'text-slate-900'}`}>
                    {item.label}
                  </h3>
                  {item.badge && (
                    <span className={`text-[8px] sm:text-[9px] font-extrabold uppercase mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                      isPos ? 'bg-orange-950 text-orange-400 border border-orange-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CLEAN STATS BANNER: TODAY'S MONEY POSITION & SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* TODAY'S SALES & CASH INFLOW */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Sales</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ff6600] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">₹{todaySalesTotal.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-400 font-medium">{todaySalesList.length} sales today</p>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100 text-[11px] font-bold">
            <span className="text-slate-500">Cash: ₹{todayCashReceived.toLocaleString('en-IN')}</span>
            <span className="text-blue-600">Online: ₹{todayOnlineReceived.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* TODAY'S LIQUID TREASURY MONEY POSITION */}
        <div className="bg-black text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-orange-500 shadow-lg flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-[#ff6600]" />
              <span className="text-[11px] font-black uppercase text-white">Money Position</span>
            </div>
            <span className="text-[9px] uppercase font-bold text-orange-400 bg-orange-950 px-2 py-0.5 rounded-full border border-orange-800">
              Live Treasury
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Liquid Money:</p>
            <p className="text-2xl sm:text-3xl font-black text-orange-400 mt-0.5">₹{totalMoneyPosition.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-300 pt-1.5 border-t border-slate-800">
            <span>Float: ₹{cashAccountBalance.toLocaleString('en-IN')}</span>
            <span>Online: ₹{onlineAccountBalances.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* PARTY DUES & OUTSTANDING */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Party Dues</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600">₹{partyOutstandingTotal.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-400 font-medium">{vendors.length} Wholesalers connected</p>
          </div>
          <Link
            to="/app/vendors/weekly-payments"
            className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-extrabold text-[#ff6600] hover:underline"
          >
            <span>Weekly Payment Planner</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* SALES TREND & GROWTH COMPARISON */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ff6600]" /> Store Sales Growth Trend
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Daily, weekly & monthly comparison</p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartTab('daily')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                chartTab === 'daily' ? 'bg-[#ff6600] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setChartTab('weekly')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                chartTab === 'weekly' ? 'bg-[#ff6600] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setChartTab('monthly')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                chartTab === 'monthly' ? 'bg-[#ff6600] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* VISUAL GROWTH BARS */}
        <div className="py-1 space-y-2.5">
          {chartTab === 'daily' && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">Today ({todayStr})</span>
                  <span className="text-[#ff6600]">₹{todaySalesTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6600] rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">Yesterday</span>
                  <span className="text-slate-800">₹14,500</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          )}

          {chartTab === 'weekly' && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">This Week</span>
                  <span className="text-[#ff6600]">₹68,500</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6600] rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">Last Week</span>
                  <span className="text-slate-800">₹54,000</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>
          )}

          {chartTab === 'monthly' && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">August 2026 (Current)</span>
                  <span className="text-[#ff6600]">₹{thisMonthSales.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6600] rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-700">July 2026</span>
                  <span className="text-slate-800">₹1,85,000</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
