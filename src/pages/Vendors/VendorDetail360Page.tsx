import React, { useState, useMemo } from 'react';
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
  ShoppingBag,
  Footprints,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Share2,
  Calendar,
  AlertCircle,
  Banknote,
  Smartphone,
  Eye,
  Trash2,
  Paperclip,
  Image,
} from 'lucide-react';
import { Purchase, VendorPayment } from '../../types/database.types';

export const VendorDetail360Page: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const {
    activeShop,
    vendors,
    purchases,
    vendorLedgers,
    vendorPayments,
    paymentAccounts,
    recordPurchase,
    payPurchaseDue,
    recordVendorPayment,
  } = useShop();

  const party = vendors.find((v) => v.id === vendorId);
  const ledgerEntries = vendorId ? vendorLedgers[vendorId] || [] : [];
  const partyPurchases = useMemo(() => {
    return purchases
      .filter((p) => p.vendor_id === vendorId)
      .sort((a, b) => new Date(b.business_date || b.created_at).getTime() - new Date(a.business_date || a.created_at).getTime());
  }, [purchases, vendorId]);

  const partyPaymentsList = useMemo(() => {
    return vendorPayments
      .filter((p) => p.vendor_id === vendorId)
      .sort((a, b) => new Date(b.payment_date || b.created_at).getTime() - new Date(a.payment_date || a.created_at).getTime());
  }, [vendorPayments, vendorId]);

  // Sub-tabs: 'INVOICES' (Purchase Bills & Items) vs 'LEDGER' (Khata) vs 'PAYMENTS'
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'LEDGER' | 'PAYMENTS'>('INVOICES');

  // Selected Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Purchase | null>(null);
  const [selectedAttachedBill, setSelectedAttachedBill] = useState<Purchase | null>(null);

  // Pay Due Modal State (Can be for specific invoice or whole party)
  const [isPayDueModalOpen, setIsPayDueModalOpen] = useState<boolean>(false);
  const [payTargetPurchase, setPayTargetPurchase] = useState<Purchase | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [payAccountId, setPayAccountId] = useState<string>(paymentAccounts[0]?.id || '');
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [payNotesInput, setPayNotesInput] = useState<string>('');

  // Add Purchase Modal State
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState<boolean>(false);
  const [newBillNumber, setNewBillNumber] = useState<string>(`INV-${Date.now().toString().slice(-4)}`);
  const [newBillDate, setNewBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPaidNow, setNewPaidNow] = useState<string>('0');
  const [newPurAccountId, setNewPurAccountId] = useState<string>(paymentAccounts[0]?.id || '');
  const [newPurNotes, setNewPurNotes] = useState<string>('');
  const [newAttachmentPath, setNewAttachmentPath] = useState<string>('');

  // Dynamic Item Rows for New Purchase
  const [itemRows, setItemRows] = useState<
    Array<{
      id: string;
      category: string;
      item_name: string;
      size: string;
      quantity: number;
      unit_price: number;
    }>
  >([
    {
      id: '1',
      category: 'Leather Formal Shoes',
      item_name: 'Leather Formal Shoes',
      size: '8',
      quantity: 12,
      unit_price: 650,
    },
  ]);

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
  const currentDue = party.current_balance || 0;

  // Calculate Subtotal for New Purchase Modal
  const calculatedItemsTotal = itemRows.reduce((sum, r) => sum + r.quantity * r.unit_price, 0);

  // Add Item Row
  const handleAddItemRow = () => {
    setItemRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        category: 'Sneakers & Casuals',
        item_name: 'Sneakers & Casuals',
        size: '9',
        quantity: 12,
        unit_price: 550,
      },
    ]);
  };

  // Remove Item Row
  const handleRemoveItemRow = (id: string) => {
    if (itemRows.length <= 1) return;
    setItemRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Update Item Row
  const handleUpdateItemRow = (id: string, field: string, value: any) => {
    setItemRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [field]: value };
          if (field === 'category') {
            updated.item_name = value;
          }
          return updated;
        }
        return r;
      })
    );
  };

  // Handle Save New Purchase Invoice
  const handleSaveNewPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedItemsTotal <= 0) {
      alert('Please enter valid items and rates.');
      return;
    }

    const paidNum = parseFloat(newPaidNow) || 0;

    const itemsPayload = itemRows.map((r) => ({
      item_name: r.item_name,
      category: r.category,
      size: r.size,
      quantity: r.quantity,
      unit_price: r.unit_price,
      total_price: r.quantity * r.unit_price,
    }));

    await recordPurchase({
      vendor_id: party.id,
      bill_number: newBillNumber || `INV-${Date.now().toString().slice(-4)}`,
      business_date: newBillDate,
      due_date: newDueDate,
      total: calculatedItemsTotal,
      amount_paid: paidNum,
      payment_account_id: paidNum > 0 ? newPurAccountId : undefined,
      invoice_attachment_path: newAttachmentPath || undefined,
      notes: newPurNotes,
      items: itemsPayload,
    });

    setIsNewPurchaseModalOpen(false);
    setNewBillNumber(`INV-${Date.now().toString().slice(-4)}`);
    setNewPaidNow('0');
    setNewPurNotes('');
    setNewAttachmentPath('');
  };

  // Open Pay Due Modal
  const handleOpenPayDue = (targetPurchase?: Purchase) => {
    setPayTargetPurchase(targetPurchase || null);
    if (targetPurchase) {
      setPayAmountInput((targetPurchase.balance_due || 0).toString());
      setPayNotesInput(`Payment for Bill #${targetPurchase.bill_number}`);
    } else {
      setPayAmountInput(currentDue.toString());
      setPayNotesInput(`Payment against outstanding balance`);
    }
    setIsPayDueModalOpen(true);
  };

  // Handle Submit Pay Due
  const handleSubmitPayDue = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmountInput);
    if (isNaN(amt) || amt <= 0) return;

    if (payTargetPurchase) {
      // Pay against specific purchase bill
      await payPurchaseDue({
        purchase_id: payTargetPurchase.id,
        vendor_id: party.id,
        amount: amt,
        payment_account_id: payAccountId,
        payment_method: payMethod,
        notes: payNotesInput,
      });
    } else {
      // Pay against general vendor balance
      await recordVendorPayment({
        vendor_id: party.id,
        amount_paid: amt,
        payment_account_id: payAccountId,
        payment_method: payMethod,
        reference_notes: payNotesInput,
      });
    }

    setIsPayDueModalOpen(false);
    setPayTargetPurchase(null);
    setPayAmountInput('');
    setPayNotesInput('');
  };

  // Share Statement on WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR - SUPPLIER STATEMENT*\n--------------------------------\n*Party Name:* ${party.name}\n*City:* ${party.city || 'N/A'}\n*Total Purchases:* ₹${totalPurchasesSum.toLocaleString('en-IN')}\n*Total Payments Made:* ₹${totalPaymentsSum.toLocaleString('en-IN')}\n*CURRENT OUTSTANDING DUE:* ₹${currentDue.toLocaleString('en-IN')}\n--------------------------------\nThank you.\nRegards,\n*Zain Footwear* 👟`
    );
    const cleanPhone = (party.phone || '').replace(/\D/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Share Single Purchase Bill on WhatsApp
  const handleSharePurchaseBill = (p: Purchase) => {
    const itemsText = (p.items || [])
      .map((it, idx) => `${idx + 1}. ${it.item_name} ${it.size ? `[Size ${it.size}]` : ''} - ${it.quantity} prs @ ₹${it.unit_price} = ₹${it.total_price}`)
      .join('\n');

    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR - PURCHASE BILL RECEIPT*\n--------------------------------\n*Supplier:* ${party.name}\n*Bill #:* ${p.bill_number}\n*Date:* ${p.business_date || p.created_at.split('T')[0]}\n--------------------------------\n*Items Purchased:*\n${itemsText || 'Footwear Batch Goods'}\n--------------------------------\n*Total Bill:* ₹${p.total.toLocaleString('en-IN')}\n*Paid Now:* ₹${p.amount_paid.toLocaleString('en-IN')}\n*Balance Due:* ₹${p.balance_due.toLocaleString('en-IN')}\n--------------------------------\nRegards,\n*Zain Footwear*`
    );
    const cleanPhone = (party.phone || '').replace(/\D/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Footwear Categories
  const FOOTWEAR_TYPES = [
    'Leather Formal Shoes',
    'Sneakers & Casuals',
    'Sports & Running Shoes',
    'Daily Slippers & Chappal',
    'Sandals & Heels',
    'School Shoes & Boots',
    'Soles & Raw Materials',
    'Custom Footwear Batch',
  ];

  const SIZES = ['6', '7', '8', '9', '10', '11', '12', 'Free Size', 'Set (6-10)'];

  return (
    <PermissionGuard requiredPermission="vendors:view">
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* 1. TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/app/parties')}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900">{party.name}</h1>
                <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {party.category || 'Supplier Party'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {party.city || 'Agra'} • Contact: {party.phone || 'No phone'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewPurchaseModalOpen(true)}
              className="px-4 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Stock In (Purchase Bill)</span>
            </button>

            {currentDue > 0 && (
              <button
                onClick={() => handleOpenPayDue()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Due (₹{currentDue.toLocaleString('en-IN')})</span>
              </button>
            )}

            <button
              onClick={handleShareWhatsApp}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              title="Share Statement on WhatsApp"
            >
              <Send className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              title="Print Statement"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. SUMMARY METRICS (TOTAL PURCHASES, PAYMENTS, OUTSTANDING DUE) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opening Due</span>
            <p className="text-base sm:text-lg font-black text-slate-800 mt-1">
              ₹{(party.opening_balance || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Purchases</span>
            <p className="text-base sm:text-lg font-black text-slate-800 mt-1">
              ₹{totalPurchasesSum.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold">{partyPurchases.length} Invoices</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payments Made</span>
            <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">
              ₹{totalPaymentsSum.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold">{partyPaymentsList.length} Payments</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">Current Outstanding</span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1 font-mono">
              ₹{currentDue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] font-bold text-rose-700">Payable to Party</span>
          </div>
        </div>

        {/* 3. SUB-TABS: INVOICES & PURCHASE BILLS vs KHATA LEDGER vs PAYMENTS */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'INVOICES'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
            <span>Purchase Invoices & Items ({partyPurchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'LEDGER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khata Ledger ({ledgerEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'PAYMENTS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            <span>Payment History ({partyPaymentsList.length})</span>
          </button>
        </div>

        {/* TAB 1: INVOICES & ITEM-BY-ITEM PURCHASE HISTORY */}
        {activeTab === 'INVOICES' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Footwear Purchase Invoices from {party.name}
              </h2>
              <button
                onClick={() => setIsNewPurchaseModalOpen(true)}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Invoice</span>
              </button>
            </div>

            {partyPurchases.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No purchase invoices recorded yet</p>
                <p>Click below to record your first footwear stock purchase bill from this supplier.</p>
                <button
                  onClick={() => setIsNewPurchaseModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#ff6600] text-white rounded-xl font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Stock In</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {partyPurchases.map((purchase) => {
                  const hasDue = (purchase.balance_due || 0) > 0;
                  const itemsList = purchase.items || [];

                  return (
                    <div key={purchase.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-sm text-slate-900">
                              #{purchase.bill_number}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>
                                {purchase.business_date
                                  ? new Date(purchase.business_date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : new Date(purchase.created_at).toLocaleDateString('en-IN')}
                              </span>
                            </span>

                            {hasDue ? (
                              <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                                ₹{purchase.balance_due} Due
                              </span>
                            ) : (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                Fully Paid
                              </span>
                            )}
                          </div>
                          {purchase.notes && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{purchase.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 justify-between sm:justify-end">
                          <div className="text-right mr-2">
                            <p className="text-sm sm:text-base font-black text-slate-900 font-mono">
                              ₹{purchase.total.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              Paid: ₹{purchase.amount_paid.toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Pay Due Button on Invoice */}
                          {hasDue && (
                            <button
                              onClick={() => handleOpenPayDue(purchase)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Due</span>
                            </button>
                          )}

                          {/* Attached Bill Button */}
                          <button
                            onClick={() => setSelectedAttachedBill(purchase)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Supplier Physical Bill / Attachment"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                            <span>Attached Bill</span>
                          </button>

                          {/* View Invoice Button */}
                          <button
                            onClick={() => setSelectedInvoice(purchase)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                            title="View / Print Full Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Share Button */}
                          <button
                            onClick={() => handleSharePurchaseBill(purchase)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                            title="Share Invoice on WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Itemized Footwear Details in this Invoice */}
                      {itemsList.length > 0 ? (
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            Items Purchased ({itemsList.length} Footwear Batches):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {itemsList.map((it, itIdx) => (
                              <div
                                key={itIdx}
                                className="flex items-center justify-between text-xs font-medium text-slate-800 bg-white p-2 rounded-xl border border-slate-200/60"
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <Footprints className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                                  <span className="font-bold text-slate-900 truncate">{it.item_name}</span>
                                  {it.size && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-700">
                                      Size {it.size}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-900 ml-2">
                                  {it.quantity} prs × ₹{it.unit_price} = ₹{it.total_price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-medium">
                          Single Entry Amount Bill (₹{purchase.total.toLocaleString('en-IN')})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPLETE PARTY LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
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
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No ledger entries found.
                      </td>
                    </tr>
                  ) : (
                    ledgerEntries.map((entry) => {
                      const isPurchase = entry.transaction_type === 'PURCHASE' || entry.credit > 0;
                      const isPayment = entry.transaction_type === 'PAYMENT' || entry.debit > 0;

                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            {entry.business_date || entry.created_at.split('T')[0]}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isPayment ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                              }`}
                            >
                              {entry.transaction_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {entry.reference_number || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{entry.description}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700 font-mono">
                            {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-rose-700 font-mono">
                            {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                            ₹{entry.running_balance.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY */}
        {activeTab === 'PAYMENTS' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Payments Made to {party.name}
              </h2>
              <button
                onClick={() => handleOpenPayDue()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Make Payment</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Account Used</th>
                    <th className="py-3 px-4">Notes / Bill Ref</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partyPaymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    partyPaymentsList.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {pay.payment_date || pay.created_at.split('T')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-800 uppercase">
                            {pay.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{pay.payment_account_name || 'Main Cash'}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{pay.reference_notes || '-'}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-700 font-mono text-sm">
                          ₹{pay.amount_paid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-500 font-mono">
                          ₹{(pay.remaining_outstanding || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE ITEM-BY-ITEM FOOTWEAR PURCHASE INVOICE */}
        {/* ========================================================================= */}
        {isNewPurchaseModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <form
              onSubmit={handleSaveNewPurchase}
              className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-5 h-5 text-[#ff6600]" />
                    <span>Record Footwear Stock In / Purchase Invoice</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Supplier Party: {party.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1">
                {/* Invoice Header Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                      Invoice / Bill # *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. INV-1025"
                      value={newBillNumber}
                      onChange={(e) => setNewBillNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                      Invoice Date (Kis din purchase kiya) *
                    </label>
                    <input
                      type="date"
                      required
                      value={newBillDate}
                      onChange={(e) => setNewBillDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Footwear Item Rows Builder */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Footprints className="w-4 h-4 text-orange-600" />
                      <span>Itemized Footwear Shoes & Sizes ({itemRows.length} Rows)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-orange-400" />
                      <span>+ Add Item Row</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {itemRows.map((row, rIdx) => (
                      <div
                        key={row.id}
                        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Footwear Category / Style */}
                          <div className="col-span-12 sm:col-span-4">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">
                              Footwear Category / Name
                            </label>
                            <select
                              value={row.category}
                              onChange={(e) => handleUpdateItemRow(row.id, 'category', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                            >
                              {FOOTWEAR_TYPES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Shoe Size */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">
                              Shoe Size
                            </label>
                            <select
                              value={row.size}
                              onChange={(e) => handleUpdateItemRow(row.id, 'size', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                            >
                              {SIZES.map((sz) => (
                                <option key={sz} value={sz}>
                                  UK {sz}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Pairs Quantity */}
                          <div className="col-span-3 sm:col-span-2">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">
                              Pairs (Qty)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) =>
                                handleUpdateItemRow(row.id, 'quantity', parseInt(e.target.value) || 1)
                              }
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900 font-mono focus:outline-none focus:border-orange-500 text-center"
                            />
                          </div>

                          {/* Unit Rate */}
                          <div className="col-span-4 sm:col-span-3">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">
                              Rate / Pair (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={row.unit_price}
                              onChange={(e) =>
                                handleUpdateItemRow(row.id, 'unit_price', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900 font-mono focus:outline-none focus:border-orange-500 text-right"
                            />
                          </div>

                          {/* Delete Row */}
                          <div className="col-span-1 sm:col-span-1 text-right">
                            {itemRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(row.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                title="Remove Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Row Subtotal */}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-500">
                            Line #{rIdx + 1}: {row.quantity} pairs of {row.category} (Size UK {row.size})
                          </span>
                          <span className="font-mono font-black text-slate-900">
                            ₹{(row.quantity * row.unit_price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Split */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm font-black border-b border-white/10 pb-2">
                    <span>Total Purchase Invoice Amount:</span>
                    <span className="text-xl font-mono text-orange-400">
                      ₹{calculatedItemsTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                        Amount Paid Now (Cash / UPI)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={calculatedItemsTotal}
                        value={newPaidNow}
                        onChange={(e) => setNewPaidNow(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl font-mono font-black text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                        Remaining Due on Khata (Udhaar)
                      </label>
                      <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl font-mono font-black text-amber-300 text-sm">
                        ₹{Math.max(0, calculatedItemsTotal - (parseFloat(newPaidNow) || 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                    Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dipped leather batch from Agra"
                    value={newPurNotes}
                    onChange={(e) => setNewPurNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Stock In (₹{calculatedItemsTotal.toLocaleString('en-IN')})
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: PAY DUE (AGAINST INVOICE OR VENDOR BALANCE) */}
        {/* ========================================================================= */}
        {isPayDueModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <form
              onSubmit={handleSubmitPayDue}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {payTargetPurchase ? `Pay Due for Bill #${payTargetPurchase.bill_number}` : 'Pay Party Outstanding Due'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Supplier: {party.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayDueModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Current Due Balance:</span>
                <span className="font-mono font-black text-rose-600 text-base">
                  ₹{(payTargetPurchase ? payTargetPurchase.balance_due : currentDue).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Enter payment amount"
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'Cash', 'Bank Transfer'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        payMethod === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Payment Account
                </label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  {paymentAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (₹{acc.current_balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via PhonePe / Cheque #..."
                  value={payNotesInput}
                  onChange={(e) => setPayNotesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPayDueModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: FULL B2B GST FOOTWEAR PURCHASE INVOICE PREVIEW & PRINT */}
        {/* ========================================================================= */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Purchase Invoice #{selectedInvoice.bill_number}</h3>
                  <p className="text-[11px] text-slate-500">
                    Date: {selectedInvoice.business_date || selectedInvoice.created_at.split('T')[0]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar text-xs">
                {/* Store & Supplier Header */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Supplier (Billed From):</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{party.name}</p>
                    <p className="text-slate-600">{party.city || 'Agra'} • {party.phone || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Buyer Store:</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{activeShop?.name || 'Zain Footwear'}</p>
                    <p className="text-slate-600">{activeShop?.address_line_1 || 'Main Store, Mumbai'}</p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Item / Footwear Style</th>
                        <th className="py-2.5 px-2">Size</th>
                        <th className="py-2.5 px-2 text-center">Pairs</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(selectedInvoice.items || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-slate-400">
                            Footwear Goods Batch - Total: ₹{selectedInvoice.total}
                          </td>
                        </tr>
                      ) : (
                        (selectedInvoice.items || []).map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{it.item_name}</td>
                            <td className="py-2.5 px-2 font-mono">{it.size ? `UK ${it.size}` : '-'}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">₹{it.unit_price}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{it.total_price}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 font-semibold">
                  <div className="flex justify-between text-slate-700">
                    <span>Total Bill Amount:</span>
                    <span className="font-mono font-black text-slate-900">
                      ₹{selectedInvoice.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Amount Paid:</span>
                    <span className="font-mono font-bold">
                      -₹{selectedInvoice.amount_paid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-600 pt-1 border-t border-slate-200 font-black text-sm">
                    <span>Balance Due (Udhaar):</span>
                    <span className="font-mono">
                      ₹{selectedInvoice.balance_due.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => handleSharePurchaseBill(selectedInvoice)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. ATTACHED PHYSICAL INVOICE BILL MODAL VIEWER */}
        {selectedAttachedBill && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attached Purchase Bill</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Bill #{selectedAttachedBill.bill_number}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAttachedBill(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bill Details Summary */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Supplier:</span>
                  <span className="font-bold text-slate-900">{party.name}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Bill Date:</span>
                  <span className="font-mono text-slate-800">
                    {selectedAttachedBill.business_date || selectedAttachedBill.created_at.split('T')[0]}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[#ff6600]">
                    ₹{selectedAttachedBill.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Bill Attachment Image Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 p-4 text-center space-y-2">
                {selectedAttachedBill.invoice_attachment_path ? (
                  <img
                    src={selectedAttachedBill.invoice_attachment_path}
                    alt="Attached Purchase Bill"
                    className="max-h-64 mx-auto rounded-xl object-contain border border-slate-300 shadow-xs"
                  />
                ) : (
                  <div className="py-8 space-y-2 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">Digital Stock Inward Receipt</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Physical bill #{selectedAttachedBill.bill_number} from {party.name} recorded in stock registry.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedAttachedBill(null)}
                  className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default VendorDetail360Page;
