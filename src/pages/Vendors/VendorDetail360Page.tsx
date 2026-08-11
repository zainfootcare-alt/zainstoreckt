import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  Building2,
  Printer,
  Send,
  Download,
  IndianRupee,
  CreditCard,
  Phone,
  MapPin,
  ArrowLeft,
  Receipt,
  FileText,
} from 'lucide-react';

export const VendorDetail360Page: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { vendors, purchases, vendorLedgers, vendorPayments } = useShop();

  const party = vendors.find((v) => v.id === vendorId);
  const ledgerEntries = vendorId ? vendorLedgers[vendorId] || [] : [];
  const partyPurchases = purchases.filter((p) => p.vendor_id === vendorId);
  const partyPaymentsList = vendorPayments.filter((p) => p.vendor_id === vendorId);

  if (!party) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500 space-y-4">
        <p>Party file not found.</p>
        <button onClick={() => navigate('/app/vendors')} className="px-4 py-2 bg-slate-900 text-white rounded-xl">
          Back to Parties
        </button>
      </div>
    );
  }

  const totalPurchasesSum = partyPurchases.reduce((sum, p) => sum + p.total, 0);
  const totalPaymentsSum = partyPaymentsList.reduce((sum, p) => sum + p.amount_paid, 0);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR - STATEMENT OF ACCOUNT*\nParty Name: ${party.name}\nCity: ${party.city}\n\nOpening Due: ₹${party.opening_balance.toLocaleString('en-IN')}\nTotal Purchases: ₹${totalPurchasesSum.toLocaleString('en-IN')}\nTotal Payments Made: ₹${totalPaymentsSum.toLocaleString('en-IN')}\nCURRENT OUTSTANDING BALANCE: ₹${party.current_balance.toLocaleString('en-IN')}\n\nThank you.\nRegards,\nZain Footwear`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadCSV = () => {
    const headers = 'Date,Type,Reference,Description,Debit (Payments),Credit (Purchases),Running Balance\n';
    const rows = ledgerEntries
      .map(
        (l) =>
          `"${l.business_date}","${l.transaction_type}","${l.reference_number || ''}","${l.description}","${l.debit}","${l.credit}","${l.running_balance}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${party.name.replace(/\s+/g, '_')}_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PermissionGuard requiredPermission="vendors:view">
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/app/vendors')}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">{party.name}</h1>
              <p className="text-xs text-slate-500 font-medium">
                {party.category} • {party.city} • Contact: {party.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Download Statement
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Send className="w-4 h-4" /> Share Statement on WhatsApp
            </button>
          </div>
        </div>

        {/* SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Opening Due</span>
            <p className="text-lg font-black text-slate-800 mt-1">₹{party.opening_balance.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Purchases</span>
            <p className="text-lg font-black text-slate-800 mt-1">₹{totalPurchasesSum.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Payments Made</span>
            <p className="text-lg font-black text-emerald-700 mt-1">₹{totalPaymentsSum.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-[11px] font-extrabold text-rose-800 uppercase">Current Outstanding</span>
            <p className="text-xl font-black text-rose-600 mt-1">₹{party.current_balance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Complete Party Ledger
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference / Invoice</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit (Payment -)</th>
                  <th className="py-3 px-4 text-right">Credit (Purchase +)</th>
                  <th className="py-3 px-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">
                      No ledger entries recorded yet
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{entry.business_date}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            entry.transaction_type === 'PURCHASE'
                              ? 'bg-amber-100 text-amber-800'
                              : entry.transaction_type === 'PAYMENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{entry.reference_number || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{entry.description}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {entry.debit > 0 ? `-₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-800">
                        {entry.credit > 0 ? `+₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        ₹{entry.running_balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};
