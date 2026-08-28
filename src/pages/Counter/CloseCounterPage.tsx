import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  Wallet,
  ShieldCheck,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const CloseCounterPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCashSession, closeCashCounter, sales, expenses, vendorPayments } = useShop();

  const todayStr = new Date().toISOString().split('T')[0];

  const cashSalesToday = sales
    .filter((s) => s.created_at.startsWith(todayStr))
    .reduce((sum, s) => sum + s.cash_amount, 0);

  const cashExpensesToday = expenses
    .filter((e) => e.business_date === todayStr && e.status === 'PAID' && (e.payment_account_id === 'd4000000-0000-0000-0000-000000000001' || e.payment_account_id === 'acc-cash-01' || e.payment_method?.toLowerCase().includes('cash')))
    .reduce((sum, e) => sum + e.amount, 0);

  const cashPartyPaymentsToday = vendorPayments
    .filter((p) => p.payment_date === todayStr && (p.payment_account_id === 'd4000000-0000-0000-0000-000000000001' || p.payment_account_id === 'acc-cash-01' || p.payment_method?.toLowerCase().includes('cash')))
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const openingFloat = activeCashSession?.opening_cash || 5000;
  const expectedCash = openingFloat + cashSalesToday - cashExpensesToday - cashPartyPaymentsToday;

  const [physicalCashInput, setPhysicalCashInput] = useState<number>(expectedCash);
  const [varianceReason, setVarianceReason] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const variance = physicalCashInput - expectedCash;

  const handleConfirmClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (variance !== 0 && !varianceReason.trim()) {
      alert('A reason note is required for cash variance discrepancy.');
      return;
    }

    closeCashCounter(physicalCashInput, varianceReason);
    setIsConfirmed(true);
  };

  return (
    <PermissionGuard requiredPermission="cash_close:manage">
      <div className="max-w-xl mx-auto space-y-6 pb-10">
        {/* HEADER */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Daily Cash Closing</h1>
          <p className="text-xs text-slate-500 font-medium">
            Reconcile physical cash drawer float with expected sales & expense outflows
          </p>
        </div>

        {!isConfirmed ? (
          <form onSubmit={handleConfirmClosing} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            {/* CASH CALCULATIONS BREAKDOWN CARD */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 font-mono">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Opening Cash Float:</span>
                <span className="font-bold">₹{openingFloat.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-400">
                <span>+ Cash Sales Today:</span>
                <span className="font-bold">+₹{cashSalesToday.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-400">
                <span>- Cash Expenses:</span>
                <span className="font-bold">-₹{cashExpensesToday.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-400">
                <span>- Cash Party Payments:</span>
                <span className="font-bold">-₹{cashPartyPaymentsToday.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                <span className="text-slate-200 uppercase">EXPECTED CASH IN DRAWER:</span>
                <span className="text-2xl text-emerald-400 font-black">₹{expectedCash.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* PHYSICAL CASH INPUT */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                Enter Physical Cash Counted (₹)
              </label>
              <input
                type="number"
                required
                value={physicalCashInput}
                onChange={(e) => setPhysicalCashInput(parseFloat(e.target.value) || 0)}
                className="w-full text-2xl font-black p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-right"
              />
            </div>

            {/* VARIANCE DISPLAY */}
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                variance === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span>Difference / Variance:</span>
              <span className="text-base font-black">
                {variance > 0 ? `+₹${variance.toLocaleString('en-IN')}` : `₹${variance.toLocaleString('en-IN')}`}
              </span>
            </div>

            {/* REASON NOTE IF VARIANCE */}
            {variance !== 0 && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Reason / Explanation Note for Variance *</label>
                <textarea
                  rows={2}
                  required
                  value={varianceReason}
                  onChange={(e) => setVarianceReason(e.target.value)}
                  placeholder="Reason for cash difference..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> CONFIRM & LOCK DAILY CLOSING
            </button>
          </form>
        ) : (
          /* SUCCESS LOCKED CARD */
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Daily Closing Confirmed & Locked</h2>
              <p className="text-xs text-slate-500 mt-1">Expected: ₹{expectedCash.toLocaleString('en-IN')} | Physical: ₹{physicalCashInput.toLocaleString('en-IN')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/app/counter/daily-check')}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                View Final Daily Financial Check <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};
