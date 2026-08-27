import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Plus,
  Printer,
  Share2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Sparkles,
  Banknote,
  Smartphone,
  Clock,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  Layers,
} from 'lucide-react';

interface PosLineItem {
  id: string;
  name: string;
  category: string;
  size: string;
  unit_price: number;
}

export const CalculatorPOSPage: React.FC = () => {
  const { activeShop, userProfile, customers, recordSale } = useShop();

  // Wizard Step: 'CALCULATOR' (Step 1) -> 'DETAILS' (Step 2) -> 'PAYMENT' (Step 3) -> 'COMPLETED' (Step 4)
  const [step, setStep] = useState<'CALCULATOR' | 'DETAILS' | 'PAYMENT' | 'COMPLETED'>('CALCULATOR');

  // STEP 1: CALCULATOR STATE
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [lineItems, setLineItems] = useState<PosLineItem[]>([]);

  // STEP 2: SHOE SIZE & CUSTOMER STATE
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // STEP 3: PAYMENT & DISCOUNT STATE
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE' | 'SPLIT' | 'CREDIT'>('CASH');
  const [cashPaid, setCashPaid] = useState<string>('');
  const [onlinePaid, setOnlinePaid] = useState<string>('');
  const [dueAmount, setDueAmount] = useState<string>('');
  const [onlineType, setOnlineType] = useState<'upi' | 'card' | 'bank'>('upi');
  const [cashTendered, setCashTendered] = useState<string>(''); 
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // STEP 4: COMPLETED SALE STATE
  const [completedSale, setCompletedSale] = useState<any>(null);

  const [showThermalPreview, setShowThermalPreview] = useState<boolean>(false);

  // Footwear Categories
  const FOOTWEAR_CATEGORIES = [
    { id: 'Sneakers', label: '👟 Sneakers', icon: '👟' },
    { id: 'Formal', label: '👞 Formal', icon: '👞' },
    { id: 'Casual', label: '🥿 Casual', icon: '🥿' },
    { id: 'Slippers', label: '🩴 Slippers', icon: '🩴' },
    { id: 'Sandals', label: '👡 Sandals', icon: '👡' },
    { id: 'Boots', label: '🥾 Boots', icon: '🥾' },
    { id: 'Kids', label: '🧒 Kids', icon: '🧒' },
    { id: 'Other', label: '📦 Other', icon: '📦' },
  ];

  // UK/India Shoe Sizes
  const ALL_SHOE_SIZES = ['6', '7', '8', '9', '10', '11', '12', 'Free Size', '1', '2', '3', '4', '5'];

  // Keypad Expression Evaluator
  const evaluateCalc = (expr: string): number => {
    try {
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      return typeof result === 'number' && !isNaN(result) && isFinite(result) ? Math.max(0, result) : 0;
    } catch {
      return 0;
    }
  };

  const currentCalcValue = evaluateCalc(calcDisplay);
  const calculatedItemsTotal = lineItems.reduce((sum, item) => sum + item.unit_price, 0);
  const activeSubtotal = lineItems.length > 0 ? calculatedItemsTotal : currentCalcValue;
  const netPayable = Math.max(0, activeSubtotal - discountAmount);

  const totalPaidSoFar = (parseFloat(cashPaid) || 0) + (parseFloat(onlinePaid) || 0);
  const unpaidDifference = Math.max(0, activeSubtotal - totalPaidSoFar);

  const shoeCategory = lineItems[0]?.category || 'Footwear';
  const shoeSize = lineItems.length > 1 ? `${lineItems[0]?.size || '8'} (+${lineItems.length - 1})` : (lineItems[0]?.size || '8');

  const handleSelectFullCash = () => {
    setPaymentMode('CASH');
    setCashPaid(activeSubtotal.toString());
    setOnlinePaid('0');
    setDueAmount('0');
    setDiscountAmount(0);
  };

  const handleSelectFullOnline = () => {
    setPaymentMode('ONLINE');
    setCashPaid('0');
    setOnlinePaid(activeSubtotal.toString());
    setDueAmount('0');
    setDiscountAmount(0);
  };

  const handleSelectPaymentMode = (mode: 'CASH' | 'ONLINE' | 'SPLIT' | 'CREDIT') => {
    setPaymentMode(mode);
    if (mode === 'SPLIT') {
      const half = Math.floor(activeSubtotal / 2);
      setCashPaid(half.toString());
      setOnlinePaid((activeSubtotal - half).toString());
      setDueAmount('0');
      setDiscountAmount(0);
    }
  };

  const handleApplyRemainingAsDiscount = () => {
    setDiscountAmount(unpaidDifference);
    setDueAmount('0');
  };

  const handleKeepRemainingAsDue = () => {
    setDueAmount(unpaidDifference.toString());
    setDiscountAmount(0);
  };

  // Keypad Button Press Handler (Pressing + automatically adds item and increments count)
  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setCalcDisplay('0');
      return;
    }

    if (key === 'AC') {
      setCalcDisplay('0');
      setLineItems([]);
      return;
    }

    if (key === 'BACKSPACE') {
      if (calcDisplay.length <= 1 || calcDisplay === 'Error') {
        setCalcDisplay('0');
      } else {
        setCalcDisplay(calcDisplay.slice(0, -1));
      }
      return;
    }

    // AUTOMATIC PLUS (+) BEHAVIOR: Adds item to cart immediately and increments count
    if (key === '+') {
      const val = Math.round(evaluateCalc(calcDisplay));
      if (val > 0) {
        const itemIndex = lineItems.length + 1;
        const newItem: PosLineItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: `Item #${itemIndex}`,
          category: 'Sneakers',
          size: '8',
          unit_price: val,
        };
        setLineItems((prev) => [...prev, newItem]);
        setCalcDisplay('0');
      }
      return;
    }

    if (['-', '×', '÷'].includes(key)) {
      const lastChar = calcDisplay.slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar)) {
        setCalcDisplay(calcDisplay.slice(0, -1) + key);
      } else {
        setCalcDisplay(calcDisplay + key);
      }
      return;
    }

    if (key === '=') {
      const evaluated = evaluateCalc(calcDisplay);
      setCalcDisplay(evaluated.toString());
      return;
    }

    if (key === '%') {
      const val = evaluateCalc(calcDisplay);
      setCalcDisplay((val / 100).toString());
      return;
    }

    if (calcDisplay === '0') {
      setCalcDisplay(key);
    } else {
      setCalcDisplay(calcDisplay + key);
    }
  };

  // Remove Line Item from Bill
  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update Category for specific item
  const updateItemCategory = (itemId: string, newCategory: string) => {
    setLineItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, category: newCategory } : it))
    );
  };

  // Update Size for specific item
  const updateItemSize = (itemId: string, newSize: string) => {
    setLineItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, size: newSize } : it))
    );
  };

  // Go to Step 2 (Shoe Size & Category Configuration)
  const handleProceedToDetails = () => {
    const currentVal = Math.round(evaluateCalc(calcDisplay));
    let items = [...lineItems];

    // If there's an amount on screen that wasn't added with plus yet, add it
    if (currentVal > 0) {
      const itemIndex = items.length + 1;
      const newItem: PosLineItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: `Item #${itemIndex}`,
        category: 'Sneakers',
        size: '8',
        unit_price: currentVal,
      };
      items.push(newItem);
      setLineItems(items);
      setCalcDisplay('0');
    }

    if (items.length === 0) return;

    setExpandedItemId(items[0]?.id || null);
    setStep('DETAILS');
  };

  // Go to Step 3 (Payment Screen)
  const handleProceedToPayment = () => {
    const updated = lineItems.map((it) => ({
      ...it,
      name: `${it.category} (Size ${it.size})`,
    }));
    setLineItems(updated);

    const total = netPayable;
    if (paymentMode === 'CASH') {
      setCashPaid(total.toString());
      setOnlinePaid('0');
      setDueAmount('0');
    } else if (paymentMode === 'ONLINE') {
      setCashPaid('0');
      setOnlinePaid(total.toString());
      setDueAmount('0');
    } else if (paymentMode === 'CREDIT') {
      setCashPaid('0');
      setOnlinePaid('0');
      setDueAmount(total.toString());
    }

    setStep('PAYMENT');
  };

  // Auto calculate remaining when changing Online input in Split mode
  const handleOnlineChangeInSplit = (val: string) => {
    setOnlinePaid(val);
  };

  // Quick Cash Tender Suggestions
  const roundToNextHundred = (num: number) => Math.ceil(num / 100) * 100;
  const roundToNextFiveHundred = (num: number) => Math.ceil(num / 500) * 500;

  const cashSuggestions = Array.from(
    new Set([
      netPayable,
      roundToNextHundred(netPayable),
      roundToNextFiveHundred(netPayable),
      2000,
    ])
  )
    .filter((amt) => amt >= netPayable)
    .slice(0, 4);

  const tenderedVal = parseFloat(cashTendered) || 0;
  const changeToReturn = tenderedVal >= netPayable ? tenderedVal - netPayable : 0;

  // Complete Sale & Store Transaction
  const handleCompleteSale = async () => {
    if (activeSubtotal <= 0) return;

    const cashNum = parseFloat(cashPaid) || 0;
    const onlineNum = parseFloat(onlinePaid) || 0;
    const dueNum = parseFloat(dueAmount) || 0;

    const itemsPayload = lineItems.map((it: any) => ({
      item_name: `${it.category} (Size ${it.size})`,
      size: it.size,
      quantity: 1,
      unit_price: it.unit_price,
      total_price: it.unit_price,
    }));

    try {
      const finalSale = await recordSale({
        organization_id: activeShop?.organization_id || 'a1000000-0000-0000-0000-000000000001',
        shop_id: activeShop?.id || 'b2000000-0000-0000-0000-000000000002',
        receipt_number: `ZAIN-${Date.now().toString().slice(-6)}`,
        created_by_user_id: userProfile?.id || '',
        created_by_name: userProfile?.full_name || 'POS Cashier',
        customer_id: selectedCustomerId || undefined,
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        subtotal: activeSubtotal,
        discount: discountAmount,
        tax: 0,
        total: netPayable,
        cash_amount: cashNum,
        online_amount: onlineNum,
        due_amount: dueNum,
        items: itemsPayload,
        payments: [],
      });

      setCompletedSale({
        id: finalSale.id,
        receipt_number: finalSale.receipt_number,
        total: finalSale.total,
        subtotal: finalSale.subtotal,
        discount: finalSale.discount,
        cash_amount: finalSale.cash_amount,
        online_amount: finalSale.online_amount,
        due_amount: finalSale.due_amount || 0,
        created_at: finalSale.created_at,
        customer_name: finalSale.customer_name,
        customer_phone: finalSale.customer_phone,
        items: itemsPayload,
      });

      setStep('COMPLETED');
    } catch (err) {
      console.error('Sale recording failed:', err);
      alert('Sale could not be saved. Please check your connection.');
    }
  };

  // Reset entire POS to clean initial state
  const handleResetForNextSale = () => {
    setStep('CALCULATOR');
    setCalcDisplay('0');
    setLineItems([]);
    setDiscountAmount(0);
    setPaymentMode('CASH');
    setCashPaid('');
    setOnlinePaid('');
    setDueAmount('');
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId('');
    setCashTendered('');
    setCompletedSale(null);
    setExpandedItemId(null);
  };

  // WhatsApp formatted receipt link
  const getWhatsAppShareUrl = () => {
    if (!completedSale) return '';
    const cleanPhone = (completedSale.customer_phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsText = completedSale.items
      .map((it: any, idx: number) => `${idx + 1}. ${it.item_name} - ₹${it.unit_price}`)
      .join('\n');

    const msg = `*ZAIN FOOTWEAR - POS BILL RECEIPT*\n--------------------------------\n*Receipt #:* ${completedSale.receipt_number}\n*Date:* ${new Date(completedSale.created_at).toLocaleDateString('en-IN')}\n*Store:* ${activeShop?.name || 'Zain Footwear (Main Store)'}\n--------------------------------\n*Items Purchased:*\n${itemsText}\n--------------------------------\n*Subtotal:* ₹${completedSale.subtotal.toLocaleString('en-IN')}\n*Discount:* ₹${completedSale.discount.toLocaleString('en-IN')}\n*Total Paid:* ₹${completedSale.total.toLocaleString('en-IN')}\n${completedSale.due_amount > 0 ? `*Balance Due (Udhaar):* ₹${completedSale.due_amount.toLocaleString('en-IN')}\n` : ''}--------------------------------\nThank you for shopping at *Zain Footwear*!\nVisit again soon! 👟✨`;

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  // =========================================================================
  // STEP 2: SHOE SIZE & CATEGORY CONFIGURATION (Collapsible Dropdown for Multi-Item)
  // =========================================================================
  if (step === 'DETAILS') {
    return (
      <div className="h-[100dvh] max-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col justify-between max-w-md mx-auto p-3 sm:p-4 select-none overflow-hidden animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setStep('CALCULATOR')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-full shadow-2xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back</span>
          </button>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Step 2 • {lineItems.length} Item{lineItems.length === 1 ? '' : 's'} Size & Cat
          </span>
        </div>

        {/* Big Amount Summary Bar */}
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 my-1">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Total Bill Amount</p>
            <p className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
              ₹{activeSubtotal.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-bold">
              {lineItems.length} Footwear Item{lineItems.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Scrollable Center Content with Collapsible Accordion Cards */}
        <div className="flex-1 flex flex-col space-y-2.5 overflow-y-auto no-scrollbar py-1">
          {/* ITEMS CONFIGURATION LIST */}
          <div className="space-y-2.5">
            {lineItems.map((item, idx) => {
              const isExpanded = lineItems.length === 1 || expandedItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Collapsible Header (Click to minimize / maximize) */}
                  <div
                    onClick={() => {
                      if (lineItems.length > 1) {
                        setExpandedItemId(expandedItemId === item.id ? null : item.id);
                      }
                    }}
                    className={`p-3 flex items-center justify-between transition-colors ${
                      lineItems.length > 1 ? 'cursor-pointer hover:bg-slate-50' : ''
                    } ${isExpanded ? 'bg-slate-50/80 border-b border-slate-100' : ''}`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center flex-shrink-0 border border-orange-200">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                            ₹{item.unit_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 truncate">
                            {item.category} • Size {item.size}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {lineItems.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLineItem(item.id);
                              if (lineItems.length <= 2) {
                                setExpandedItemId(lineItems.find((it) => it.id !== item.id)?.id || null);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="p-1 text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Body (Category & Size Selector for this specific item) */}
                  {isExpanded && (
                    <div className="p-3 space-y-3 bg-white">
                      {/* 1. Category Chips */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Select Category
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {FOOTWEAR_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => updateItemCategory(item.id, cat.id)}
                              className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center truncate transition-all cursor-pointer ${
                                item.category === cat.id
                                  ? 'bg-[#ff6600] text-white shadow-xs font-black scale-102'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Shoe Size Chips */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Shoe Size (UK/IND)
                          </span>
                          <span className="text-xs font-black text-orange-600">Selected Size: {item.size}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_SHOE_SIZES.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => updateItemSize(item.id, sz)}
                              className={`h-9 ${
                                sz === 'Free Size' ? 'px-2.5 text-[11px]' : 'w-9 text-xs'
                              } rounded-xl font-black flex items-center justify-center transition-all cursor-pointer ${
                                item.size === sz
                                  ? 'bg-slate-900 text-white shadow-xs border-2 border-slate-900 scale-105'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">👤 Customer (Optional)</span>
              <span className="text-[10px] text-slate-400 font-semibold">For WhatsApp Bill</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Customer Name / Mobile"
                value={customerPhone ? `${customerName} (${customerPhone})` : customerName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomerName(val);
                  setCustomerPhone(val.replace(/\D/g, '').length === 10 ? val.replace(/\D/g, '') : '');
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Walk-in Customer');
                  setCustomerPhone('');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Walk-in
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="pt-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleProceedToPayment}
            className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-full font-black text-base shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Proceed to Payment (₹{activeSubtotal.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 4: SALE COMPLETED SCREEN (Fast WhatsApp, Print, and Next Sale)
  // =========================================================================
  if (step === 'COMPLETED' && completedSale) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
          {/* Success Check Badge */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full uppercase tracking-wider">
              Payment Successful
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sale Completed!</h2>
            <p className="text-xs text-slate-500 font-mono">Bill #{completedSale.receipt_number}</p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/60 text-left space-y-3">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-500">Customer</p>
                <p className="text-sm font-extrabold text-slate-900">{completedSale.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500">Total Bill</p>
                <p className="text-xl font-black text-[#ff6600]">₹{completedSale.total.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Items Purchased */}
            <div className="space-y-1.5 py-1">
              {completedSale.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate pr-2">
                    {idx + 1}. {it.item_name} {it.size ? `(Size ${it.size})` : ''}
                  </span>
                  <span className="font-mono font-bold text-slate-900">₹{it.unit_price}</span>
                </div>
              ))}
            </div>

            {/* Payment Mode Split Summary */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-xs">
              {completedSale.cash_amount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 font-bold flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5" /> Cash: ₹{completedSale.cash_amount}
                </span>
              )}
              {completedSale.online_amount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100/80 text-indigo-800 font-bold flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Online: ₹{completedSale.online_amount}
                </span>
              )}
              {completedSale.due_amount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-800 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Udhaar/Due: ₹{completedSale.due_amount}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResetForNextSale}
              className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Done • Next Sale (New Customer)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              {completedSale.customer_phone ? (
                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Receipt</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    const phone = prompt('Enter WhatsApp Phone number for receipt:');
                    if (phone) {
                      const clean = phone.replace(/\D/g, '');
                      window.open(
                        `https://wa.me/${clean.length === 10 ? `91${clean}` : clean}?text=${encodeURIComponent(
                          `*ZAIN FOOTWEAR RECEIPT*\nBill #${completedSale.receipt_number}\nTotal: ₹${completedSale.total}`
                        )}`,
                        '_blank'
                      );
                    }
                  }}
                  className="py-3 px-3 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Share WhatsApp</span>
                </button>
              )}

              <button
                onClick={() => setShowThermalPreview(true)}
                className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thermal Print Modal */}
        {showThermalPreview && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-black text-lg text-slate-900 tracking-tight">ZAIN FOOTWEAR</h3>
                <p className="text-xs text-slate-600">{activeShop?.address_line_1 || 'Main Market Road, Mumbai'}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Receipt #{completedSale.receipt_number}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                {completedSale.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-700">
                      {item.item_name} {item.size ? `[Size ${item.size}]` : ''}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">₹{item.unit_price}</span>
                  </div>
                ))}

                <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-black text-base text-slate-900">
                  <span>TOTAL PAYABLE</span>
                  <span className="font-mono">₹{completedSale.total}</span>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => setShowThermalPreview(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STEP 3: ULTRA-EASY PAYMENT SCREEN (Cash / Online / Auto Discount / Due)
  // =========================================================================
  if (step === 'PAYMENT') {
    const isDuePending = parseFloat(dueAmount) > 0 || (unpaidDifference > 0 && discountAmount === 0);
    const isDueCustomerMissing = isDuePending && (!customerName.trim() || !customerPhone.trim()) && !selectedCustomerId;

    return (
      <div className="h-[100dvh] max-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col justify-between max-w-md mx-auto p-3 sm:p-4 select-none overflow-hidden animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1 flex-shrink-0">
          <button
            onClick={() => setStep('DETAILS')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-full shadow-2xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back</span>
          </button>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Step 3 • Make Payment
          </span>
        </div>

        {/* Big Amount Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg space-y-1 text-center flex-shrink-0 my-1">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Bill Amount</p>
          <div className="flex items-baseline justify-center space-x-1">
            <span className="text-2xl font-bold text-orange-400">₹</span>
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {(activeSubtotal - discountAmount).toLocaleString('en-IN')}
            </span>
            {discountAmount > 0 && (
              <span className="text-xs font-bold text-emerald-400 ml-2 line-through opacity-70">
                ₹{activeSubtotal}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {shoeCategory} (Size {shoeSize}) • {customerName || 'Walk-in'}
          </p>
        </div>

        {/* Scrollable Center Content */}
        <div className="flex-1 flex flex-col justify-center space-y-2.5 overflow-y-auto no-scrollbar py-1">
          {/* Quick 1-Tap Payment Mode Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={handleSelectFullCash}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                cashPaid === activeSubtotal.toString() && onlinePaid === '0' && discountAmount === 0
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              💵 100% Cash
            </button>
            <button
              type="button"
              onClick={handleSelectFullOnline}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                onlinePaid === activeSubtotal.toString() && cashPaid === '0' && discountAmount === 0
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-indigo-800 border-slate-200 hover:bg-indigo-50'
              }`}
            >
              📱 100% Online
            </button>
            <button
              type="button"
              onClick={() => handleSelectPaymentMode('SPLIT')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                parseFloat(cashPaid) > 0 && parseFloat(onlinePaid) > 0
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-orange-800 border-slate-200 hover:bg-orange-50'
              }`}
            >
              ⚖️ Split (50/50)
            </button>
          </div>

          {/* Cash & Online Direct Inputs */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
            {/* Cash Input Box */}
            <div className="flex items-center justify-between space-x-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80">
              <div className="flex items-center space-x-2 min-w-0">
                <Banknote className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-emerald-900">Cash Received</p>
                  <p className="text-[10px] text-emerald-700">Cash in drawer</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(e.target.value)}
                  placeholder="0"
                  className="w-24 text-right px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-base font-black text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Online UPI Input Box */}
            <div className="flex items-center justify-between space-x-2 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-200/80">
              <div className="flex items-center space-x-2 min-w-0">
                <Smartphone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-indigo-900">Online / UPI</p>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Show Store QR</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={onlinePaid}
                  onChange={(e) => setOnlinePaid(e.target.value)}
                  placeholder="0"
                  className="w-24 text-right px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-base font-black text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* AUTO-DISCOUNT OR DUE PROMPT (When Customer Pays Less) */}
          {unpaidDifference > 0 && discountAmount === 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 space-y-2 animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-black text-amber-900">
                <span>⚠️ Remaining Amount: ₹{unpaidDifference}</span>
                <span className="text-[10px] font-bold bg-amber-200 px-2 py-0.5 rounded-full text-amber-900">Action Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApplyRemainingAsDiscount}
                  className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  🏷️ Give ₹{unpaidDifference} Discount
                </button>
                <button
                  type="button"
                  onClick={handleKeepRemainingAsDue}
                  className="py-2.5 px-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  ⏳ Keep ₹{unpaidDifference} as Due
                </button>
              </div>
            </div>
          )}

          {/* Discount Applied Badge */}
          {discountAmount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900">🏷️ Discount Applied: ₹{discountAmount} (Bill Settled)</span>
              <button
                type="button"
                onClick={() => setDiscountAmount(0)}
                className="text-slate-400 hover:text-rose-600 text-xs font-bold underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* MANDATORY CUSTOMER DATA FOR DUE / UDHAAR */}
          {isDuePending && (
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <p className="text-xs font-black text-amber-950">
                  Customer Details Required for Udhaar (Due: ₹{dueAmount || unpaidDifference})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-amber-900 uppercase block mb-0.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName === 'Walk-in Customer' ? '' : customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setSelectedCustomerId('');
                    }}
                    className="w-full px-2.5 py-2 bg-white border-2 border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-900 uppercase block mb-0.5">
                    10-digit Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setSelectedCustomerId('');
                    }}
                    className="w-full px-2.5 py-2 bg-white border-2 border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Change return banner if cash paid > payable */}
          {parseFloat(cashPaid) > (activeSubtotal - discountAmount - (parseFloat(onlinePaid) || 0)) && (
            <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between font-black text-xs shadow-xs animate-in fade-in">
              <span>Return Change to Customer:</span>
              <span className="text-base font-mono">
                ₹{parseFloat(cashPaid) - Math.max(0, (activeSubtotal - discountAmount - (parseFloat(onlinePaid) || 0)))}
              </span>
            </div>
          )}
        </div>

        {/* Big Complete Sale Button */}
        <div className="pt-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCompleteSale}
            disabled={isDueCustomerMissing}
            className={`w-full py-4 rounded-full font-black text-base sm:text-lg shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isDueCustomerMissing
                ? 'bg-amber-400 text-amber-950 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/30'
            }`}
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>
              {isDueCustomerMissing
                ? '⚠️ Enter Customer Name & Phone for Udhaar'
                : `Complete Sale (₹${(activeSubtotal - discountAmount).toLocaleString('en-IN')})`}
            </span>
          </button>
        </div>

        {/* Live PhonePe & BHIM UPI Store QR Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-3 shadow-2xl text-center">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900">Scan & Pay via UPI</span>
                <span className="text-sm font-black font-mono text-orange-600">
                  ₹{(activeSubtotal - discountAmount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Exact Attached Store QR Image */}
              <div className="bg-white rounded-2xl p-2 border-2 border-orange-500 shadow-inner overflow-hidden">
                <img
                  src="/zain_store_qr.png"
                  alt="Zain Footwear PhonePe QR Code"
                  className="w-full max-h-80 object-contain mx-auto rounded-xl"
                />
              </div>

              <div className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 p-2 rounded-xl">
                Zain Footwear • Terminal 3-Q03886898
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Close QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STEP 1: ANDROID MATERIAL YOU FULLSCREEN CALCULATOR
  // =========================================================================
  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#131417] text-white flex flex-col justify-between max-w-md mx-auto p-3 sm:p-4 select-none overflow-hidden animate-in fade-in duration-150">
      {/* Top Header Bar with Exit Sale & Clear buttons */}
      <div className="flex items-center justify-between pt-1 pb-2 flex-shrink-0">
        <Link
          to="/app/dashboard"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 bg-[#282a2d] hover:bg-[#34373c] active:scale-95 px-3 py-2 rounded-full border border-white/5 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Exit Sale</span>
        </Link>

        <div className="flex items-center space-x-2">
          {lineItems.length > 0 && (
            <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              {lineItems.length} Footwear (₹{calculatedItemsTotal})
            </span>
          )}
          <button
            type="button"
            onClick={() => handleKeypadPress('AC')}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-full bg-[#282a2d] hover:bg-rose-950/40 border border-white/5 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Android Big Display Screen */}
      <div className="flex-1 flex flex-col justify-end text-right px-3 py-2 space-y-1 relative overflow-hidden flex-shrink-0">
        <p className="text-xs sm:text-sm font-mono text-slate-400 tracking-wider min-h-[1.25rem] truncate">
          {calcDisplay !== '0' ? calcDisplay : lineItems.length > 0 ? `${lineItems.length} item(s) in bill` : ''}
        </p>

        <div className="flex items-baseline justify-end space-x-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#ff7b00]">₹</span>
          <span className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white">
            {(lineItems.length > 0 ? activeSubtotal : currentCalcValue || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Itemized Mini Badges (Chips) */}
        {lineItems.length > 0 && (
          <div className="flex items-center justify-end space-x-1.5 overflow-x-auto py-1 no-scrollbar">
            {lineItems.map((it, idx) => (
              <div
                key={it.id}
                className="flex items-center space-x-1 bg-[#282a2d] border border-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-200 flex-shrink-0"
              >
                <span>#{idx + 1} ₹{it.unit_price}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLineItem(it.id)}
                  className="text-slate-400 hover:text-rose-400 ml-1 text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Android Material You 4x5 Circular Touch Keypad */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 my-2 flex-shrink-0">
        {/* Row 1: AC, ⌫, %, ÷ */}
        <button
          type="button"
          onClick={() => handleKeypadPress('C')}
          className="h-13 sm:h-14 rounded-full font-black text-lg bg-[#383b40] text-[#ff7b00] hover:bg-[#44474d] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-xs"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('BACKSPACE')}
          className="h-13 sm:h-14 rounded-full font-black text-lg bg-[#383b40] text-slate-200 hover:bg-[#44474d] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-xs"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('%')}
          className="h-13 sm:h-14 rounded-full font-black text-lg bg-[#383b40] text-slate-200 hover:bg-[#44474d] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-xs"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('÷')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, × */}
        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#282a2d] text-white hover:bg-[#34373c] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeypadPress('×')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, - */}
        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#282a2d] text-white hover:bg-[#34373c] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeypadPress('-')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          -
        </button>

        {/* Row 4: 1, 2, 3, + */}
        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#282a2d] text-white hover:bg-[#34373c] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeypadPress('+')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          +
        </button>

        {/* Row 5: 0, 00, ., = */}
        <button
          type="button"
          onClick={() => handleKeypadPress('0')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#282a2d] text-white hover:bg-[#34373c] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('00')}
          className="h-13 sm:h-14 rounded-full font-black text-xl bg-[#282a2d] text-white hover:bg-[#34373c] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('.')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#282a2d] text-white hover:bg-[#34373c] active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('=')}
          className="h-13 sm:h-14 rounded-full font-black text-2xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-92 transition-all duration-75 flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/30"
        >
          =
        </button>
      </div>

      {/* Action Footer Bar - Single Clean Continue Button */}
      <div className="pt-2 pb-1 flex-shrink-0">
        <button
          type="button"
          onClick={handleProceedToDetails}
          disabled={activeSubtotal <= 0 && currentCalcValue <= 0}
          className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-full font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <span>
            Continue ({lineItems.length + (currentCalcValue > 0 ? 1 : 0)} Items • ₹
            {(
              lineItems.reduce((sum, it) => sum + it.unit_price, 0) +
              (currentCalcValue > 0 ? Math.round(currentCalcValue) : 0)
            ).toLocaleString('en-IN')}
            )
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorPOSPage;
