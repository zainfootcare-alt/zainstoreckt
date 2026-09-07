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
      .filter((e) => (e.category || '').toLowerCase().includes('rent'))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const teaAndSnacks = expenses
      .filter((e) => (e.category || '').toLowerCase().includes('tea') || (e.category || '').toLowerCase().includes('refreshment') || (e.category || '').toLowerCase().includes('food'))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const maintenanceAndBills = expenses
      .filter((e) => !((e.category || '').toLowerCase().includes('rent')) && !((e.category || '').toLowerCase().includes('tea')))
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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5 select-none transition-all">
      {/* 1. HEADER SECTION (Exact Title & Mini Tab Switcher) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {activeTab === 'SALES' && 'Total Sales'}
              {activeTab === 'EXPENSES' && 'Expense Outflow'}
              {activeTab === 'UTILIZATION' && 'Fund Utilization'}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Weekly View
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Real-time sales, party payments & store expense tracking
          </p>
        </div>

        {/* 3-Tab Pill Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[10px] sm:text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SALES')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'UTILIZATION'
                ? 'bg-white text-slate-900 font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Balances
          </button>
        </div>
      </div>

      {/* 2. COMPACT SHORT BAR CHART (Exact reference design with short height & floating bubble) */}
      <div className="relative pt-8 pb-1 px-1">
        {/* Y-AXIS TICKS & DASHED HORIZONTAL GRIDLINES */}
        <div className="absolute inset-0 top-8 bottom-6 flex flex-col justify-between pointer-events-none pr-2">
          {['25k', '20k', '15k', '10k', '5k', '0'].map((tick, i) => (
            <div key={i} className="flex items-center w-full">
              <span className="text-[9px] font-mono font-semibold text-slate-400 w-6 text-left flex-shrink-0">
                {tick}
              </span>
              <div className="flex-1 border-b border-dashed border-slate-100/90 ml-1.5" />
            </div>
          ))}
        </div>

        {/* 7 PILLAR BARS CONTAINER (Short height: 110px) */}
        <div className="relative h-28 sm:h-32 ml-7 grid grid-cols-7 gap-2 sm:gap-3 items-end z-10">
          {weekDays.map((day, idx) => {
            const rawVal = activeTab === 'SALES' ? day.salesTotal : day.totalOutflow;
            // Height calculation percentage (minimum 6% for visual presence)
            const heightPct = Math.max(6, Math.min(100, (rawVal / maxDayValue) * 100));
            const isSelected = idx === selectedIndex;

            return (
              <div
                key={day.index}
                onMouseEnter={() => setHoveredDayIndex(idx)}
                onMouseLeave={() => setHoveredDayIndex(null)}
                onClick={() => setHoveredDayIndex(idx)}
                className="relative flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* FLOATING DARK TOOLTIP BUBBLE (Over the active / hovered bar) */}
                {isSelected && (
                  <div className="absolute -top-11 z-30 animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
                    <div className="relative bg-[#1e2330] text-white px-2.5 py-1 rounded-xl shadow-lg text-center flex flex-col items-center min-w-[72px]">
                      <span className="text-[9px] font-medium text-slate-300 leading-tight">
                        {day.dateLabel}
                      </span>
                      <span className="text-xs font-black font-mono tracking-tight text-white">
                        {activeTab === 'SALES' ? formatCompactK(day.salesTotal) : formatCompactK(day.totalOutflow)}
                      </span>
                      {/* Downward pointing arrow */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1e2330]" />
                    </div>
                  </div>
                )}

                {/* THE PILLAR BAR */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[28px] sm:max-w-[34px] rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? activeTab === 'SALES'
                        ? 'bg-[#4f46e5] shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                        : 'bg-rose-600 shadow-md shadow-rose-500/30 ring-2 ring-rose-400/40'
                      : 'bg-indigo-100/60 hover:bg-indigo-200/80 border border-indigo-200/50'
                  }`}
                >
                  {/* Subtle Diagonal Striped Pattern for Non-selected Bars */}
                  {!isSelected && (
                    <div
                      className="w-full h-full rounded-xl sm:rounded-2xl opacity-40"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(99, 102, 241, 0.25) 3px, rgba(99, 102, 241, 0.25) 6px)`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-AXIS DAY LABELS (M, T, W, T, F, S, S) */}
        <div className="ml-7 grid grid-cols-7 gap-2 sm:gap-3 text-center mt-2 pt-1 border-t border-slate-100">
          {weekDays.map((day, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={day.index}
                type="button"
                onClick={() => setHoveredDayIndex(idx)}
                className={`text-[11px] font-bold transition-colors cursor-pointer ${
                  isSelected ? 'text-[#4f46e5] font-black scale-110' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {day.dayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE SELECTED DAY DETAIL STRIP */}
      <div className="bg-slate-50/90 rounded-2xl p-2.5 sm:p-3 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse" />
          <span className="font-extrabold text-slate-800">
            {activeDayData.fullDateLabel} {activeDayData.isToday && '(Today)'}
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px] sm:text-xs">
          <span className="text-emerald-700 font-bold">
            Sales: ₹{activeDayData.salesTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-rose-700 font-bold">
            Outflow: ₹{activeDayData.totalOutflow.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-bold">
            {activeDayData.ordersCount} Bill{activeDayData.ordersCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* 4. EXPENSE & FUND UTILIZATION BREAKDOWN (Where is money going & balances) */}
      <div className="pt-1 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-black text-slate-900 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-orange-600" />
            <span>Fund Utilization & Cash Tracking</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 lowercase font-normal">
            Total Outflow: ₹{financeSummary.totalOutflow.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Multi-segment Fund Utilization Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${financeSummary.partyPct}%` }}
            className="bg-indigo-600 h-full transition-all duration-500"
            title={`Supplier Purchases: ${financeSummary.partyPct}%`}
          />
          <div
            style={{ width: `${financeSummary.salaryPct}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Staff Salaries: ${financeSummary.salaryPct}%`}
          />
          <div
            style={{ width: `${financeSummary.opsPct}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Shop Ops & Rent: ${financeSummary.opsPct}%`}
          />
        </div>

        {/* 3 Core Expense & Fund Utilization Cards */}
        <div className="grid grid-cols-3 gap-2 text-left">
          {/* Tile 1: Party / Supplier Stock Purchases */}
          <div className="bg-indigo-50/60 rounded-2xl p-2.5 border border-indigo-100 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-900 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-600" />
                <span>Stock / Parties</span>
              </span>
              <span className="text-[9px] font-black text-indigo-700 bg-indigo-200/60 px-1.5 py-0.2 rounded-full font-mono">
                {financeSummary.partyPct}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-indigo-950 font-mono">
              ₹{financeSummary.totalPartyPayments.toLocaleString('en-IN')}
            </p>
            <p className="text-[9px] text-indigo-600 truncate">Agra, Delhi & Metro</p>
          </div>

          {/* Tile 2: Staff Salary & Attendance Advances */}
          <div className="bg-amber-50/60 rounded-2xl p-2.5 border border-amber-100 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-600" />
                <span>Salaries</span>
              </span>
              <span className="text-[9px] font-black text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded-full font-mono">
                {financeSummary.salaryPct}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-amber-950 font-mono">
              ₹{financeSummary.totalSalaries.toLocaleString('en-IN')}
            </p>
            <p className="text-[9px] text-amber-600 truncate">Staff & Daily Advances</p>
          </div>

          {/* Tile 3: Store Rent, Electricity & Misc */}
          <div className="bg-rose-50/60 rounded-2xl p-2.5 border border-rose-100 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-900 flex items-center gap-1">
                <Zap className="w-3 h-3 text-rose-600" />
                <span>Shop Ops</span>
              </span>
              <span className="text-[9px] font-black text-rose-800 bg-rose-200/60 px-1.5 py-0.2 rounded-full font-mono">
                {financeSummary.opsPct}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-rose-950 font-mono">
              ₹{financeSummary.totalExpenses.toLocaleString('en-IN')}
            </p>
            <p className="text-[9px] text-rose-600 truncate">Rent, Bills & Tea</p>
          </div>
        </div>

        {/* Current Available Balances Bar (Cash in Drawer & Bank) */}
        <div className="bg-slate-900 text-white rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Cash Drawer Balance
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                ₹{Math.max(0, financeSummary.totalCashIn - financeSummary.totalExpenses).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Online / Bank Balance
              </span>
              <span className="text-xs sm:text-sm font-black text-indigo-300 font-mono">
                ₹{Math.max(0, financeSummary.totalOnlineIn - financeSummary.totalPartyPayments).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
              Net Shop Position
            </span>
            <span
              className={`text-xs sm:text-sm font-black font-mono ${
                financeSummary.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {financeSummary.netCashflow >= 0 ? '+' : ''}₹{financeSummary.netCashflow.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceChartCard;
