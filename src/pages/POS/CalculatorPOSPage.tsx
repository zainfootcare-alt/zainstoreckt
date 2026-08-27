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
} from 'lucide-react';

interface PosLineItem {
  id: string;
  name: string;
  category?: string;
  size?: string;
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
  const [shoeCategory, setShoeCategory] = useState<string>('Sneakers');
  const [shoeSize, setShoeSize] = useState<string>('8');
  const [customItemName, setCustomItemName] = useState<string>('');
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
  const [cashTendered, setCashTendered] = useState<string>(''); // For change return calculation
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // STEP 4: COMPLETED SALE STATE
  const [completedSale, setCompletedSale] = useState<{
    id: string;
    receipt_number: string;
    total: number;
    subtotal: number;
    discount: number;
    cash_amount: number;
    online_amount: number;
    due_amount: number;
    created_at: string;
    customer_name?: string;
    customer_phone?: string;
    items: Array<{ item_name: string; size?: string; unit_price: number; quantity: number; total_price: number }>;
  } | null>(null);

  const [showThermalPreview, setShowThermalPreview] = useState<boolean>(false);

  // Footwear Categories
  const FOOTWEAR_CATEGORIES = [
    { id: 'Sneakers', label: '👟 Sneakers', icon: '👟' },
    { id: 'Formal', label: '👞 Formal Shoes', icon: '👞' },
    { id: 'Casual', label: '🥿 Casual Loafers', icon: '🥿' },
    { id: 'Slippers', label: '🩴 Daily Slippers / Chappal', icon: '🩴' },
    { id: 'Sandals', label: '👡 Sandals & Heels', icon: '👡' },
    { id: 'Boots', label: '🥾 Boots / Sports', icon: '🥾' },
    { id: 'Kids', label: '🧒 Kids Footwear', icon: '🧒' },
    { id: 'Other', label: '📦 Accessories / Insole', icon: '📦' },
  ];

  // UK/India Shoe Sizes
  const MEN_SIZES = ['6', '7', '8', '9', '10', '11', '12'];
  const WOMEN_KIDS_SIZES = ['1', '2', '3', '4', '5'];

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

  // Keypad Button Press Handler
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

    if (['+', '-', '×', '÷'].includes(key)) {
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

  // Add Item to Bill (from Keypad)
  const handleAddCurrentItem = () => {
    const val = Math.round(currentCalcValue);
    if (val <= 0) return;

    const newItem: PosLineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: `${shoeCategory} (Size ${shoeSize})`,
      category: shoeCategory,
      size: shoeSize,
      unit_price: val,
    };

    setLineItems((prev) => [...prev, newItem]);
    setCalcDisplay('0');
  };

  // Remove Item from Bill
  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Go to Step 2 (Shoe & Customer Details)
  const handleProceedToDetails = () => {
    const currentVal = Math.round(currentCalcValue);
    if (lineItems.length === 0 && currentVal > 0) {
      const singleItem: PosLineItem = {
        id: `item_${Date.now()}`,
        name: `${shoeCategory} (Size ${shoeSize})`,
        category: shoeCategory,
        size: shoeSize,
        unit_price: currentVal,
      };
      setLineItems([singleItem]);
      setCalcDisplay('0');
    } else if (lineItems.length === 0 && currentVal <= 0) {
      return;
    }
    setStep('DETAILS');
  };

