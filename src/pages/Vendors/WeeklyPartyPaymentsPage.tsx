import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  Calendar,
  IndianRupee,
  Send,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WeeklyPartyPaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendors, paymentAccounts, recordVendorPayment } = useShop();

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [plannedAmounts, setPlannedAmounts] = useState<Record<string, number>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string>(paymentAccounts[0]?.id || '');

  // Filter vendors matching payment day
  const dayVendors = vendors.filter((v) => (v.weekly_payment_day || 'Monday') === selectedDay);

  const handlePlannedAmountChange = (vendorId: string, val: number) => {
    setPlannedAmounts((prev) => ({ ...prev, [vendorId]: val }));
  };

  const handleExecutePayment = (vendorId: string) => {
    const v = vendors.find((vend) => vend.id === vendorId);
    if (!v) return;

    const amtToPay = plannedAmounts[vendorId] !== undefined ? plannedAmounts[vendorId] : v.current_balance;
    if (amtToPay <= 0) return;

    const receipt = recordVendorPayment({
      vendor_id: vendorId,
      amount_paid: amtToPay,
      payment_account_id: selectedAccountId,
      payment_method: 'UPI / Bank Transfer',
      reference_notes: `Weekly ${selectedDay} Payment Plan`,
    });

    const prevBal = v.current_balance || 0;
    const remainingBal = Math.max(0, prevBal - amtToPay);

    // Auto share WhatsApp statement
    const text = encodeURIComponent(
      `Dear ${v.name},\n\nThis is to confirm that we have made a payment of ₹${amtToPay.toLocaleString('en-IN')} against our outstanding balance.\n\nPrevious Balance: ₹${prevBal.toLocaleString('en-IN')}\nPayment Made: ₹${amtToPay.toLocaleString('en-IN')}\nRemaining Balance: ₹${remainingBal.toLocaleString('en-IN')}\n\nThank you.\nRegards,\nZain Footwear`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <PermissionGuard requiredPermission="vendors:view">
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Weekly Payment Schedule
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Weekly Party Payment Flow</h1>
            <p className="text-xs text-slate-500 font-medium">Plan & clear vendor dues by scheduled weekly payment day</p>
          </div>

          <button
            onClick={() => navigate('/app/vendors')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            ← Back to All Parties
          </button>
        </div>

        {/* DAY SELECTOR TABS */}
        <div className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 space-x-2 overflow-x-auto">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all min-w-[100px] ${
                selectedDay === day
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* ACCOUNT SELECTOR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-slate-600">Payment Outflow Account:</span>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
          >
            {paymentAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (Balance: ₹{acc.current_balance.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        {/* VENDORS DUE TABLE FOR SELECTED DAY */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-extrabold text-slate-900 text-sm">
              Parties Scheduled for {selectedDay} ({dayVendors.length} Suppliers)
            </h2>
          </div>

          {dayVendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs font-bold text-slate-400">No parties scheduled for payment on {selectedDay}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Party Name</th>
                    <th className="py-3 px-4 text-right">Total Due</th>
                    <th className="py-3 px-4 text-right">Payment Planned (₹)</th>
                    <th className="py-3 px-4 text-right">Remaining After Payment</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayVendors.map((v) => {
                    const planAmt = plannedAmounts[v.id] !== undefined ? plannedAmounts[v.id] : v.current_balance;
                    const remAfter = Math.max(0, v.current_balance - planAmt);

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {v.name}
                          <p className="text-[10px] text-slate-400 font-medium">{v.city}</p>
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-rose-600">
                          ₹{v.current_balance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <input
                            type="number"
                            value={planAmt}
                            onChange={(e) => handlePlannedAmountChange(v.id, parseFloat(e.target.value) || 0)}
                            className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-right font-black text-slate-900"
                          />
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-slate-800">
                          ₹{remAfter.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleExecutePayment(v.id)}
                            disabled={v.current_balance <= 0}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-end gap-1.5 ml-auto shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" /> Pay & Share Statement
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};
