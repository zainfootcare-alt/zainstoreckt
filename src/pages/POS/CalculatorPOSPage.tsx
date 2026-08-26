import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  Share2,
  CreditCard,
  User,
  Phone,
  RotateCcw,
  ArrowRight,
  Receipt,
  X,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LineItem {
  id: string;
  name: string;
  unit_price: number;
}

export const CalculatorPOSPage: React.FC = () => {
  const { activeShop, userProfile, customers, recordSale } = useShop();

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Customer Details (Optional)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [showCustomerInput, setShowCustomerInput] = useState<boolean>(false);

  // Payment Flow State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [cashInput, setCashInput] = useState<string>('');
  const [onlineInput, setOnlineInput] = useState<string>('');
  const [dueInput, setDueInput] = useState<string>('');
  const [onlineMode, setOnlineMode] = useState<'upi' | 'card' | 'bank'>('upi');

  // Completed Sale State
  const [completedSale, setCompletedSale] = useState<{
    id: string;
    receipt_number: string;
    total: number;
    cash_amount: number;
    online_amount: number;
    due_amount: number;
    created_at: string;
    customer_name?: string;
    customer_phone?: string;
    items: LineItem[];
  } | null>(null);

  const [showThermalPreview, setShowThermalPreview] = useState<boolean>(false);

  // Keypad arithmetic handler
  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setCalcDisplay('0');
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

    if (calcDisplay === '0') {
      setCalcDisplay(key);
    } else {
      setCalcDisplay(calcDisplay + key);
    }
  };

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

  const handleAddLineItem = () => {
    const val = currentCalcValue;
    if (val <= 0) return;

    const newItem: LineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: `Footwear Item ${lineItems.length + 1}`,
      unit_price: Math.round(val),
    };

    setLineItems((prev) => [...prev, newItem]);
    setCalcDisplay('0');
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleResetSale = () => {
    setCalcDisplay('0');
    setLineItems([]);
    setDiscountAmount(0);
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setShowCustomerInput(false);
    setIsPaymentModalOpen(false);
    setCashInput('');
    setOnlineInput('');
    setDueInput('');
    setCompletedSale(null);
    setShowThermalPreview(false);
  };

  // Calculations
  const calculatedItemsTotal = lineItems.reduce((sum, item) => sum + item.unit_price, 0);
  const activeUnaddedTotal = lineItems.length === 0 ? currentCalcValue : 0;
  const subtotal = calculatedItemsTotal + (lineItems.length === 0 ? activeUnaddedTotal : 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Open Payment Modal
  const handleOpenPayment = () => {
    let finalItems = [...lineItems];
    if (finalItems.length === 0 && currentCalcValue > 0) {
      finalItems = [
        {
          id: `item_${Date.now()}`,
          name: 'Footwear Item 1',
          unit_price: Math.round(currentCalcValue),
        },
      ];
      setLineItems(finalItems);
    }

    if (totalAmount <= 0 && currentCalcValue <= 0) return;

    const finalPayable = totalAmount > 0 ? totalAmount : Math.round(currentCalcValue);

    // Default to full cash
    setCashInput(finalPayable.toString());
    setOnlineInput('0');
    setDueInput('0');
    setIsPaymentModalOpen(true);
  };

  // Payment Breakdown Calculations
  const numCash = parseFloat(cashInput) || 0;
  const numOnline = parseFloat(onlineInput) || 0;
  const numDue = parseFloat(dueInput) || 0;
  const totalAllocated = numCash + numOnline + numDue;
  const diff = totalAmount - totalAllocated;

  // Complete the Sale Transaction
  const handleFinalizeSale = () => {
    if (diff !== 0 && totalAmount > 0) return;

    let itemsForSale = [...lineItems];
    if (itemsForSale.length === 0) {
      itemsForSale = [
        {
          id: `item_${Date.now()}`,
          name: 'Footwear Sale',
          unit_price: totalAmount,
        },
      ];
    }

    const receiptNum = `REC-${Date.now().toString().slice(-4)}`;

    const paymentsArray: Array<{ payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit'; amount: number }> = [];
    if (numCash > 0) paymentsArray.push({ payment_type: 'cash', amount: numCash });
    if (numOnline > 0) paymentsArray.push({ payment_type: onlineMode, amount: numOnline });
    if (numDue > 0) paymentsArray.push({ payment_type: 'credit', amount: numDue });

    const newSale = recordSale({
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      receipt_number: receiptNum,
      created_by_user_id: userProfile?.id || 'usr-admin-01',
      created_by_name: userProfile?.full_name || 'Cashier',
      customer_id: selectedCustomerId || undefined,
      customer_name: customerName || (selectedCustomerId ? customers.find((c) => c.id === selectedCustomerId)?.name : 'Walk-in Customer'),
      customer_phone: customerPhone || (selectedCustomerId ? customers.find((c) => c.id === selectedCustomerId)?.phone : undefined),
      subtotal: subtotal,
      discount: discountAmount,
      tax: 0,
      total: totalAmount,
      cash_amount: numCash,
      online_amount: numOnline,
      due_amount: numDue,
      items: itemsForSale.map((item) => ({
        item_name: item.name,
        quantity: 1,
        unit_price: item.unit_price,
        total_price: item.unit_price,
      })),
      payments: paymentsArray,
    });

    setIsPaymentModalOpen(false);
    setCompletedSale({
      id: newSale.id,
      receipt_number: receiptNum,
      total: totalAmount,
      cash_amount: numCash,
      online_amount: numOnline,
      due_amount: numDue,
      created_at: new Date().toISOString(),
      customer_name: newSale.customer_name,
      customer_phone: newSale.customer_phone,
      items: itemsForSale,
    });
  };

  // Generate WhatsApp Invoice Link
  const getWhatsAppShareUrl = () => {
    if (!completedSale) return '#';
    const phone = (completedSale.customer_phone || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = `*ZAIN FOOTWEAR INVOICE*\nReceipt: #${completedSale.receipt_number}\nDate: ${new Date().toLocaleDateString('en-IN')}\nTotal: ₹${completedSale.total}\nPaid: ₹${completedSale.cash_amount + completedSale.online_amount}\nDue: ₹${completedSale.due_amount}\n\nThank you for shopping at Zain Footwear!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // -------------------------------------------------------------
  // 1. SALE COMPLETED SCREEN (No Forced Invoice, Fast "Done" Return)
  // -------------------------------------------------------------
  if (completedSale) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Sale Completed!</h2>
            <p className="text-xs font-semibold text-slate-500">Sale #{completedSale.receipt_number}</p>
          </div>

          {/* Amount Breakdown Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-600">Total Amount</span>
              <span className="text-base font-black text-slate-900">₹{completedSale.total.toLocaleString('en-IN')}</span>
            </div>
            {completedSale.cash_amount > 0 && (
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Cash Paid</span>
                <span className="font-bold text-emerald-700">₹{completedSale.cash_amount}</span>
              </div>
            )}
            {completedSale.online_amount > 0 && (
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Online Paid</span>
                <span className="font-bold text-indigo-700">₹{completedSale.online_amount}</span>
              </div>
            )}
            {completedSale.due_amount > 0 && (
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Balance Due</span>
                <span className="font-bold text-amber-700">₹{completedSale.due_amount}</span>
              </div>
            )}
            {completedSale.customer_name && completedSale.customer_name !== 'Walk-in Customer' && (
              <div className="flex justify-between text-xs font-medium text-slate-600 pt-1 border-t border-slate-200/40">
                <span>Customer</span>
                <span className="font-bold text-slate-800">{completedSale.customer_name}</span>
              </div>
            )}
          </div>

          {/* Primary Action: Done (Instant return to fresh calculator) */}
          <button
            onClick={handleResetSale}
            className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-base shadow-sm transition-all"
          >
            Done • Next Sale
          </button>

          {/* Secondary Actions: Print, WhatsApp, View Sale */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setShowThermalPreview(true)}
              className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Receipt</span>
            </button>

            {completedSale.customer_phone ? (
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <button
                onClick={() => handleResetSale()}
                className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5"
              >
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>New Sale</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Thermal Receipt Preview Modal */}
        {showThermalPreview && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-black text-base text-slate-900">ZAIN FOOTWEAR</h3>
                <p className="text-[11px] text-slate-500">{activeShop?.address_line_1 || 'Main Store'}</p>
                <p className="text-[10px] text-slate-400 font-mono">Receipt #{completedSale.receipt_number}</p>
              </div>

              <div className="space-y-1 text-xs">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900">₹{item.unit_price}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>TOTAL</span>
                  <span>₹{completedSale.total}</span>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => setShowThermalPreview(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. FULLSCREEN CALCULATOR-FIRST SALE SCREEN
  // -------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4">
      {/* Top Header & Customer Quick-Select */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900">New Sale</h1>
            <span className="text-xs text-slate-400 font-semibold">• Quick Calculator</span>
          </div>

          <button
            onClick={() => setShowCustomerInput(!showCustomerInput)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1 px-2.5 py-1 bg-orange-50 rounded-lg border border-orange-100"
          >
            <User className="w-3.5 h-3.5" />
            <span>{selectedCustomerId || customerName ? 'Edit Customer' : '+ Customer (Optional)'}</span>
          </button>
        </div>

        {/* Expandable Customer Input */}
        {showCustomerInput && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select from Parties</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const cust = customers.find((c) => c.id === e.target.value);
                  if (cust) {
                    setCustomerName(cust.name);
                    setCustomerPhone(cust.phone || '');
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
              >
                <option value="">-- Walk-in / Unregistered --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.current_balance ? `(Due: ₹${c.current_balance})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Or Enter Name / Phone</label>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setSelectedCustomerId('');
                  }}
                  className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Display & Keypad Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Large Amount Screen */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 text-right space-y-1 shadow-inner">
          <p className="text-xs font-mono text-slate-400 tracking-wider h-4">
            {calcDisplay !== '0' ? calcDisplay : lineItems.length > 0 ? `${lineItems.length} items in bill` : '0'}
          </p>
          <div className="flex items-baseline justify-end space-x-1">
            <span className="text-lg sm:text-2xl font-bold text-orange-400">₹</span>
            <span className="text-3xl sm:text-5xl font-black tracking-tight font-mono">
              {(lineItems.length > 0 ? subtotal : currentCalcValue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Large Touch-Friendly Keypad (7 8 9 ÷, 4 5 6 ×, 1 2 3 -, 0 . C +) */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            ['7', '8', '9', '÷'],
            ['4', '5', '6', '×'],
            ['1', '2', '3', '-'],
            ['0', '.', 'C', '+'],
          ].map((row, rIdx) =>
            row.map((k) => {
              const isOperator = ['÷', '×', '-', '+'].includes(k);
              const isClear = k === 'C';

              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadPress(k)}
                  className={`h-12 sm:h-14 rounded-2xl font-black text-base sm:text-xl active:scale-95 transition-all flex items-center justify-center select-none shadow-2xs ${
                    isOperator
                      ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                      : isClear
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {k}
                </button>
              );
            })
          )}
        </div>

        {/* Keypad Utility Buttons: Add Item & Backspace */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleAddLineItem}
            disabled={currentCalcValue <= 0}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>+ Add Item to Bill</span>
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('BACKSPACE')}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition-colors"
            title="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Itemized List (if items added) */}
        {lineItems.length > 0 && (
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bill Line Items</p>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs border border-slate-100"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-slate-900">₹{item.unit_price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bill Summary & Continue Button */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-600 font-semibold">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        {/* Quick Discount Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span className="flex items-center space-x-1">
            <span>Discount</span>
            {discountAmount > 0 && (
              <button onClick={() => setDiscountAmount(0)} className="text-[10px] text-rose-500 font-bold ml-1">
                (Clear)
              </button>
            )}
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">₹</span>
            <input
              type="number"
              min="0"
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-20 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-100">
          <span>Total Payable</span>
          <span className="text-[#ff6600]">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>

        {/* Large Continue to Payment Button */}
        <button
          type="button"
          onClick={handleOpenPayment}
          disabled={totalAmount <= 0 && currentCalcValue <= 0}
          className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
        >
          <span>Continue to Payment (₹{(totalAmount || currentCalcValue).toLocaleString('en-IN')})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SIMPLE SPLIT PAYMENT MODAL (Cash / Online / Due)           */}
      {/* ------------------------------------------------------------- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Payment Breakdown</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Total Due: <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Tap Autofill Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCashInput(totalAmount.toString());
                  setOnlineInput('0');
                  setDueInput('0');
                }}
                className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs text-center border border-emerald-200"
              >
                💵 All Cash
              </button>
              <button
                type="button"
                onClick={() => {
                  setCashInput('0');
                  setOnlineInput(totalAmount.toString());
                  setDueInput('0');
                }}
                className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-xl text-xs text-center border border-indigo-200"
              >
                📱 All Online
              </button>
              <button
                type="button"
                onClick={() => {
                  setCashInput('0');
                  setOnlineInput('0');
                  setDueInput(totalAmount.toString());
                }}
                className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs text-center border border-amber-200"
              >
                ⏳ All Due
              </button>
            </div>

            {/* 3 Split Inputs: Cash, Online, Due */}
            <div className="space-y-3 pt-2">
              {/* Cash Field */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>💵 Cash</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCashInput(Math.max(0, totalAmount - numOnline - numDue).toString())}
                    className="text-[10px] text-orange-600 font-bold"
                  >
                    Fill Remaining
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Online Field (with sub-type toggle) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>📱 Online / Digital</span>
                  </label>
                  <div className="flex space-x-1 text-[10px]">
                    {(['upi', 'card', 'bank'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setOnlineMode(m)}
                        className={`px-2 py-0.5 rounded uppercase font-bold ${
                          onlineMode === m ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={onlineInput}
                  onChange={(e) => setOnlineInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Due / Credit Field */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>⏳ Balance Due (Khatabook / Credit)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setDueInput(Math.max(0, totalAmount - numCash - numOnline).toString())}
                    className="text-[10px] text-orange-600 font-bold"
                  >
                    Fill Remaining
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={dueInput}
                  onChange={(e) => setDueInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                />
                {numDue > 0 && !customerName && !selectedCustomerId && (
                  <p className="text-[10px] text-amber-700 font-semibold pt-1">
                    * Tip: Select or enter Customer above to track this due in Party Ledger.
                  </p>
                )}
              </div>
            </div>

            {/* Reconciliation Indicator */}
            <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold">
              <span>Total Entered: ₹{totalAllocated}</span>
              {diff === 0 ? (
                <span className="text-emerald-600 font-black">✓ Reconciled Exactly</span>
              ) : diff > 0 ? (
                <span className="text-amber-600">Short by ₹{diff}</span>
              ) : (
                <span className="text-rose-600">Over by ₹{Math.abs(diff)}</span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalizeSale}
                disabled={diff !== 0 && totalAmount > 0}
                className="flex-2 py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-sm shadow-sm transition-all disabled:opacity-40"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPOSPage;
