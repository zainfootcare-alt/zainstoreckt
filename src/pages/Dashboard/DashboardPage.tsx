import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calculator,
  FileText,
  CreditCard,
  Users,
  ArrowRight,
  Receipt,
  CheckCircle2,
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
    } catch {
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
      notes: paymentNotes || 'Payment received',
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. STORE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Zain Footwear</h1>
          <p className="text-xs text-slate-500 font-medium">Main Store</p>
        </div>
        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-2xs">
          Today, {todayFormatted}
        </span>
      </div>

      {/* 2. SIMPLE SALES SUMMARY */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
            ₹{totalSalesToday.toLocaleString('en-IN')}
          </p>
        </div>

        {/* 3-Way Split */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 text-center sm:text-left">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Cash</p>
            <p className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">
              ₹{cashSalesToday.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 text-center sm:text-left">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Online</p>
            <p className="text-xs sm:text-sm font-black text-indigo-700 mt-0.5">
              ₹{onlineSalesToday.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 text-center sm:text-left">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Due</p>
            <p className={`text-xs sm:text-sm font-black mt-0.5 ${dueSalesToday > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
              ₹{dueSalesToday.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS (2x2 on Mobile, Clean Buttons) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Action 1: New Sale */}
        <button
          onClick={() => navigate('/app/pos')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl shadow-xs transition-all text-center"
        >
          <Calculator className="w-5 h-5 mb-1.5" />
          <span className="font-extrabold text-xs sm:text-sm">New Sale</span>
        </button>

        {/* Action 2: Estimate */}
        <button
          onClick={() => navigate('/app/estimates')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center"
        >
          <FileText className="w-5 h-5 mb-1.5 text-slate-600" />
          <span className="font-extrabold text-xs sm:text-sm">Estimate</span>
        </button>

        {/* Action 3: Receive Payment */}
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center"
        >
          <CreditCard className="w-5 h-5 mb-1.5 text-emerald-600" />
          <span className="font-extrabold text-xs sm:text-sm">+ Payment</span>
        </button>

        {/* Action 4: Parties */}
        <button
          onClick={() => navigate('/app/parties')}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-800 rounded-2xl shadow-2xs transition-all text-center"
        >
          <Users className="w-5 h-5 mb-1.5 text-blue-600" />
          <span className="font-extrabold text-xs sm:text-sm">Parties</span>
        </button>
      </div>

      {/* 4. RECENT ACTIVITY */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Recent Activity</h2>
          <Link
            to="/app/sales"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No sales recorded today yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {latestTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 sm:py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                    <Receipt className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {tx.customer_name || 'Walk-in Customer'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {tx.cash_amount > 0 && tx.online_amount > 0 ? 'Split' : tx.cash_amount > 0 ? 'Cash' : 'Online'} • {formatTime(tx.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-black text-slate-900">
                    ₹{tx.total.toLocaleString('en-IN')}
                  </p>
                  {(tx.due_amount || 0) > 0 && (
                    <span className="text-[9px] font-bold text-amber-600 block">
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
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">Receive Customer Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-5 text-center space-y-1.5">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">Payment Recorded Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSavePayment} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Select Party
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
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
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="500"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('cash')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border ${
                        paymentMode === 'cash'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('upi')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border ${
                        paymentMode === 'upi'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      📱 Online
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                  >
                    Save
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
