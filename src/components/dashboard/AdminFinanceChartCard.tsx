import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PieChart,
  Wallet,
  Landmark,
  MoreHorizontal,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminFinanceChartCard: React.FC = () => {
  const { sales, expenses, purchases, vendorPayments, salaryPayments, activeRole } = useShop();
  const isAdmin = activeRole === 'ADMIN';

  // Active Tab: 'SALES' | 'EXPENSES' | 'UTILIZATION'
  const [activeTab, setActiveTab] = useState<'SALES' | 'EXPENSES' | 'UTILIZATION'>('SALES');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Compute 7 Days of the Current Week (Mon - Sun)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Format Date Label e.g. "27 Jan"
      const dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const fullDateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

      // Daily Sales
      const daySales = sales.filter((s) => s.created_at.startsWith(dateStr));
      const salesTotal = daySales.reduce((sum, s) => sum + s.total, 0);
      const cashSales = daySales.reduce((sum, s) => sum + s.cash_amount, 0);
      const onlineSales = daySales.reduce((sum, s) => sum + s.online_amount, 0);

      // Daily Expenses
      const dayExpenses = expenses.filter((e) => (e.expense_date || e.created_at).startsWith(dateStr));
      const expensesTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      // Daily Vendor Payments (Purchase Outflows)
      const dayVendorPay = vendorPayments.filter((vp) => vp.created_at.startsWith(dateStr));
      const vendorPayTotal = dayVendorPay.reduce((sum, vp) => sum + Number(vp.amount_paid), 0);

      // Total Outflow for day
      const totalOutflow = expensesTotal + vendorPayTotal;

      days.push({
        index: i,
        dayName: dayNames[i],
        dateStr,
        dateLabel,
        fullDateLabel,
        salesTotal,
        cashSales,
        onlineSales,
        ordersCount: daySales.length,
        expensesTotal,
        vendorPayTotal,
        totalOutflow,
        isToday: dateStr === now.toISOString().split('T')[0],
      });
    }

    return days;
  }, [sales, expenses, vendorPayments]);

  // Overall Financial Aggregations for Month / Active Lifetime
  const financeSummary = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCashIn = sales.reduce((sum, s) => sum + s.cash_amount, 0);
    const totalOnlineIn = sales.reduce((sum, s) => sum + s.online_amount, 0);
    const totalDue = sales.reduce((sum, s) => sum + (s.due_amount || 0), 0);

    // Expense Categories Breakdown
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalPartyPayments = vendorPayments.reduce((sum, vp) => sum + Number(vp.amount_paid), 0);
    const totalSalaries = salaryPayments.reduce((sum, sp) => sum + Number(sp.gross_salary || 0), 0);

    // Categorized expense breakdown
    const rentExpenses = expenses
      .filter((e) => (e.category_name || e.category || '').toLowerCase().includes('rent'))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const teaAndSnacks = expenses
      .filter((e) => {
        const cat = (e.category_name || e.category || '').toLowerCase();
        return cat.includes('tea') || cat.includes('refreshment') || cat.includes('food');
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const maintenanceAndBills = expenses
      .filter((e) => {
        const cat = (e.category_name || e.category || '').toLowerCase();
        return !cat.includes('rent') && !cat.includes('tea');
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalOutflow = totalPartyPayments + totalExpenses + totalSalaries;
    const netCashflow = totalSales - totalOutflow;

    // Percentages of Fund Utilization
    const partyPct = totalOutflow > 0 ? Math.round((totalPartyPayments / totalOutflow) * 100) : 55;
    const salaryPct = totalOutflow > 0 ? Math.round((totalSalaries / totalOutflow) * 100) : 25;
    const opsPct = totalOutflow > 0 ? Math.max(0, 100 - partyPct - salaryPct) : 20;

    return {
      totalSales,
      totalCashIn,
      totalOnlineIn,
      totalDue,
      totalExpenses,
      totalPartyPayments,
      totalSalaries,
      rentExpenses,
      teaAndSnacks,
      maintenanceAndBills,
      totalOutflow,
      netCashflow,
      partyPct,
      salaryPct,
      opsPct,
    };
  }, [sales, expenses, vendorPayments, salaryPayments]);

  // Find Peak Day for Active Tab to Highlight & Pin Floating Tooltip
  const peakDayIndex = useMemo(() => {
    let maxIdx = 5; // default Saturday
    let maxVal = -1;

    weekDays.forEach((d, idx) => {
      const val = activeTab === 'SALES' ? d.salesTotal : d.totalOutflow;
      if (val > maxVal && val > 0) {
        maxVal = val;
        maxIdx = idx;
      }
    });

    return maxIdx;
  }, [weekDays, activeTab]);

  const selectedIndex = hoveredDayIndex !== null ? hoveredDayIndex : peakDayIndex;
  const activeDayData = weekDays[selectedIndex] || weekDays[0];

  // Dynamic Scale (0 to 25k or max + 20%)
  const maxDayValue = Math.max(
    ...weekDays.map((d) => (activeTab === 'SALES' ? d.salesTotal : d.totalOutflow)),
    25000
  );

  // Format compact amount e.g. 24.5K
  const formatCompactK = (val: number) => {
    if (val >= 1000) {
      const inK = val / 1000;
      return `${inK % 1 === 0 ? inK.toFixed(0) : inK.toFixed(1)}K`;
    }
    return val.toString();
  };

  // Only render full breakdown for ADMIN (protect business secrets)
  if (!isAdmin) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xs space-y-3 select-none transition-all">
      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            {activeTab === 'SALES' && 'Weekly Sales Flow'}
            {activeTab === 'EXPENSES' && 'Expense Outflow'}
            {activeTab === 'UTILIZATION' && 'Fund Utilization'}
          </h3>
        </div>

        {/* 3-Tab Pill Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[10px] sm:text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SALES')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'SALES'
                ? 'bg-white text-indigo-700 font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EXPENSES')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'EXPENSES'
                ? 'bg-white text-rose-700 font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('UTILIZATION')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'UTILIZATION'
                ? 'bg-white text-slate-900 font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Balances
          </button>
        </div>
      </div>

      {/* 2. COMPACT SHORT BAR CHART */}
      <div className="relative pt-6 pb-1 px-1">
        {/* Y-AXIS TICKS & DASHED GRIDLINES */}
        <div className="absolute inset-0 top-6 bottom-6 flex flex-col justify-between pointer-events-none pr-1">
          {['25k', '15k', '5k', '0'].map((tick, i) => (
            <div key={i} className="flex items-center w-full">
              <span className="text-[9px] font-mono font-semibold text-slate-400 w-5 text-left flex-shrink-0">
                {tick}
              </span>
              <div className="flex-1 border-b border-dashed border-slate-100 ml-1" />
            </div>
          ))}
        </div>

        {/* 7 PILLAR BARS CONTAINER */}
        <div className="relative h-24 sm:h-28 ml-6 grid grid-cols-7 gap-1.5 sm:gap-3 items-end z-10">
          {weekDays.map((day, idx) => {
            const rawVal = activeTab === 'SALES' ? day.salesTotal : day.totalOutflow;
            const heightPct = Math.max(8, Math.min(100, (rawVal / maxDayValue) * 100));
            const isSelected = idx === selectedIndex;

            return (
              <div
                key={day.index}
                onMouseEnter={() => setHoveredDayIndex(idx)}
                onMouseLeave={() => setHoveredDayIndex(null)}
                onClick={() => setHoveredDayIndex(idx)}
                className="relative flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* TOOLTIP ON HOVER/ACTIVE */}
                {isSelected && (
                  <div className="absolute -top-9 z-30 pointer-events-none">
                    <div className="relative bg-slate-900 text-white px-2 py-0.5 rounded-lg shadow-md text-center flex flex-col items-center">
                      <span className="text-[8px] text-slate-400 leading-tight">
                        {day.dateLabel}
                      </span>
                      <span className="text-[10px] font-black font-mono tracking-tight text-white">
                        {activeTab === 'SALES' ? formatCompactK(day.salesTotal) : formatCompactK(day.totalOutflow)}
                      </span>
                    </div>
                  </div>
                )}

                {/* THE PILLAR BAR */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[24px] sm:max-w-[32px] rounded-lg sm:rounded-xl transition-all duration-200 ${
                    isSelected
                      ? activeTab === 'SALES'
                        ? 'bg-[#4f46e5] shadow-sm'
                        : 'bg-rose-600 shadow-sm'
                      : 'bg-indigo-100/70 hover:bg-indigo-200/80'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X-AXIS DAY LABELS */}
        <div className="ml-6 grid grid-cols-7 gap-1.5 sm:gap-3 text-center mt-1.5 pt-1 border-t border-slate-100">
          {weekDays.map((day, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={day.index}
                type="button"
                onClick={() => setHoveredDayIndex(idx)}
                className={`text-[10px] font-bold cursor-pointer ${
                  isSelected ? 'text-[#4f46e5] font-black' : 'text-slate-400'
                }`}
              >
                {day.dayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE SELECTED DAY DETAIL STRIP */}
      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
          {activeDayData.dateLabel} {activeDayData.isToday && '(Today)'}
        </span>

        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="text-emerald-700 font-black">
            ₹{activeDayData.salesTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">
            {activeDayData.ordersCount} orders
          </span>
        </div>
      </div>

      {/* 4. EXPENSE & FUND UTILIZATION BREAKDOWN */}
      <div className="pt-0.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-black text-slate-900 uppercase">
          <span className="flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5 text-orange-600" />
            <span>Fund Allocation</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Outflow: ₹{financeSummary.totalOutflow.toLocaleString('en-IN')}
          </span>
        </div>

        {/* 3 Clean Compact Expense Cards */}
        <div className="grid grid-cols-3 gap-1.5 text-left">
          {/* Tile 1: Stock */}
          <div className="bg-indigo-50/60 rounded-xl p-2 border border-indigo-100">
            <p className="text-[9px] font-bold text-indigo-900 truncate">Stock / Parties</p>
            <p className="text-xs sm:text-sm font-black text-indigo-950 font-mono mt-0.5">
              ₹{financeSummary.totalPartyPayments.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Tile 2: Salaries */}
          <div className="bg-amber-50/60 rounded-xl p-2 border border-amber-100">
            <p className="text-[9px] font-bold text-amber-900 truncate">Salaries</p>
            <p className="text-xs sm:text-sm font-black text-amber-950 font-mono mt-0.5">
              ₹{financeSummary.totalSalaries.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Tile 3: Shop Ops */}
          <div className="bg-rose-50/60 rounded-xl p-2 border border-rose-100">
            <p className="text-[9px] font-bold text-rose-900 truncate">Shop Ops</p>
            <p className="text-xs sm:text-sm font-black text-rose-950 font-mono mt-0.5">
              ₹{financeSummary.totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Current Available Balances */}
        <div className="bg-slate-900 text-white rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Cash Drawer</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              ₹{Math.max(0, financeSummary.totalCashIn - financeSummary.totalExpenses).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Bank Balance</span>
            <span className="text-xs sm:text-sm font-black text-indigo-300 font-mono">
              ₹{Math.max(0, financeSummary.totalOnlineIn - financeSummary.totalPartyPayments).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceChartCard;