  // Go to Step 3 (Payment Screen)
  const handleProceedToPayment = () => {
    if (lineItems.length === 1) {
      const updated = [...lineItems];
      const displayName = customItemName.trim()
        ? customItemName.trim()
        : `${shoeCategory} (Size ${shoeSize})`;
      updated[0].name = displayName;
      updated[0].category = shoeCategory;
      updated[0].size = shoeSize;
      setLineItems(updated);
    }

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

  // Switch Payment Mode and Auto-Allocate Amounts
  const handleSelectPaymentMode = (mode: 'CASH' | 'ONLINE' | 'SPLIT' | 'CREDIT') => {
    setPaymentMode(mode);
    const total = netPayable;
    if (mode === 'CASH') {
      setCashPaid(total.toString());
      setOnlinePaid('0');
      setDueAmount('0');
    } else if (mode === 'ONLINE') {
      setCashPaid('0');
      setOnlinePaid(total.toString());
      setDueAmount('0');
    } else if (mode === 'CREDIT') {
      setCashPaid('0');
      setOnlinePaid('0');
      setDueAmount(total.toString());
    } else if (mode === 'SPLIT') {
      const half = Math.round(total / 2);
      setCashPaid(half.toString());
      setOnlinePaid((total - half).toString());
      setDueAmount('0');
    }
  };

  // Auto calculate remaining when changing Cash input in Split mode
  const handleCashChangeInSplit = (val: string) => {
    setCashPaid(val);
    const numCash = parseFloat(val) || 0;
    const remaining = Math.max(0, netPayable - numCash);
    setOnlinePaid(remaining.toString());
    setDueAmount('0');
  };

  // Auto calculate remaining when changing Online input in Split mode
  const handleOnlineChangeInSplit = (val: string) => {
    setOnlinePaid(val);
    const numOnline = parseFloat(val) || 0;
    const remaining = Math.max(0, netPayable - numOnline);
    setCashPaid(remaining.toString());
    setDueAmount('0');
  };

  // Cash change calculation
  const parsedCashTendered = parseFloat(cashTendered) || 0;
  const parsedCashPaid = parseFloat(cashPaid) || 0;
  const changeToReturn = Math.max(0, parsedCashTendered - parsedCashPaid);

  // Finalize & Record the Sale
  const handleFinalizeSale = () => {
    const numCash = parseFloat(cashPaid) || 0;
    const numOnline = parseFloat(onlinePaid) || 0;
    const numDue = parseFloat(dueAmount) || 0;
    const totalPaidAllocated = numCash + numOnline + numDue;

    if (Math.abs(totalPaidAllocated - netPayable) > 0.01 && netPayable > 0) {
      alert(`Payment breakdown total (₹${totalPaidAllocated}) must equal net total (₹${netPayable})`);
      return;
    }

    const itemsForSale = lineItems.map((item) => ({
      item_name: item.name,
      size: item.size || shoeSize,
      quantity: 1,
      unit_price: item.unit_price,
      total_price: item.unit_price,
    }));

    const receiptNum = `REC-${Date.now().toString().slice(-4)}`;

    const paymentsArray: Array<{ payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit'; amount: number }> = [];
    if (numCash > 0) paymentsArray.push({ payment_type: 'cash', amount: numCash });
    if (numOnline > 0) paymentsArray.push({ payment_type: onlineType, amount: numOnline });
    if (numDue > 0) paymentsArray.push({ payment_type: 'credit', amount: numDue });

    const finalCustName = customerName.trim()
      ? customerName.trim()
      : selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.name
      : 'Walk-in Customer';

    const finalCustPhone = customerPhone.trim()
      ? customerPhone.trim()
      : selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.phone
      : undefined;

    const recorded = recordSale({
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      receipt_number: receiptNum,
      created_by_user_id: userProfile?.id || 'usr-admin-01',
      created_by_name: userProfile?.full_name || 'Cashier',
      customer_id: selectedCustomerId || undefined,
      customer_name: finalCustName,
      customer_phone: finalCustPhone,
      subtotal: activeSubtotal,
      discount: discountAmount,
      tax: 0,
      total: netPayable,
      cash_amount: numCash,
      online_amount: numOnline,
      due_amount: numDue,
      items: itemsForSale,
      payments: paymentsArray,
    });

    setCompletedSale({
      id: recorded.id,
      receipt_number: receiptNum,
      total: netPayable,
      subtotal: activeSubtotal,
      discount: discountAmount,
      cash_amount: numCash,
      online_amount: numOnline,
      due_amount: numDue,
      created_at: new Date().toISOString(),
      customer_name: finalCustName,
      customer_phone: finalCustPhone,
      items: itemsForSale,
    });

    setStep('COMPLETED');
  };

  // Reset entire POS flow for next sale
  const handleResetSale = () => {
    setCalcDisplay('0');
    setLineItems([]);
    setShoeCategory('Sneakers');
    setShoeSize('8');
    setCustomItemName('');
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
    setPaymentMode('CASH');
    setCashPaid('');
    setOnlinePaid('');
    setDueAmount('');
    setCashTendered('');
    setCompletedSale(null);
    setShowThermalPreview(false);
    setShowQrModal(false);
    setStep('CALCULATOR');
  };

  // WhatsApp formatted receipt link
  const getWhatsAppShareUrl = () => {
    if (!completedSale) return '#';
    const phone = (completedSale.customer_phone || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const itemsList = completedSale.items
      .map((i) => `• ${i.item_name} ${i.size ? `[Size ${i.size}]` : ''} - ₹${i.unit_price}`)
      .join('\n');

    const msg = `*👟 ZAIN FOOTWEAR - BILL RECEIPT*\n------------------------------\n*Receipt:* #${completedSale.receipt_number}\n*Date:* ${new Date().toLocaleDateString('en-IN')}\n*Store:* ${activeShop?.name || 'Main Store'}\n\n*Items:*\n${itemsList}\n\n*Total Amount:* ₹${completedSale.total}\n*Paid (Cash):* ₹${completedSale.cash_amount}\n*Paid (Online):* ₹${completedSale.online_amount}${completedSale.due_amount > 0 ? `\n*Balance Due:* ₹${completedSale.due_amount}` : ''}\n------------------------------\nThank you for shopping at Zain Footwear! Visit again.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

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
              {completedSale.items.map((it, idx) => (
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
              onClick={handleResetSale}
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
                {completedSale.items.map((item, idx) => (
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
  // STEP 2: SHOE SIZE & CUSTOMER DETAILS SCREEN
  // =========================================================================
  if (step === 'DETAILS') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 animate-in fade-in duration-150">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
          <button
            onClick={() => setStep('CALCULATOR')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Calculator</span>
          </button>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            Step 2 of 3 • Footwear & Customer
          </span>
        </div>

        {/* Current Bill Amount Highlight */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Calculated Amount</p>
            <p className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
              ₹{activeSubtotal.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-medium">
              {lineItems.length > 0 ? `${lineItems.length} Footwear Item(s)` : '1 Item'}
            </span>
          </div>
        </div>

        {/* 1. SELECT FOOTWEAR SIZE (UK/IND SIZES) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>👟 Select Shoe Size (UK / India)</span>
            </label>
            <span className="text-xs font-bold text-orange-600">Selected: Size {shoeSize}</span>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 mb-1.5">Adult / Men / Unisex Sizes:</p>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {MEN_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setShoeSize(sz)}
                  className={`h-11 sm:h-12 rounded-xl font-black text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer ${
                    shoeSize === sz
                      ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/30 scale-105 border-2 border-orange-500'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-400 mb-1.5">Kids & Small Sizes / Free Size:</p>
            <div className="flex flex-wrap gap-2">
              {WOMEN_KIDS_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setShoeSize(sz)}
                  className={`px-4 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                    shoeSize === sz
                      ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/30 border-2 border-orange-500'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  Size {sz}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShoeSize('Free Size')}
                className={`px-4 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                  shoeSize === 'Free Size'
                    ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/30 border-2 border-orange-500'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Free / Standard Size
              </button>
            </div>
          </div>
        </div>

        {/* 2. SELECT FOOTWEAR CATEGORY / TYPE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏷️ Footwear Category</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FOOTWEAR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setShoeCategory(cat.id)}
                className={`p-2.5 rounded-xl font-bold text-xs text-left flex items-center space-x-2 transition-all cursor-pointer ${
                  shoeCategory === cat.id
                    ? 'bg-orange-50 text-orange-800 border-2 border-[#ff6600] font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.id}</span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <input
              type="text"
              placeholder={`Optional Article / Note (e.g. ${shoeCategory} Size ${shoeSize})`}
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* 3. CUSTOMER DATA (CRM / KHATABOOK / WALK-IN) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>👤 Customer Data (Optional for Fast WhatsApp Bill)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomerId('');
                setCustomerName('Walk-in Customer');
                setCustomerPhone('');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Skip (Walk-in)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Select Existing Party / Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedCustomerId(id);
                  const found = customers.find((c) => c.id === id);
                  if (found) {
                    setCustomerName(found.name);
                    setCustomerPhone(found.phone || '');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
              >
                <option value="">-- Walk-in / Enter New Below --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''} {c.current_balance ? `[Due: ₹${c.current_balance}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Or Type Customer Name & Phone
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setSelectedCustomerId('');
                  }}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="tel"
                  placeholder="10-digit Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proceed to Payment Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleProceedToPayment}
            className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Proceed to Payment (₹{activeSubtotal.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 3: FINAL PAYMENT & SPLIT SCREEN (Cash / Online / Change)
  // =========================================================================
  if (step === 'PAYMENT') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 animate-in fade-in duration-150">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
          <button
            onClick={() => setStep('DETAILS')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Details</span>
          </button>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Step 3 of 3 • Final Payment
          </span>
        </div>

        {/* Big Amount & Bill Summary Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold">Total Payable Amount</p>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-orange-400">₹</span>
                <span className="text-3xl sm:text-5xl font-black tracking-tight font-mono text-white">
                  {netPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Discount Quick Field */}
            <div className="text-right bg-white/10 p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block uppercase">Discount (₹)</span>
              <input
                type="number"
                min="0"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-20 text-right bg-transparent border-b border-orange-400 text-white font-mono font-bold text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
            <span>
              Customer: <strong className="text-white">{customerName || 'Walk-in'}</strong>
            </span>
            <span>
              Item: <strong className="text-white">{shoeCategory} (Size {shoeSize})</strong>
            </span>
          </div>
        </div>

        {/* 4 ONE-TAP PAYMENT MODE SELECTORS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
            Select Payment Method
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPaymentMode('CASH')}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                paymentMode === 'CASH'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500 scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>💵 100% Cash</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPaymentMode('ONLINE')}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                paymentMode === 'ONLINE'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500 scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span>📱 100% Online/UPI</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPaymentMode('SPLIT')}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                paymentMode === 'SPLIT'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-400 scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>⚖️ Split (Cash+UPI)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPaymentMode('CREDIT')}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                paymentMode === 'CREDIT'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-500 scale-[1.02]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>⏳ Udhaar / Due</span>
            </button>
          </div>
        </div>

        {/* PAYMENT BREAKDOWN FIELDS & CHANGE CALCULATOR */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          {paymentMode === 'SPLIT' ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500">
                Enter Cash or Online amount (remaining auto-calculates):
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <label className="text-xs font-black text-emerald-900 flex items-center gap-1">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash Portion (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashPaid}
                    onChange={(e) => handleCashChangeInSplit(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-base font-black text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200 space-y-1">
                  <label className="text-xs font-black text-indigo-900 flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Online/UPI Portion (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={onlinePaid}
                    onChange={(e) => handleOnlineChangeInSplit(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-base font-black text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : paymentMode === 'CASH' ? (
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-emerald-900">💵 Cash Given by Customer (Optional)</span>
                <span className="text-xs font-semibold text-emerald-700">Bill: ₹{netPayable}</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="e.g. ₹500, ₹2000 Note"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-xl text-base font-black text-slate-900 font-mono focus:outline-none"
                />
                {[500, 1000, 2000].map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setCashTendered(note.toString())}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                  >
                    ₹{note}
                  </button>
                ))}
              </div>

              {parsedCashTendered > parsedCashPaid && (
                <div className="p-3 bg-emerald-500 text-white rounded-xl flex items-center justify-between font-black text-sm shadow-sm">
                  <span>Return Change to Customer:</span>
                  <span className="text-lg font-mono">₹{changeToReturn}</span>
                </div>
              )}
            </div>
          ) : paymentMode === 'ONLINE' ? (
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-indigo-900">📱 Digital Payment Channel</span>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show Store UPI QR</span>
                </button>
              </div>

              <div className="flex space-x-2">
                {(['upi', 'card', 'bank'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setOnlineType(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      onlineType === m
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-indigo-200'
                    }`}
                  >
                    {m === 'upi' ? 'UPI (GPay/PhonePe)' : m === 'card' ? 'Card Machine' : 'Bank Transfer'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
              <p className="font-bold text-amber-900">
                ⏳ ₹{netPayable} will be added as Outstanding Balance (Udhaar) in Customer's Ledger.
              </p>
              {!customerName && !selectedCustomerId && (
                <p className="text-rose-600 font-semibold">
                  ⚠️ Please enter customer name or select party in Step 2 to track this due properly.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Final Sale Confirmation Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleFinalizeSale}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>Complete Sale & Generate Receipt (₹{netPayable.toLocaleString('en-IN')})</span>
          </button>
        </div>

        {/* Live Dynamic Store UPI QR Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-xs w-full p-6 space-y-4 shadow-2xl text-center">
              <div className="space-y-1">
                <h3 className="font-black text-base text-slate-900">Scan & Pay via UPI</h3>
                <p className="text-xs text-slate-500 font-medium">GPay • PhonePe • Paytm • BHIM</p>
              </div>

              <div className="w-48 h-48 mx-auto bg-slate-900 rounded-2xl p-3 flex flex-col items-center justify-center text-white space-y-2 border-2 border-orange-500 shadow-inner">
                <QrCode className="w-24 h-24 text-orange-400" />
                <p className="text-sm font-black font-mono">₹{netPayable}</p>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">{activeShop?.name || 'ZAIN POS'}</p>
              </div>

              <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 p-2 rounded-xl">
                UPI ID: zainfootwear@upi
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
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

      {/* Action Footer Bar (Material You Pill Action) */}
      <div className="space-y-2 pt-1 pb-1 flex-shrink-0">
        {currentCalcValue > 0 && (
          <button
            type="button"
            onClick={handleAddCurrentItem}
            className="w-full py-2 bg-[#282a2d] hover:bg-[#34373c] text-slate-200 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-white/5"
          >
            <Plus className="w-3.5 h-3.5 text-[#ff7b00]" />
            <span>+ Add item (₹{Math.round(currentCalcValue)}) & Continue</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleProceedToDetails}
          disabled={activeSubtotal <= 0 && currentCalcValue <= 0}
          className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-full font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <span>Next: Size & Customer (₹{(activeSubtotal || currentCalcValue).toLocaleString('en-IN')})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorPOSPage;
