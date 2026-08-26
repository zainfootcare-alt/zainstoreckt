import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Calculator,
  FileText,
  CreditCard,
  Users,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Phone,
  User,
  X,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const DashboardPage: React.FC = () => {
  const { sales, customers, recordCustomerPayment } = useShop();
  const navigate = useNavigate();

  // Quick Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'bank'>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.created_at.startsWith(todayStr));

  const totalSalesToday = todaySales.reduce((sum, s) => sum + s.total, 0);
  const cashSalesToday = todaySales.reduce((sum, s) => sum + s.cash_amount, 0);
  const onlineSalesToday = todaySales.reduce((sum, s) => sum + s.online_amount, 0);
  const dueSalesToday = todaySales.reduce((sum, s) => sum + (s.due_amount || 0), 0);

  // Latest 5 Transactions
  const latestTransactions = [...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!selectedCustomerId || isNaN(amt) || amt <= 0) return;

    recordCustomerPayment({
      customer_id: selectedCustomerId,
      amount: amt,
      payment_method: paymentMode,
      notes: paymentNotes || 'Customer payment received from Home',
    });

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setIsPaymentModalOpen(false);
      setSelectedCustomerId('');
      setPaymentAmount('');
      setPaymentNotes('');
    }, 1000);
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. CLEAN STORE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Zain Footwear</h1>
          <p className="text-xs font-semibold text-slate-500">Retail POS & Store Operations</p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
            Today, {todayFormatted}
          </span>
        </div>
      </div>

      {/* 2. SIMPLE SALES SUMMARY (Khatabook Inspired) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sales</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            ₹{totalSalesToday.toLocaleString('en-IN')}
          </p>
        </div>

        {/* 3-Way Payment Split Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 text-center sm:text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Cash</p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-0.5">
              ₹{cashSalesToday.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center sm:text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Online</p>
            <p className="text-sm sm:text-base font-extrabold text-indigo-700 mt-0.5">
              ₹{onlineSalesToday.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center sm:text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Due</p>
            <p className={`text-sm sm:text-base font-extrabold mt-0.5 ${dueSalesToday > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
              ₹{dueSalesToday.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS (Large, Touch-Friendly Buttons) */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Action 1: New Sale (Prominent Primary Highlight) */}
          <button
            onClick={() => navigate('/app/pos')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl shadow-sm transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm leading-tight">New Sale</span>
            <span className="text-[10px] text-white/80 font-medium mt-0.5">Fast Calculator</span>
          </button>

          {/* Action 2: Estimate */}
          <button
            onClick={() => navigate('/app/estimates')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm leading-tight">Estimate</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Create & Share</span>
          </button>

          {/* Action 3: Payment */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex flex-col items-center justify-center p-4 sm:p-5 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm leading-tight">Payment</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Receive Money</span>
          </button>

          {/* Action 4: Parties */}
          <button
            onClick={() => navigate('/app/parties')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm leading-tight">Parties</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Customer Ledger</span>
          </button>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY (Latest 5 Transactions) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Recent Activity</h2>
          <Link
            to="/app/sales"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No sales recorded today yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {latestTransactions.map((tx) => (
              <div key={tx.id} className="py-3 sm:py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                    <Receipt className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-slate-900">
                        {tx.customer_name || 'Walk-in Customer'}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400">
                        #{tx.receipt_number}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium mt-0.5">
                      <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold">
                        {tx.cash_amount > 0 && tx.online_amount > 0
                          ? 'Split'
                          : tx.cash_amount > 0
                          ? 'Cash'
                          : 'Online'}
                      </span>
                      <span>•</span>
                      <span>{formatTime(tx.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs sm:text-sm font-black text-slate-900">
                    ₹{tx.total.toLocaleString('en-IN')}
                  </p>
                  {(tx.due_amount || 0) > 0 && (
                    <span className="text-[10px] text-amber-600 font-bold block">
                      Due: ₹{tx.due_amount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK RECEIVE PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Receive Customer Payment</h3>
                <p className="text-[11px] text-slate-500 font-medium">Record money received from party</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900">Payment Recorded Successfully!</p>
                <p className="text-xs text-slate-500">Customer ledger updated.</p>
              </div>
            ) : (
              <form onSubmit={handleSavePayment} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Select Customer / Party
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      const cust = customers.find((c) => c.id === e.target.value);
                      if (cust && (cust.current_balance || 0) > 0) {
                        setPaymentAmount(cust.current_balance!.toString());
                      }
                    }}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">-- Choose Party --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.current_balance && c.current_balance > 0 ? `(Due: ₹${c.current_balance})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('cash')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMode === 'cash'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('upi')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMode === 'upi'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      📱 Online / UPI
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Cash received by cashier"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Save Payment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
