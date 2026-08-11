import React from 'react';
import { PieChart, CreditCard, QrCode, Banknote, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShopifyChannelBreakdown: React.FC = () => {
  const navigate = useNavigate();

  const totalAmount = 48500;
  const upiAmount = 23280; // 48%
  const cardAmount = 18430; // 38%
  const cashAmount = 6790;  // 14%

  return (
    <div className="bg-white border border-[#e1e3e5] rounded-2xl p-5 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Payment-Mix & Sales Channels
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#008060]" /> Today's POS Payment Breakdown
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-[#008060] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          Total ₹48,500.00
        </span>
      </div>

      {/* Multi-Segment Stacked Progress Bar (Shopify Polaris style) */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/80">
          <div
            className="h-full bg-purple-600 rounded-l-full transition-all duration-500"
            style={{ width: '48%' }}
            title="UPI QR (48%)"
          />
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: '38%' }}
            title="HDFC Card POS (38%)"
          />
          <div
            className="h-full bg-[#008060] rounded-r-full transition-all duration-500"
            style={{ width: '14%' }}
            title="Cash Register (14%)"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Payment Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* UPI Card */}
        <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <QrCode className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">UPI QR</span>
            </div>
            <span className="text-xs font-extrabold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded font-mono">
              48%
            </span>
          </div>
          <div className="text-lg font-extrabold text-purple-900 font-mono">
            ₹{upiAmount.toLocaleString('en-IN')}.00
          </div>
          <p className="text-[11px] text-purple-700/80">PhonePe / Paytm / GPay QR</p>
        </div>

        {/* Card POS */}
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">HDFC Card</span>
            </div>
            <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded font-mono">
              38%
            </span>
          </div>
          <div className="text-lg font-extrabold text-blue-900 font-mono">
            ₹{cardAmount.toLocaleString('en-IN')}.00
          </div>
          <p className="text-[11px] text-blue-700/80">Swiped Credit / Debit Cards</p>
        </div>

        {/* Cash Register */}
        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Banknote className="w-4 h-4 text-[#008060]" />
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Cash Float</span>
            </div>
            <span className="text-xs font-extrabold text-[#008060] bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
              14%
            </span>
          </div>
          <div className="text-lg font-extrabold text-emerald-900 font-mono">
            ₹{cashAmount.toLocaleString('en-IN')}.00
          </div>
          <p className="text-[11px] text-emerald-700/80">Register Drawer Cash</p>
        </div>
      </div>

      {/* Available Liquidity vs Total Payables Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Combined Cash & Bank Reserves</div>
            <div className="text-base font-extrabold text-emerald-400">
              ₹6,73,950.00
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-slate-400 text-[11px]">Total Vendor Dues Outstanding</div>
            <div className="text-sm font-bold text-rose-400">
              ₹2,49,000.00
            </div>
          </div>
          <button
            onClick={() => navigate('/app/finance')}
            className="px-3 py-1.5 bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 font-sans"
          >
            <span>Finance Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
