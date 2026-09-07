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
  ShoppingBag,
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
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-3.5 sm:py-6 space-y-3.5 sm:space-y-5 font-sans">
      {/* 1. SALES / ORDERS OVERVIEW CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
        {/* Card Header with Side Date Selector Button */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {isAdmin ? 'Total Sales' : 'Orders Made'}
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                {isAdmin ? `₹${totalSalesAmount.toLocaleString('en-IN')}` : `${totalOrdersCount} Orders`}
              </span>
              <span className="text-xs text-slate-400 font-medium">({totalOrdersCount} orders)</span>
            </div>
          </div>

          {/* Clean Compact Side Calendar Filter Button */}
          <button
            type="button"
            onClick={() => setIsDateModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-orange-50 active:scale-95 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer flex-shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-[#ff6600]" />
            <span className="text-xs font-bold text-slate-700">
              {currentLabel}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* 3-Column Payment Breakdown */}
        {isAdmin ? (
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="bg-slate-50 rounded-xl p-2.5 text-left border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Cash</p>
              <p className="text-xs sm:text-sm font-black text-emerald-700 font-mono mt-0.5 truncate">
                ₹{cashSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 text-left border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">UPI Online</p>
              <p className="text-xs sm:text-sm font-black text-indigo-700 font-mono mt-0.5 truncate">
                ₹{onlineSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 text-left border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Udhaar / Due</p>
              <p className={`text-xs sm:text-sm font-black font-mono mt-0.5 truncate ${dueSalesAmount > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                ₹{dueSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-2.5 text-left border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Counter Receipts</span>
            <span className="text-xs font-black text-slate-900 font-mono">{totalOrdersCount} Completed</span>
          </div>
        )}
      </div>

      {/* 2. MAIN QUICK ACTIONS (4 Core Hub Tiles - Simple & Compact) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Action 1: POS */}
        <button
          onClick={() => navigate('/app/pos')}
          className="flex flex-col items-center justify-center p-3 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <Calculator className="w-5 h-5 mb-1" />
          <span className="font-black text-xs sm:text-sm">POS Sale</span>
        </button>

        {/* Action 2: Parties */}
        <button
          onClick={() => navigate('/app/parties')}
          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <Building2 className="w-5 h-5 mb-1 text-orange-500" />
          <span className="font-bold text-xs sm:text-sm">Parties</span>
        </button>

        {/* Action 3: To-Do */}
        <button
          onClick={() => navigate('/app/todos')}
          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <CheckSquare className="w-5 h-5 mb-1 text-emerald-500" />
          <span className="font-bold text-xs sm:text-sm">To-Do</span>
        </button>

        {/* Action 4: History */}
        <button
          onClick={() => navigate('/app/sales')}
          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center cursor-pointer"
        >
          <History className="w-5 h-5 mb-1 text-indigo-500" />
          <span className="font-bold text-xs sm:text-sm">History</span>
        </button>
      </div>

      {/* 2.8. CUSTOMER DEMANDS / OUT OF STOCK WISHLIST BANNER */}
      <Link
        to="/app/demands"
        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-2xl shadow-2xs flex items-center justify-between gap-2 hover:brightness-105 transition-all group"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-white block truncate">Customer Demand Book</span>
            <span className="text-[10px] text-white/90 font-medium">
              {customerDemands.length} items recorded
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className="text-[10px] bg-white text-orange-700 font-extrabold px-2 py-0.5 rounded-full">
            {customerDemands.filter((d) => d.status === 'PENDING').length} Pending
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* 3. QUICK INVOICE SEARCH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs">
        <form onSubmit={handleQuickInvoiceSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={quickInvoiceSearch}
              onChange={(e) => setQuickInvoiceSearch(e.target.value)}
              placeholder="Search Invoice # or mobile..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          {quickInvoiceSearch.trim() && (
            <button
              type="submit"
              disabled={matchedQuickSales.length === 0}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>{matchedQuickSales.length > 0 ? `Open` : 'No Match'}</span>
            </button>
          )}
        </form>
      </div>

      {/* 4. RECENT SALES TRANSACTIONS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900">Recent Sales</h3>
          <Link to="/app/sales" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center">
            <span>View All</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {latestTransactions.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-400">
              No sales recorded for {currentLabel}.
            </div>
          ) : (
            latestTransactions.map((sale) => (
              <div
                key={sale.id}
                onClick={() => setSelectedReceipt(sale)}
                className="py-2.5 px-1 hover:bg-orange-50/50 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-orange-600 flex items-center justify-center flex-shrink-0 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                      {sale.customer_name || 'Walk-in Customer'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <span className="font-mono text-slate-600">#{sale.receipt_number}</span>
                      <span>•</span>
                      <span>{formatTime(sale.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono flex-shrink-0 ml-2">
                  <p className="font-black text-slate-900 text-xs sm:text-sm">₹{sale.total.toLocaleString('en-IN')}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    (sale.due_amount || 0) > 0
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-emerald-600 bg-emerald-50'
                  }`}>
                    {(sale.due_amount || 0) > 0 ? `Due: ₹${sale.due_amount}` : 'PAID'}
                  </span>
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
