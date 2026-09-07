import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Phone,
  Copy,
  Check,
  Calendar,
  User,
  ShoppingBag,
  Footprints,
  IndianRupee,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { SaleRecord } from '../../types/database.types';
import { useShop } from '../../context/ShopContext';

interface InvoiceDetailModalProps {
  sale: SaleRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const { activeShop, customers, recordCustomerPayment } = useShop();
  const [copied, setCopied] = useState(false);
  const [isSettlingDue, setIsSettlingDue] = useState(false);
  const [duePayMode, setDuePayMode] = useState<'cash' | 'upi'>('cash');
  const [duePayNotes, setDuePayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  if (!isOpen || !sale) return null;

  const linkedCustomer = customers.find(
    (c) => c.id === sale.customer_id || (c.phone && c.phone !== 'N/A' && c.phone === sale.customer_phone)
  );

  // Derive item list
  const items = sale.items && sale.items.length > 0 ? sale.items : [
    {
      item_name: 'Footwear Sale',
      size: 'Standard',
      quantity: 1,
      unit_price: sale.total,
      total_price: sale.total,
    }
  ];

  const totalItemsCount = items.length;
  const totalPairsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const dueAmount = sale.due_amount || 0;
  const isFullyPaid = dueAmount <= 0;

  // Copy invoice number
  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(sale.receipt_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp share
  const handleSendWhatsApp = () => {
    const itemsListText = items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.item_name}* ${it.size ? `(Size UK ${it.size})` : ''} - ${it.quantity || 1} Pair(s) @ ₹${it.unit_price}`
      )
      .join('\n');

    const msg = `*ZAIN FOOTWEAR - INVOICE & ORDER RECEIPT*\n----------------------------------------\n*Invoice No:* #${sale.receipt_number}\n*Date:* ${new Date(sale.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}\n*Store:* ${activeShop?.name || 'Zain Footwear (Main Store)'}\n*Cashier:* ${sale.created_by_name || 'POS Cashier'}\n${sale.customer_name ? `*Customer:* ${sale.customer_name}\n` : ''}----------------------------------------\n*Purchased Items (${totalItemsCount} Items, ${totalPairsCount} Pairs):*\n${itemsListText}\n----------------------------------------\n*Subtotal:* ₹${sale.subtotal.toLocaleString('en-IN')}\n${sale.discount > 0 ? `*Discount:* ₹${sale.discount.toLocaleString('en-IN')}\n` : ''}*Total Amount:* ₹${sale.total.toLocaleString('en-IN')}\n*Paid by Cash:* ₹${sale.cash_amount.toLocaleString('en-IN')}\n*Paid by Online/UPI:* ₹${sale.online_amount.toLocaleString('en-IN')}\n${dueAmount > 0 ? `*Pending Due (Udhaar):* ₹${dueAmount.toLocaleString('en-IN')}\n` : '*Status:* FULLY PAID ✅\n'}----------------------------------------\nThank you for shopping at *Zain Footwear*! Visit again! 👟✨`;

    let phoneStr = '';
    if (sale.customer_phone && sale.customer_phone !== 'N/A') {
      const digits = sale.customer_phone.replace(/\D/g, '');
      if (digits.length === 10) phoneStr = `91${digits}`;
      else if (digits.length > 10) phoneStr = digits;
    }

    if (phoneStr) {
      window.open(`https://wa.me/${phoneStr}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  // Settle invoice due
  const handleSettleDue = async () => {
    if (!linkedCustomer && !sale.customer_id) {
      alert('Cannot settle due: No customer profile linked to this invoice.');
      return;
    }
    const custId = sale.customer_id || linkedCustomer?.id;
    if (!custId) return;

    try {
      setIsSubmittingPay(true);
      await recordCustomerPayment({
        customer_id: custId,
        amount: dueAmount,
        payment_method: duePayMode,
        notes: duePayNotes || `Settlement for Invoice #${sale.receipt_number}`,
      });
      setIsSettlingDue(false);
      onClose();
    } catch (err) {
      console.error('Error settling due:', err);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* HEADER SECTION */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title="Close Invoice"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order & Invoice Breakdown</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                #{sale.receipt_number}
              </h2>
              <button
                onClick={handleCopyInvoiceNumber}
                className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
                title="Copy Invoice Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied && <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>}
              </button>
            </div>

            {/* Status Pill */}
            {isFullyPaid ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Paid In Full
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Due: ₹{dueAmount.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-xs mt-2 pt-2 border-t border-white/10 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(sale.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {sale.created_by_name || 'POS Counter'}
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* CUSTOMER & STORE SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                Customer Details
              </span>
              <p className="font-extrabold text-slate-900 text-xs">
                {sale.customer_name || 'Walk-in Customer'}
              </p>
              {sale.customer_phone && sale.customer_phone !== 'N/A' ? (
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                  <span className="text-[11px] font-mono font-bold text-orange-600">
                    {sale.customer_phone}
                  </span>
                  <a
                    href={`https://wa.me/${sale.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">No phone attached</span>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                Store Location
              </span>
              <p className="font-extrabold text-slate-900 text-xs">
                {activeShop?.name || 'Zain Footwear (Main Store)'}
              </p>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {activeShop?.city || 'Mumbai Central'}
              </span>
            </div>
          </div>

          {/* METRIC RIBBON: ITEM COUNT & PAIRS COUNT */}
          <div className="grid grid-cols-3 gap-2 bg-orange-50/60 p-3 rounded-2xl border border-orange-200/80 text-center">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Items
              </span>
              <p className="text-base font-black text-slate-900">{totalItemsCount} Style{totalItemsCount === 1 ? '' : 's'}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Pairs
              </span>
              <p className="text-base font-black text-orange-600 font-mono">{totalPairsCount} Pair{totalPairsCount === 1 ? '' : 's'}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                Order Value
              </span>
              <p className="text-base font-black text-emerald-700 font-mono">₹{sale.total.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* ITEMIZED FOOTWEAR LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#ff6600]" />
                <span>Purchased Footwear Breakdown ({items.length})</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400">All Sizes UK / IND</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-extrabold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Footwear Category</th>
                    <th className="py-2.5 px-2 text-center">Size</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{it.item_name}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {it.size ? (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200">
                            UK {it.size}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                        {it.quantity || 1}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        ₹{(it.unit_price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                        ₹{(it.total_price || (it.unit_price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FINANCIAL SUMMARY & PAYMENT SPLIT */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-800">₹{sale.subtotal.toLocaleString('en-IN')}</span>
            </div>

            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span className="font-mono">-₹{sale.discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="font-mono text-[#ff6600]">₹{sale.total.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Paid by Cash</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{sale.cash_amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Paid Online / UPI</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{sale.online_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {dueAmount > 0 && (
              <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                    Outstanding Balance (Udhaar)
                  </span>
                  <span className="text-sm font-black font-mono text-amber-950">
                    ₹{dueAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {!isSettlingDue && (
                  <button
                    onClick={() => setIsSettlingDue(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Pay Due Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* INVOICE DUE SETTLEMENT ACCORDION */}
          {isSettlingDue && (
            <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-400 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-slate-900 text-xs">Settle Invoice Due (₹{dueAmount})</h5>
                <button
                  onClick={() => setIsSettlingDue(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDuePayMode('cash')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                        duePayMode === 'cash' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuePayMode('upi')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                        duePayMode === 'upi' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      📱 Online UPI
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks</label>
                  <input
                    type="text"
                    value={duePayNotes}
                    onChange={(e) => setDuePayNotes(e.target.value)}
                    placeholder="e.g. Cleared full balance"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettlingDue(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSettleDue}
                    disabled={isSubmittingPay}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPay ? 'Recording...' : `Receive ₹${dueAmount}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 min-w-[100px] py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 min-w-[100px] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Bill</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
