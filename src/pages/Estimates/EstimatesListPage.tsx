import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  ArrowRight,
  Share2,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  User,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Estimate } from '../../types/database.types';

export const EstimatesListPage: React.FC = () => {
  const { estimates, customers, addEstimate, updateEstimate, deleteEstimate, convertEstimateToSale } = useShop();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'All' | 'Draft' | 'Sent' | 'Accepted' | 'Converted'>('All');

  // Create Estimate Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [estimateNotes, setEstimateNotes] = useState<string>('');
  const [estimateDiscount, setEstimateDiscount] = useState<number>(0);
  const [estimateItems, setEstimateItems] = useState<
    Array<{ item_name: string; size: string; quantity: number; unit_price: number }>
  >([{ item_name: 'Leather Shoes', size: '8', quantity: 1, unit_price: 1500 }]);

  // Convert to Sale Modal State
  const [convertingEstimate, setConvertingEstimate] = useState<Estimate | null>(null);
  const [convCash, setConvCash] = useState<string>('');
  const [convOnline, setConvOnline] = useState<string>('');
  const [convDue, setConvDue] = useState<string>('');
  const [conversionSuccess, setConversionSuccess] = useState<boolean>(false);

  // Filter estimates
  const filteredEstimates = estimates.filter((est) => {
    const matchesSearch =
      est.estimate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (est.customer_phone && est.customer_phone.includes(searchQuery));
    const matchesTab = activeTab === 'All' || est.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Calculate totals for new estimate
  const newEstSubtotal = estimateItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const newEstTotal = Math.max(0, newEstSubtotal - estimateDiscount);

  const handleAddItemRow = () => {
    setEstimateItems((prev) => [...prev, { item_name: '', size: '8', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (estimateItems.length <= 1) return;
    setEstimateItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    addEstimate({
      organization_id: 'org-footwear-101',
      customer_id: selectedCustomerId || undefined,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim() || undefined,
      subtotal: newEstSubtotal,
      discount: estimateDiscount,
      tax: 0,
      total: newEstTotal,
      status: 'Sent',
      notes: estimateNotes,
      items: estimateItems.map((item) => ({
        item_name: item.item_name || 'Footwear Item',
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      })),
    });

    setIsCreateModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId('');
    setEstimateNotes('');
    setEstimateDiscount(0);
    setEstimateItems([{ item_name: 'Leather Shoes', size: '8', quantity: 1, unit_price: 1500 }]);
  };

  // Open Convert Modal
  const handleOpenConvert = (est: Estimate) => {
    setConvertingEstimate(est);
    setConvCash(est.total.toString());
    setConvOnline('0');
    setConvDue('0');
  };

  // Finalize Conversion to Sale
  const handleFinalizeConversion = () => {
    if (!convertingEstimate) return;

    const numCash = parseFloat(convCash) || 0;
    const numOnline = parseFloat(convOnline) || 0;
    const numDue = parseFloat(convDue) || 0;

    const paymentsArray: Array<{ payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit'; amount: number }> = [];
    if (numCash > 0) paymentsArray.push({ payment_type: 'cash', amount: numCash });
    if (numOnline > 0) paymentsArray.push({ payment_type: 'upi', amount: numOnline });
    if (numDue > 0) paymentsArray.push({ payment_type: 'credit', amount: numDue });

    convertEstimateToSale(convertingEstimate.id, {
      cash_amount: numCash,
      online_amount: numOnline,
      due_amount: numDue,
      payments: paymentsArray,
    });

    setConversionSuccess(true);
    setTimeout(() => {
      setConversionSuccess(false);
      setConvertingEstimate(null);
    }, 1200);
  };

  // WhatsApp Share URL for Estimate
  const getWhatsAppEstimateUrl = (est: Estimate) => {
    const phone = (est.customer_phone || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const itemsText = est.items.map((i) => `• ${i.item_name} (Qty: ${i.quantity}) - ₹${i.total_price}`).join('\n');
    const msg = `*ZAIN FOOTWEAR ESTIMATE*\nEstimate: #${est.estimate_number}\nCustomer: ${est.customer_name}\n\n*Items:*\n${itemsText}\n\n*Total:* ₹${est.total}\n\nThank you for choosing Zain Footwear!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* 1. TOP HEADER & CREATE ESTIMATE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Estimates & Quotations</h1>
          <p className="text-xs font-semibold text-slate-500">Create, share, and 1-click convert into Sales</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Estimate</span>
        </button>
      </div>

      {/* 2. SEARCH & STATUS FILTER TABS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search estimate by number or customer name..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-2xs"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1">
          {(['All', 'Draft', 'Sent', 'Accepted', 'Converted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ESTIMATES LIST */}
      <div className="space-y-3">
        {filteredEstimates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No estimates found</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create an estimate to share price quotes with customers before finalizing sales.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#ff6600] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Estimate</span>
            </button>
          </div>
        ) : (
          filteredEstimates.map((est) => (
            <div
              key={est.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">#{est.estimate_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          est.status === 'Converted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : est.status === 'Sent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {est.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {est.customer_name} {est.customer_phone ? `• ${est.customer_phone}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-base sm:text-lg font-black text-slate-900">
                    ₹{est.total.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">{est.items.length} items in estimate</p>
                </div>
              </div>

              {/* Itemized Line preview */}
              <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                {est.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.item_name} {it.size ? `(Size ${it.size})` : ''} × {it.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">₹{it.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Estimate Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium">
                  Created {est.created_at.split('T')[0]}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Share on WhatsApp */}
                  {est.customer_phone && (
                    <a
                      href={getWhatsAppEstimateUrl(est)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {/* 1-Click Convert to Sale */}
                  {est.status !== 'Converted' ? (
                    <button
                      onClick={() => handleOpenConvert(est)}
                      className="px-3.5 py-1.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Convert to Sale</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Converted</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. CREATE ESTIMATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Create Estimate</h3>
                <p className="text-xs text-slate-500 font-medium">New price quotation for customer</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEstimate} className="space-y-4">
              {/* Customer Selector / Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    WhatsApp Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98200 12345"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Items & Pricing</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    + Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {estimateItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.item_name}
                        onChange={(e) => {
                          const updated = [...estimateItems];
                          updated[idx].item_name = e.target.value;
                          setEstimateItems(updated);
                        }}
                        className="flex-2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Size"
                        value={item.size}
                        onChange={(e) => {
                          const updated = [...estimateItems];
                          updated[idx].size = e.target.value;
                          setEstimateItems(updated);
                        }}
                        className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 text-center"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...estimateItems];
                          updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setEstimateItems(updated);
                        }}
                        className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={item.unit_price || ''}
                        onChange={(e) => {
                          const updated = [...estimateItems];
                          updated[idx].unit_price = parseFloat(e.target.value) || 0;
                          setEstimateItems(updated);
                        }}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={estimateItems.length <= 1}
                        className="text-slate-400 hover:text-rose-600 p-1 disabled:opacity-20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{newEstSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-slate-600">
                  <span>Discount</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={estimateDiscount || ''}
                    onChange={(e) => setEstimateDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-right"
                  />
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Estimate Amount</span>
                  <span className="text-[#ff6600]">₹{newEstTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Notes / Terms (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valid for 7 days"
                  value={estimateNotes}
                  onChange={(e) => setEstimateNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save & Share Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 1-CLICK CONVERT TO SALE MODAL */}
      {convertingEstimate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Convert to Sale</h3>
                <p className="text-xs text-slate-500 font-medium">Estimate #{convertingEstimate.estimate_number}</p>
              </div>
              <button
                onClick={() => setConvertingEstimate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conversionSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900">Sale Created Successfully!</p>
                <p className="text-xs text-slate-500">Estimate marked as converted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold text-slate-900">{convertingEstimate.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Bill Amount:</span>
                    <span className="font-black text-sm text-[#ff6600]">
                      ₹{convertingEstimate.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Payment Collection</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConvCash(convertingEstimate.total.toString());
                        setConvOnline('0');
                        setConvDue('0');
                      }}
                      className="py-1.5 px-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200"
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConvCash('0');
                        setConvOnline(convertingEstimate.total.toString());
                        setConvDue('0');
                      }}
                      className="py-1.5 px-2 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200"
                    >
                      📱 Online
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConvCash('0');
                        setConvOnline('0');
                        setConvDue(convertingEstimate.total.toString());
                      }}
                      className="py-1.5 px-2 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200"
                    >
                      ⏳ Due
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">Cash (₹)</span>
                      <input
                        type="number"
                        value={convCash}
                        onChange={(e) => setConvCash(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">Online (₹)</span>
                      <input
                        type="number"
                        value={convOnline}
                        onChange={(e) => setConvOnline(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">Due (₹)</span>
                      <input
                        type="number"
                        value={convDue}
                        onChange={(e) => setConvDue(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setConvertingEstimate(null)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeConversion}
                    className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Complete & Convert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimatesListPage;
