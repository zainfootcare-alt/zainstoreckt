import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calculator,
  History,
  CreditCard,
  Users,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Calendar,
  Filter,
  TrendingUp,
  Building2,
  CheckSquare,
  Clock,
  UserCheck,
  DollarSign,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const DashboardPage: React.FC = () => {
  const { sales, customers, userProfile, attendance, punchAttendance, recordCustomerPayment } = useShop();
  const navigate = useNavigate();

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM'>('TODAY');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Today String
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Start of week (Monday)
  const startOfWeek = new Date();
  const day = startOfWeek.getDay() || 7;
  if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  // Start of month
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Filter sales by selected date range
  const filteredSales = sales.filter((s) => {
    const saleDate = s.created_at.split('T')[0];
    if (dateFilter === 'TODAY') return saleDate === todayStr;
    if (dateFilter === 'YESTERDAY') return saleDate === yesterdayStr;
    if (dateFilter === 'THIS_WEEK') return saleDate >= startOfWeekStr && saleDate <= todayStr;
    if (dateFilter === 'THIS_MONTH') return saleDate >= startOfMonthStr && saleDate <= todayStr;
    if (dateFilter === 'CUSTOM') return saleDate === customDate;
    return true;
  });

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const cashSalesAmount = filteredSales.reduce((sum, s) => sum + s.cash_amount, 0);
  const onlineSalesAmount = filteredSales.reduce((sum, s) => sum + s.online_amount, 0);
  const dueSalesAmount = filteredSales.reduce((sum, s) => sum + (s.due_amount || 0), 0);

  // Attendance check for logged in user
  const hasPunchedToday = attendance.some(
    (a) =>
      a.attendance_date === todayStr &&
      (a.employee_id === userProfile?.id || (userProfile?.full_name && a.employee_name === userProfile.full_name))
  );

  // Latest 5 Transactions
  const latestTransactions = [...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const getFilterLabel = () => {
    if (dateFilter === 'TODAY') return "Today's Sales";
    if (dateFilter === 'YESTERDAY') return "Yesterday's Sales";
    if (dateFilter === 'THIS_WEEK') return "This Week's Sales";
    if (dateFilter === 'THIS_MONTH') return "This Month's Sales";
    return `Sales on ${customDate}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. STORE HEADER & LIVE PUNCH BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Zain Footwear</h1>
          <p className="text-xs text-slate-500 font-medium">
            Welcome, <strong>{userProfile?.full_name || 'Staff'}</strong> ({userProfile?.role || 'Admin'})
          </p>
        </div>

        {/* 1-Tap Attendance Punch Status */}
        <div className="flex items-center space-x-2">
          {hasPunchedToday ? (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Attendance Punched</span>
            </span>
          ) : (
            <button
              onClick={() => punchAttendance(userProfile?.full_name || 'Staff')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Punch In Today</span>
            </button>
          )}

          <Link
            to="/app/my-attendance"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-colors"
          >
            My Log
          </Link>
        </div>
      </div>

      {/* SHOPIFY-STYLE SALES OVERVIEW CARD WITH INTEGRATED DATE FILTER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Card Header with Shopify-style Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Sales
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                ₹{totalSalesAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {filteredSales.length} order{filteredSales.length === 1 ? '' : 's'} {dateFilter === 'TODAY' ? 'today' : 'in selected period'}
            </p>
          </div>

          {/* Shopify-Style Compact Date Filter Dropdown / Pill */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-50 border border-slate-200/90 p-1 rounded-2xl shadow-2xs">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-xs font-black text-slate-800 px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="TODAY">📅 Today</option>
              <option value="YESTERDAY">📅 Yesterday</option>
              <option value="THIS_WEEK">📅 This Week (Mon-Sun)</option>
              <option value="THIS_MONTH">📅 This Month</option>
              <option value="CUSTOM">📅 Custom Date...</option>
            </select>

            {dateFilter === 'CUSTOM' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* 3-Column Payment Breakdown (Shopify metrics style) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          <div className="bg-slate-50/80 rounded-2xl p-3 text-left border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash</p>
            <p className="text-sm sm:text-base font-black text-emerald-700 font-mono mt-0.5">
              ₹{cashSalesAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-3 text-left border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online UPI</p>
            <p className="text-sm sm:text-base font-black text-indigo-700 font-mono mt-0.5">
              ₹{onlineSalesAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-3 text-left border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Udhaar / Due</p>
            <p className={`text-sm sm:text-base font-black font-mono mt-0.5 ${dueSalesAmount > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
              ₹{dueSalesAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. MAIN QUICK ACTIONS (4 Core Hub Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Action 1: New Sale */}
        <button
          onClick={() => navigate('/app/pos')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl shadow-xs transition-all text-center cursor-pointer"
        >
          <Calculator className="w-6 h-6 mb-1.5" />
          <span className="font-extrabold text-xs sm:text-sm">POS Sale</span>
          <span className="text-[10px] text-white/80">Calculator Billing</span>
        </button>

        {/* Action 2: Parties & Khatabook */}
        <button
          onClick={() => navigate('/app/parties')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <Building2 className="w-6 h-6 mb-1.5 text-orange-500" />
          <span className="font-extrabold text-xs sm:text-sm">Parties</span>
          <span className="text-[10px] text-slate-400">Suppliers & Stock</span>
        </button>

        {/* Action 3: To-Do & Daily Tasks */}
        <button
          onClick={() => navigate('/app/todos')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <CheckSquare className="w-6 h-6 mb-1.5 text-emerald-500" />
          <span className="font-extrabold text-xs sm:text-sm">To-Do</span>
          <span className="text-[10px] text-slate-400">Daily Tasks & Goals</span>
        </button>

        {/* Action 4: Sales History */}
        <button
          onClick={() => navigate('/app/sales')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <History className="w-6 h-6 mb-1.5 text-indigo-500" />
          <span className="font-extrabold text-xs sm:text-sm">History</span>
          <span className="text-[10px] text-slate-400">Sales Records</span>
        </button>
      </div>

      {/* 5. RECENT SALES TRANSACTIONS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900">Recent Sales</h3>
          <Link to="/app/sales" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {latestTransactions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No sales recorded yet. Start billing via the POS Calculator!
            </div>
          ) : (
            latestTransactions.map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{sale.customer_name || 'Walk-in Customer'}</p>
                  <p className="text-[11px] text-slate-400">
                    #{sale.receipt_number} • {formatTime(sale.created_at)}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <p className="font-black text-slate-900">₹{sale.total.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    {sale.cash_amount > 0 && sale.online_amount > 0
                      ? 'Split'
                      : sale.cash_amount > 0
                      ? 'Cash'
                      : sale.due_amount > 0
                      ? 'Due'
                      : 'Online'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
