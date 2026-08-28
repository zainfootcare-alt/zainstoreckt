import React from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  ShieldCheck,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  Receipt,
  Wallet,
  ArrowRight,
  Printer,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DailyFinanceCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { sales, expenses, vendorPayments, paymentAccounts, activeCashSession } = useShop();

  const todayStr = new Date().toISOString().split('T')[0];

  const todaySalesList = sales.filter((s) => s.created_at.startsWith(todayStr));
  const totalSales = todaySalesList.reduce((sum, s) => sum + s.total, 0);
  const cashReceived = todaySalesList.reduce((sum, s) => sum + s.cash_amount, 0);
  const onlineReceived = todaySalesList.reduce((sum, s) => sum + s.online_amount, 0);

  const todayPartyPaymentsList = vendorPayments.filter((p) => p.payment_date === todayStr);
  const partyPayments = todayPartyPaymentsList.reduce((sum, p) => sum + p.amount_paid, 0);

  const todayExpensesList = expenses.filter((e) => e.business_date === todayStr && e.status === 'PAID');
  const otherExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);

  const totalOutflow = partyPayments + otherExpenses;
  const netMovement = totalSales - totalOutflow;

  const openingFloat = activeCashSession?.opening_cash || 5000;
  const expectedCash =
    activeCashSession?.expected_cash ||
    openingFloat +
      cashReceived -
      todayPartyPaymentsList
        .filter(
          (p) =>
            p.payment_account_id === 'd4000000-0000-0000-0000-000000000001' ||
            p.payment_account_id === 'acc-cash-01' ||
            p.payment_method?.toLowerCase().includes('cash')
        )
        .reduce((sum, p) => sum + p.amount_paid, 0) -
      todayExpensesList
        .filter(
          (e) =>
            e.payment_account_id === 'd4000000-0000-0000-0000-000000000001' ||
            e.payment_account_id === 'acc-cash-01' ||
            e.payment_method?.toLowerCase().includes('cash')
        )
        .reduce((sum, e) => sum + e.amount, 0);
  const physicalCash = activeCashSession?.counted_cash !== undefined ? activeCashSession.counted_cash : expectedCash;
  const difference = physicalCash - expectedCash;

  const onlineBalances = paymentAccounts
    .filter((a) => a.type !== 'cash')
    .reduce((sum, a) => sum + a.current_balance, 0);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR - TODAY'S FINANCIAL CHECK*\nDate: ${todayStr}\n----------------------------------\nTotal Sales: ₹${totalSales.toLocaleString('en-IN')}\nCash Received: ₹${cashReceived.toLocaleString('en-IN')}\nOnline Received: ₹${onlineReceived.toLocaleString('en-IN')}\n\nParty Payments: ₹${partyPayments.toLocaleString('en-IN')}\nOther Expenses: ₹${otherExpenses.toLocaleString('en-IN')}\nTotal Outflow: ₹${totalOutflow.toLocaleString('en-IN')}\n\nNet Money Movement: ₹${netMovement.toLocaleString('en-IN')}\nCash Counter Expected: ₹${expectedCash.toLocaleString('en-IN')}\nCash Counter Physical: ₹${physicalCash.toLocaleString('en-IN')}\nCash Variance: ₹${difference.toLocaleString('en-IN')}\nOnline Account Total: ₹${onlineBalances.toLocaleString('en-IN')}\n\nRegards,\nZain Footwear`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <PermissionGuard requiredPermission="finance:view">
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              EOD Treasury Audit
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">TODAY'S FINANCIAL CHECK</h1>
            <p className="text-xs text-slate-500 font-medium">Complete daily money movement summary for Zain Footwear</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Check
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Send className="w-4 h-4" /> Share Summary
            </button>
          </div>
        </div>

        {/* MAIN FINANCIAL CHECK BOARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* SECTION A: SALES & INFLOWS */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShoppingBag className="w-4 h-4" /> 1. Sales & Inflows
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Total Sales:</span>
                <span className="text-base font-black text-slate-900">₹{totalSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Cash Received:</span>
                <span className="text-base font-black text-amber-700">₹{cashReceived.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Online Received:</span>
                <span className="text-base font-black text-blue-700">₹{onlineReceived.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-emerald-800 text-[10px] block uppercase">Total Inflow:</span>
                <span className="text-base font-black text-emerald-800">₹{totalSales.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* SECTION B: OUTFLOWS & EXPENSES */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-rose-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Receipt className="w-4 h-4" /> 2. Outflows & Expenses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Party Payments:</span>
                <span className="text-base font-black text-slate-900">₹{partyPayments.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Other Expenses:</span>
                <span className="text-base font-black text-slate-900">₹{otherExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                <span className="text-rose-900 text-[10px] block uppercase">Total Outflow:</span>
                <span className="text-base font-black text-rose-800">₹{totalOutflow.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* NET MOVEMENT */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">NET CASH / ONLINE MOVEMENT:</span>
            <span className="text-2xl font-black text-emerald-400">₹{netMovement.toLocaleString('en-IN')}</span>
          </div>

          {/* SECTION C: COUNTER & ONLINE RECONCILIATION */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Wallet className="w-4 h-4" /> 3. Closing Reconciled Accounts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              {/* Cash Counter */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="text-slate-900 font-extrabold uppercase text-[11px]">Cash Counter Register</h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Cash:</span>
                  <span>₹{expectedCash.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Physical Cash:</span>
                  <span>₹{physicalCash.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900">
                  <span>Difference:</span>
                  <span className={difference === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ₹{difference.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Online Accounts */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="text-slate-900 font-extrabold uppercase text-[11px]">Online & Bank Balances</h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">UPI / QR Merchant:</span>
                  <span>₹{(paymentAccounts.find(a => a.type === 'upi')?.current_balance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card POS Machine:</span>
                  <span>₹{(paymentAccounts.find(a => a.type === 'card')?.current_balance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-emerald-700 font-extrabold">
                  <span>Total Liquid Online:</span>
                  <span>₹{onlineBalances.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};
