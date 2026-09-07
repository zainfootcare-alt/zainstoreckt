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
  Search,
  FileText,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { SaleRecord } from '../../types/database.types';
import {
  DateFilterModal,
  DateFilterValue,
  getPresetDates,
  formatDateLabel,
} from '../../components/common/DateFilterModal';
import { InvoiceDetailModal } from '../../components/common/InvoiceDetailModal';
import { AdminFinanceChartCard } from '../../components/dashboard/AdminFinanceChartCard';

export const DashboardPage: React.FC = () => {
  const { sales, customerDemands, activeRole } = useShop();
  const navigate = useNavigate();
  const isAdmin = activeRole === 'ADMIN';

  // Invoice Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);
  const [quickInvoiceSearch, setQuickInvoiceSearch] = useState<string>('');

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
    .slice(0, 6);

  // Quick Invoice Search matches
  const matchedQuickSales = quickInvoiceSearch.trim()
    ? sales.filter(
        (s) =>
          s.receipt_number.toLowerCase().includes(quickInvoiceSearch.toLowerCase()) ||
          (s.customer_name && s.customer_name.toLowerCase().includes(quickInvoiceSearch.toLowerCase())) ||
          (s.customer_phone && s.customer_phone.includes(quickInvoiceSearch))
      )
    : [];

  const handleQuickInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedQuickSales.length > 0) {
      setSelectedReceipt(matchedQuickSales[0]);
    }
  };

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
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 font-sans">
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

      {/* 2.5. ADMIN COMPACT FINANCE & EXPENSE UTILIZATION TRACKER */}
      {isAdmin && <AdminFinanceChartCard />}

      {/* 3. QUICK INVOICE SEARCH & LOOKUP BAR */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-xs">
        <form onSubmit={handleQuickInvoiceSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={quickInvoiceSearch}
              onChange={(e) => setQuickInvoiceSearch(e.target.value)}
              placeholder="Search Invoice # (e.g. ZAIN-1025) or customer name..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          {quickInvoiceSearch.trim() && (
            <button
              type="submit"
              disabled={matchedQuickSales.length === 0}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>{matchedQuickSales.length > 0 ? `Open (#${matchedQuickSales[0].receipt_number})` : 'No Match'}</span>
            </button>
          )}
        </form>

        {/* Quick Matched Chips */}
        {quickInvoiceSearch.trim() && matchedQuickSales.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Found Invoices:</span>
            {matchedQuickSales.slice(0, 3).map((ms) => (
              <button
                key={ms.id}
                type="button"
                onClick={() => {
                  setSelectedReceipt(ms);
                  setQuickInvoiceSearch('');
                }}
                className="text-xs font-mono font-bold text-slate-800 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-[#ff6600]" />
                <span>#{ms.receipt_number} (₹{ms.total})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. RECENT SALES TRANSACTIONS (Clickable to open full Invoice Breakdown) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <span>Recent Sales</span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                Click any order to view items
              </span>
            </h3>
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
              <div
                key={sale.id}
                onClick={() => setSelectedReceipt(sale)}
                className="py-3 px-2 -mx-2 hover:bg-orange-50/50 rounded-2xl flex items-center justify-between text-xs transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-orange-600 flex items-center justify-center flex-shrink-0 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                      {sale.customer_name || 'Walk-in Customer'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span className="font-mono font-bold text-slate-600">#{sale.receipt_number}</span>
                      <span>•</span>
                      <span>{sale.items?.length || 1} Item(s)</span>
                      <span>•</span>
                      <span>{formatTime(sale.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono flex-shrink-0 ml-2">
                  <p className="font-black text-slate-900 text-sm">₹{sale.total.toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-end gap-1 text-[10px]">
                    <span className={`font-bold ${
                      (sale.due_amount || 0) > 0
                        ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded'
                        : 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'
                    }`}>
                      {(sale.due_amount || 0) > 0 ? `Due: ₹${sale.due_amount}` : 'PAID'}
                    </span>
                    <span className="text-slate-300 group-hover:text-orange-400 transition-colors">→</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. CALENDAR DATE FILTER MODAL */}
      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        currentValue={dateFilter}
        onApply={(newFilter) => setDateFilter(newFilter)}
      />

      {/* 6. INVOICE & ORDER DETAILS MODAL */}
      <InvoiceDetailModal
        sale={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};

export default DashboardPage;
