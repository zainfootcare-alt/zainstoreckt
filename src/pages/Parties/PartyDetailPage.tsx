import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Plus,
  CreditCard,
  Share2,
  Calendar,
  Receipt,
  CheckCircle2,
  Calculator,
  X,
  FileText,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const PartyDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { customers, customerLedgers, recordCustomerPayment } = useShop();
  const navigate = useNavigate();

  const customer = customers.find((c) => c.id === customerId);
  const ledgerEntries = (customerId && customerLedgers[customerId]) || [];

  // Sort entries descending by date
  const sortedLedger = [...ledgerEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Receive Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'bank'>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm font-bold text-slate-800">Customer not found</p>
        <button
          onClick={() => navigate('/app/parties')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Parties
        </button>
      </div>
    );
  }

  const currentBalance = customer.current_balance || 0;
  const isReceivable = currentBalance > 0;
  const isPayable = currentBalance < 0;
  const isSettled = currentBalance === 0;

  // Handle Save Payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    recordCustomerPayment({
      customer_id: customer.id,
      amount: amt,
      payment_method: paymentMode,
      notes: paymentNotes || 'Payment received',
    });

    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  // WhatsApp Reminder Link
  const getWhatsAppReminderUrl = () => {
    const cleanPhone = (customer.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Dear ${customer.name},\nYour current outstanding balance with Zain Footwear is ₹${currentBalance}.\nPlease make the payment at your earliest convenience.\n\nThank you!`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* 1. TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/parties')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Parties</span>
        </button>

        {customer.phone && customer.phone !== 'N/A' && isReceivable && (
          <a
            href={getWhatsAppReminderUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send Reminder</span>
          </a>
        )}
      </div>

      {/* 2. PARTY PROFILE CARD (Khatabook Inspired) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center border border-orange-500 flex-shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">{customer.name}</h1>
              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{customer.phone || 'No phone number'}</span>
              </p>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Net Balance</span>
            {isReceivable && (
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </p>
                <span className="text-xs font-bold text-emerald-600">You will receive</span>
              </div>
            )}
            {isPayable && (
              <div>
                <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-0.5">
                  ₹{Math.abs(currentBalance).toLocaleString('en-IN')}
                </p>
                <span className="text-xs font-bold text-rose-600">You will give</span>
              </div>
            )}
            {isSettled && (
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-400 mt-0.5">₹0</p>
                <span className="text-xs font-bold text-slate-500">Settled in Full</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. TWO PRIMARY ACTIONS: + Sale / Give Due vs + Payment / Receive Money */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Action 1: New Sale (Give Credit / Sale) */}
          <button
            onClick={() => navigate('/app/pos')}
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center space-x-2 transition-all"
          >
            <Calculator className="w-4 h-4 text-orange-400" />
            <span>+ New Sale</span>
          </button>

          {/* Action 2: Record Payment (Receive Money) */}
          <button
            onClick={() => {
              if (isReceivable) setPaymentAmount(currentBalance.toString());
              setIsPaymentModalOpen(true);
            }}
            className="py-3 px-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>+ Receive Payment</span>
          </button>
        </div>
      </div>

      {/* 4. CHRONOLOGICAL TRANSACTION TIMELINE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Transaction History</h2>
          <span className="text-xs text-slate-500 font-semibold">{sortedLedger.length} Entries</span>
        </div>

        {sortedLedger.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs space-y-1">
            <p className="font-bold text-slate-600">No ledger entries yet</p>
            <p>Make a sale or receive a payment to start recording history.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedLedger.map((entry) => {
              const isSale = entry.transaction_type === 'SALE' || entry.debit > 0;
              const isPayment = entry.transaction_type === 'PAYMENT' || entry.credit > 0;

              return (
                <div key={entry.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                        isPayment ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {isPayment ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-900">
                          {entry.description || (isPayment ? 'Payment Received' : 'Sale on Credit')}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {entry.business_date || entry.created_at.split('T')[0]}
                        {entry.reference_number ? ` • #${entry.reference_number}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isSale && (
                      <p className="text-xs sm:text-sm font-black text-orange-600">
                        +₹{entry.debit.toLocaleString('en-IN')}
                      </p>
                    )}
                    {isPayment && (
                      <p className="text-xs sm:text-sm font-black text-emerald-600">
                        -₹{entry.credit.toLocaleString('en-IN')}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Bal: ₹{entry.running_balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. RECEIVE PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Receive Payment</h3>
                <p className="text-xs text-slate-500 font-medium">From {customer.name}</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <span className="text-slate-500">Current Outstanding: </span>
                <span className="font-black text-slate-900">₹{currentBalance.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
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
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      paymentMode === 'upi'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    📱 Online / UPI
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at counter"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyDetailPage;
