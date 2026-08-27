import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calculator,
  History,
  Building2,
  CheckSquare,
  ArrowRight,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import {
  DateFilterModal,
  DateFilterValue,
  getPresetDates,
  formatDateLabel,
} from '../../components/common/DateFilterModal';

export const DashboardPage: React.FC = () => {
  const { sales, activeRole } = useShop();
  const navigate = useNavigate();
  const isAdmin = activeRole === 'ADMIN';

  // Date Filter Modal & State (Default: TODAY)
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const todayPreset = getPresetDates('TODAY');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    preset: 'TODAY',
    startDate: todayPreset.startDate,
    endDate: todayPreset.endDate,
    label: 'Today',
  });

  // Filter sales by selected date range
  const filteredSales = sales.filter((s) => {
    if (dateFilter.preset === 'ALL_TIME') return true;
    const saleDate = s.created_at.split('T')[0];

    if (dateFilter.startDate && dateFilter.endDate) {
      return saleDate >= dateFilter.startDate && saleDate <= dateFilter.endDate;
    }
    if (dateFilter.startDate) {
      return saleDate === dateFilter.startDate;
    }
    return true;
  });

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const cashSalesAmount = filteredSales.reduce((sum, s) => sum + s.cash_amount, 0);
  const onlineSalesAmount = filteredSales.reduce((sum, s) => sum + s.online_amount, 0);
  const dueSalesAmount = filteredSales.reduce((sum, s) => sum + (s.due_amount || 0), 0);
  const totalOrdersCount = filteredSales.length;

  // Latest Transactions (from filtered or all)
  const displaySales = filteredSales.length > 0 ? filteredSales : sales;
  const latestTransactions = [...displaySales]
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

  const currentLabel = formatDateLabel(dateFilter);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. SALES / ORDERS OVERVIEW CARD WITH SIDE CALENDAR POPUP FILTER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Card Header with Side Date Selector Button */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              {isAdmin ? 'Total Sales Revenue' : 'Total Orders Made'}
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-mono">
                {isAdmin ? `₹${totalSalesAmount.toLocaleString('en-IN')}` : `${totalOrdersCount} Orders`}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
              {isAdmin
                ? `${totalOrdersCount} checkout order${totalOrdersCount === 1 ? '' : 's'} (${currentLabel})`
                : `Active counter sales for ${currentLabel}`}
            </p>
          </div>

          {/* Clean Compact Side Calendar Filter Button */}
          <button
            type="button"
            onClick={() => setIsDateModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-orange-50/80 active:scale-95 border border-slate-200 hover:border-orange-300 px-3 py-2 rounded-2xl shadow-2xs transition-all cursor-pointer flex-shrink-0 group"
          >
            <Calendar className="w-4 h-4 text-[#ff6600]" />
            <span className="text-xs font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors">
              {currentLabel}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 transition-colors ml-0.5" />
          </button>
        </div>

        {/* 3-Column Payment Breakdown (Only for Admin to protect confidential figures) */}
        {isAdmin ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-0.5">
            <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 text-left border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash</p>
              <p className="text-xs sm:text-base font-black text-emerald-700 font-mono mt-0.5 truncate">
                ₹{cashSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 text-left border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online UPI</p>
              <p className="text-xs sm:text-base font-black text-indigo-700 font-mono mt-0.5 truncate">
                ₹{onlineSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 text-left border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Udhaar / Due</p>
              <p className={`text-xs sm:text-base font-black font-mono mt-0.5 truncate ${dueSalesAmount > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                ₹{dueSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/80 rounded-2xl p-3 text-left border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Counter Receipts</span>
            <span className="text-xs font-black text-slate-900 font-mono">{totalOrdersCount} Completed</span>
          </div>
        )}
      </div>

      {/* 2. MAIN QUICK ACTIONS (4 Core Hub Tiles) */}
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

      {/* 3. RECENT SALES TRANSACTIONS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900">Recent Sales</h3>
            <p className="text-[11px] text-slate-400 font-medium">{currentLabel}</p>
          </div>
          <Link to="/app/sales" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {latestTransactions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No sales recorded for {currentLabel}. Start billing via the POS Calculator!
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
                      : (sale.due_amount || 0) > 0
                      ? 'Due'
                      : 'Online'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. CALENDAR DATE FILTER MODAL */}
      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        currentValue={dateFilter}
        onApply={(newFilter) => setDateFilter(newFilter)}
      />
    </div>
  );
};

export default DashboardPage;
