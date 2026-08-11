import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { ZainLogo } from '../../components/common/ZainLogo';
import {
  Calculator as CalcIcon,
  Plus,
  Minus,
  X as MultiplyIcon,
  Delete,
  RotateCcw,
  CheckCircle2,
  Printer,
  Send,
  Trash2,
  Receipt,
  CreditCard,
  QrCode,
  DollarSign,
  UserCheck,
  Building2,
  Check,
  Zap,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';

interface LineItem {
  id: string;
  name: string;
  unit_price: number;
}

export const CalculatorPOSPage: React.FC = () => {
  const { activeShop, userProfile, activeRole, recordSale } = useShop();

  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Customer Details State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [payments, setPayments] = useState<Array<{ type: 'cash' | 'upi' | 'card' | 'bank' | 'credit'; amount: number }>>([
    { type: 'cash', amount: 0 },
  ]);

  const [completedSale, setCompletedSale] = useState<{
    receipt_number: string;
    total: number;
    cash_amount: number;
    online_amount: number;
    created_at: string;
    customer_name?: string;
    customer_phone?: string;
    items: LineItem[];
    payments: Array<{ type: string; amount: number }>;
  } | null>(null);

  // Keypad arithmetic handler
  const handleKeypadPress = (key: string) => {
    if (key === 'CLEAR') {
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

    if (['+', '-', '×'].includes(key)) {
      const lastChar = calcDisplay.slice(-1);
      if (['+', '-', '×'].includes(lastChar)) {
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
      const sanitized = expr.replace(/×/g, '*');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      return typeof result === 'number' && !isNaN(result) ? Math.max(0, result) : 0;
    } catch {
      return 0;
    }
  };

  const handleAddLine = () => {
    const val = evaluateCalc(calcDisplay);
    if (val <= 0) return;

    const newItem: LineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: `Footwear Item ${lineItems.length + 1}`,
      unit_price: val,
    };

    setLineItems((prev) => [...prev, newItem]);
    setCalcDisplay('0');
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleResetCalc = () => {
    setCalcDisplay('0');
    setLineItems([]);
    setDiscountAmount(0);
    setCustomerName('');
    setCustomerPhone('');
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.unit_price, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const totalPaidAllocated = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remainingDue = finalTotal - totalPaidAllocated;
  const isPaymentMatched = Math.abs(remainingDue) < 0.01 && finalTotal > 0;

  // 1-TAP QUICK CASH SALE HANDLER
  const handleQuickCashSale = () => {
    let currentVal = evaluateCalc(calcDisplay);
    let itemsToProcess = [...lineItems];

    if (itemsToProcess.length === 0 && currentVal > 0) {
      itemsToProcess = [
        {
          id: `item_${Date.now()}`,
          name: `Footwear Item 1`,
          unit_price: currentVal,
        },
      ];
    }

    if (itemsToProcess.length === 0) return;

    const calcSub = itemsToProcess.reduce((sum, item) => sum + item.unit_price, 0);
    const calcTotal = Math.max(0, calcSub - discountAmount);

    const receiptNum = `REC-ZAIN-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanCustName = customerName.trim() || undefined;
    const cleanCustPhone = customerPhone.trim() || undefined;

    const newSaleRecord = recordSale({
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      receipt_number: receiptNum,
      created_by_user_id: userProfile?.id || 'usr-cashier-01',
      created_by_name: userProfile?.full_name || 'Cashier Staff',
      customer_name: cleanCustName,
      customer_phone: cleanCustPhone,
      subtotal: calcSub,
      discount: discountAmount,
      tax: calcSub * 0.12,
      total: calcTotal,
      cash_amount: calcTotal,
      online_amount: 0,
      items: itemsToProcess.map((item) => ({
        item_name: item.name,
        quantity: 1,
        unit_price: item.unit_price,
        total_price: item.unit_price,
      })),
      payments: [{ payment_type: 'cash', amount: calcTotal }],
    });

    setCompletedSale({
      receipt_number: receiptNum,
      total: calcTotal,
      cash_amount: calcTotal,
      online_amount: 0,
      created_at: newSaleRecord.created_at,
      customer_name: cleanCustName,
      customer_phone: cleanCustPhone,
      items: itemsToProcess,
      payments: [{ type: 'cash', amount: calcTotal }],
    });

    setCalcDisplay('0');
  };

  const openPaymentModal = () => {
    const currentVal = evaluateCalc(calcDisplay);
    if (lineItems.length === 0 && currentVal > 0) {
      const autoItem: LineItem = {
        id: `item_${Date.now()}`,
        name: `Footwear Item 1`,
        unit_price: currentVal,
      };
      setLineItems([autoItem]);
      setCalcDisplay('0');
      setPayments([{ type: 'cash', amount: currentVal }]);
    } else {
      setPayments([{ type: 'cash', amount: finalTotal }]);
    }
    setIsPaymentModalOpen(true);
  };

  const addPaymentSplit = (type: 'cash' | 'upi' | 'card' | 'bank' | 'credit') => {
    const rem = Math.max(0, remainingDue);
    setPayments((prev) => [...prev, { type, amount: rem }]);
  };

  const updatePaymentAmount = (index: number, amt: number) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[index].amount = amt;
      return copy;
    });
  };

  const removePaymentSplit = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSale = () => {
    if (!isPaymentMatched) return;

    const receiptNum = `REC-ZAIN-${Math.floor(100000 + Math.random() * 900000)}`;

    let cashAmt = 0;
    let onlineAmt = 0;

    payments.forEach((p) => {
      if (p.type === 'cash') cashAmt += p.amount;
      else onlineAmt += p.amount;
    });

    const cleanCustName = customerName.trim() || undefined;
    const cleanCustPhone = customerPhone.trim() || undefined;

    const newSaleRecord = recordSale({
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      receipt_number: receiptNum,
      created_by_user_id: userProfile?.id || 'usr-cashier-01',
      created_by_name: userProfile?.full_name || 'Cashier Staff',
      customer_name: cleanCustName,
      customer_phone: cleanCustPhone,
      subtotal,
      discount: discountAmount,
      tax: subtotal * 0.12,
      total: finalTotal,
      cash_amount: cashAmt,
      online_amount: onlineAmt,
      items: lineItems.map((item) => ({
        item_name: item.name,
        quantity: 1,
        unit_price: item.unit_price,
        total_price: item.unit_price,
      })),
      payments: payments.map((p) => ({
        payment_type: p.type,
        amount: p.amount,
      })),
    });

    setCompletedSale({
      receipt_number: receiptNum,
      total: finalTotal,
      cash_amount: cashAmt,
      online_amount: onlineAmt,
      created_at: newSaleRecord.created_at,
      customer_name: cleanCustName,
      customer_phone: cleanCustPhone,
      items: [...lineItems],
      payments: [...payments],
    });

    setIsPaymentModalOpen(false);
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    handleResetCalc();
  };

  const handleWhatsAppShare = (receiptNo: string, total: number, phone?: string, custName?: string) => {
    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR OFFICIAL RECEIPT*\nReceipt No: ${receiptNo}\nStore: ${activeShop?.name || 'Main Store'}${
        custName ? `\nCustomer: ${custName}` : ''
      }\nSalesperson: ${userProfile?.full_name || 'Staff'}\nTotal Paid: ₹${total.toLocaleString('en-IN')}\nStatus: SUCCESSFUL (PAID)\n\nThank you for shopping at Zain Footwear!`
    );

    let phoneStr = '';
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 10) phoneStr = `91${digits}`;
      else if (digits.length > 10) phoneStr = digits;
    }

    if (phoneStr) {
      window.open(`https://wa.me/${phoneStr}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <PermissionGuard requiredPermission="sales:create">
      <div className="space-y-5 max-w-6xl mx-auto pb-10 font-sans">
        {/* COUNTER STATUS BANNER */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ZainLogo size="sm" showText={false} />
            <div>
              <h1 className="font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
                <CalcIcon className="w-5 h-5 text-[#ff6600]" /> Fast Calculator POS Checkout
              </h1>
              <p className="text-xs text-slate-500 font-medium">Touch-first instant sale entry & customer auto-CRM</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400">Cash Counter Status</p>
              <p className="text-xs font-extrabold text-orange-600 flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse"></span> Counter Open
              </p>
            </div>

            <div className="text-right pl-4 border-l border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-400">Staff On Duty</p>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                {userProfile?.full_name || 'Staff'} ({activeRole})
              </p>
            </div>
          </div>
        </div>

        {/* MAIN POS CALCULATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: CALCULATOR KEYPAD (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            {/* CALCULATOR DISPLAY */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 text-right font-mono shadow-inner border-2 border-orange-500/80">
              <div className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
                Zain Counter Amount (₹)
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white overflow-x-auto">
                ₹{calcDisplay}
              </div>
            </div>

            {/* KEYPAD BUTTONS GRID */}
            <div className="grid grid-cols-4 gap-3">
              {/* Row 1 */}
              <button
                onClick={() => handleKeypadPress('CLEAR')}
                className="py-4 bg-rose-100 hover:bg-rose-200 text-rose-800 font-black rounded-2xl text-lg transition-colors flex items-center justify-center min-h-[56px]"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeypadPress('BACKSPACE')}
                className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-lg transition-colors flex items-center justify-center min-h-[56px]"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleKeypadPress('×')}
                className="py-4 bg-orange-100 hover:bg-orange-200 text-orange-900 font-black rounded-2xl text-xl transition-colors min-h-[56px]"
              >
                ×
              </button>
              <button
                onClick={() => handleKeypadPress('-')}
                className="py-4 bg-orange-100 hover:bg-orange-200 text-orange-900 font-black rounded-2xl text-2xl transition-colors min-h-[56px]"
              >
                -
              </button>

              {/* Row 2 */}
              <button
                onClick={() => handleKeypadPress('7')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                7
              </button>
              <button
                onClick={() => handleKeypadPress('8')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                8
              </button>
              <button
                onClick={() => handleKeypadPress('9')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                9
              </button>
              <button
                onClick={() => handleKeypadPress('+')}
                className="py-4 bg-orange-100 hover:bg-orange-200 text-orange-900 font-black rounded-2xl text-2xl transition-colors min-h-[56px]"
              >
                +
              </button>

              {/* Row 3 */}
              <button
                onClick={() => handleKeypadPress('4')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                4
              </button>
              <button
                onClick={() => handleKeypadPress('5')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                5
              </button>
              <button
                onClick={() => handleKeypadPress('6')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                6
              </button>
              <button
                onClick={handleAddLine}
                className="row-span-2 py-4 bg-slate-900 hover:bg-black text-white font-extrabold rounded-2xl text-sm shadow-lg transition-all flex flex-col items-center justify-center gap-1"
              >
                <Plus className="w-6 h-6 text-orange-400" />
                <span>+ Add Line</span>
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handleKeypadPress('1')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                1
              </button>
              <button
                onClick={() => handleKeypadPress('2')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                2
              </button>
              <button
                onClick={() => handleKeypadPress('3')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                3
              </button>

              {/* Row 5 */}
              <button
                onClick={() => handleKeypadPress('0')}
                className="col-span-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                0
              </button>
              <button
                onClick={() => handleKeypadPress('.')}
                className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-2xl border border-slate-200 shadow-2xs min-h-[56px]"
              >
                .
              </button>
              <button
                onClick={handleAddLine}
                className="py-4 bg-orange-100 hover:bg-orange-200 text-orange-950 font-extrabold rounded-2xl text-xs transition-colors min-h-[56px]"
              >
                Confirm
              </button>
            </div>
          </div>

          {/* RIGHT: SALE SUMMARY & FAST CHECKOUT (5 COLS) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-[#ff6600]" />
                  <h2 className="font-extrabold text-slate-900 text-base">Current Sale Summary</h2>
                </div>
                <button
                  onClick={handleResetCalc}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              {/* SALE LINES ITEM LIST */}
              <div className="py-2 space-y-2 max-h-[220px] overflow-y-auto">
                {lineItems.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400">No sale lines added yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter price on keypad & tap <span className="font-bold text-[#ff6600]">+ Add Line</span>
                    </p>
                  </div>
                ) : (
                  lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-medium transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-lg bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-xs">
                          ₹{item.unit_price.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* CUSTOMER DETAILS FORM */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" /> Customer Info (Auto-CRM)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">For WhatsApp Receipt</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp No."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* TOTALS & FAST CHECKOUT ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-slate-200 text-lg font-black text-slate-900">
                  <span>TOTAL AMOUNT</span>
                  <span className="text-[#ff6600]">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* DUAL CHECKOUT BUTTONS: 1-TAP QUICK CASH SALE & MULTI-PAYMENT */}
              <div className="space-y-2">
                <button
                  onClick={handleQuickCashSale}
                  disabled={lineItems.length === 0 && parseFloat(calcDisplay) <= 0}
                  className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 disabled:bg-slate-300 text-white font-black rounded-2xl text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>⚡ 1-TAP QUICK CASH SALE (₹{finalTotal.toLocaleString('en-IN')})</span>
                </button>

                <button
                  onClick={openPaymentModal}
                  disabled={lineItems.length === 0 && parseFloat(calcDisplay) <= 0}
                  className="w-full py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                  <span>UPI / Card / Split Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT SPLIT MODAL */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Receive Payment</h3>
                  <p className="text-xs text-slate-500">Total Payable: ₹{finalTotal.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* CUSTOMER DETAILS FORM IN MODAL */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-orange-600" /> Customer Information (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp No."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* PAYMENT BREAKDOWN SPLIT LIST */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600">Payment Modes (Split Allowed):</p>
                {payments.map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <select
                      value={p.type}
                      onChange={(e) => {
                        const next = [...payments];
                        next[idx].type = e.target.value as any;
                        setPayments(next);
                      }}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="cash">Cash Counter</option>
                      <option value="upi">UPI / QR Code</option>
                      <option value="card">Card POS Machine</option>
                      <option value="bank">Bank Transfer</option>
                    </select>

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={p.amount}
                        onChange={(e) => updatePaymentAmount(idx, parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 text-right"
                      />
                    </div>

                    {payments.length > 1 && (
                      <button onClick={() => removePaymentSplit(idx)} className="text-rose-500 p-1 hover:text-rose-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* ADD SPLIT BUTTONS */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => addPaymentSplit('cash')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    + Cash Split
                  </button>
                  <button
                    onClick={() => addPaymentSplit('upi')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    + UPI Split
                  </button>
                  <button
                    onClick={() => addPaymentSplit('card')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    + Card Split
                  </button>
                </div>
              </div>

              {/* BALANCE MATCH STATUS */}
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  isPaymentMatched ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <span>Total Allocated: ₹{totalPaidAllocated.toLocaleString('en-IN')}</span>
                <span>
                  {remainingDue === 0
                    ? '✓ Matched Exactly'
                    : remainingDue > 0
                    ? `Remaining: ₹${remainingDue.toLocaleString('en-IN')}`
                    : `Excess: ₹${Math.abs(remainingDue).toLocaleString('en-IN')}`}
                </span>
              </div>

              {/* CONFIRM BUTTON */}
              <button
                onClick={handleConfirmSale}
                disabled={!isPaymentMatched}
                className="w-full py-4 bg-[#ff6600] hover:bg-orange-600 disabled:bg-slate-300 text-white font-black rounded-2xl text-base shadow-lg shadow-orange-500/20 transition-all min-h-[50px] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRM SALE</span>
              </button>
            </div>
          </div>
        )}

        {/* SALE SUCCESS & CUSTOMER RECEIPT SLIP MODAL */}
        {completedSale && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SALE CONFIRMED
                </span>
              </div>

              {/* CUSTOMER RETAIL RECEIPT SLIP */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 font-mono text-xs text-slate-900 shadow-inner max-w-sm mx-auto space-y-3">
                {/* STORE HEADER */}
                <div className="text-center space-y-1">
                  <div className="flex justify-center mb-1">
                    <ZainLogo size="md" showText={false} />
                  </div>
                  <h2 className="font-black text-lg text-slate-900 uppercase tracking-wider">{activeShop?.name || 'ZAIN FOOTWEAR'}</h2>
                  <p className="text-[10px] text-slate-600 font-bold uppercase">{activeShop?.code ? `BRANCH: ${activeShop.code}` : 'MAIN STORE'}</p>
                  <p className="text-[10px] text-slate-500">
                    {activeShop?.address_line_1 ? `${activeShop.address_line_1}${activeShop.city ? `, ${activeShop.city}` : ''}` : 'Main Market Road, Bandra, Mumbai'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-600">
                    Ph: {activeShop?.phone || '+91 98200 12345'}
                  </p>
                  <div className="text-[11px] font-black uppercase text-slate-900 border-y border-dashed border-slate-400 py-1 my-1.5">
                    PURCHASE RECEIPT / CASH SLIP
                  </div>
                </div>

                {/* INVOICE META GRID */}
                <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between">
                    <span>Receipt No: <strong className="text-slate-900">{completedSale.receipt_number}</strong></span>
                    <span>Date: <strong>{new Date(completedSale.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier: {userProfile?.full_name?.split(' ')[0] || 'Staff'}</span>
                    <span>Time: {new Date(completedSale.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {completedSale.customer_name && (
                    <div className="flex justify-between font-bold text-slate-900 pt-0.5 border-t border-slate-200">
                      <span>Cust: {completedSale.customer_name}</span>
                      {completedSale.customer_phone && <span>Ph: {completedSale.customer_phone}</span>}
                    </div>
                  )}
                </div>

                {/* ITEMIZED TABLE */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="grid grid-cols-12 font-black border-b border-slate-400 pb-1 uppercase text-[10px]">
                    <span className="col-span-6">Item Name</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-4 text-right">Amount (₹)</span>
                  </div>

                  {completedSale.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 font-medium">
                      <span className="col-span-6 truncate font-bold text-slate-900">{item.name}</span>
                      <span className="col-span-2 text-center">1</span>
                      <span className="col-span-4 text-right font-bold">₹{item.unit_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* FINANCIAL BREAKDOWN */}
                <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between font-semibold">
                    <span>Sub Total:</span>
                    <span>₹{completedSale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-1.5 border-t-2 border-slate-900">
                    <span>TOTAL PAID:</span>
                    <span className="text-[#ff6600]">₹{completedSale.total.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-[10px] text-slate-700 pt-1">
                    <span>Payment Mode:</span>
                    <span className="uppercase">
                      {completedSale.cash_amount > 0 && completedSale.online_amount > 0
                        ? 'CASH & ONLINE SPLIT'
                        : completedSale.cash_amount > 0
                        ? 'CASH COUNTER'
                        : 'ONLINE / UPI'}
                    </span>
                  </div>
                </div>

                {/* FOOTER & BARCODE */}
                <div className="border-t border-dashed border-slate-400 pt-2.5 text-center space-y-1 text-[10px]">
                  <div className="font-mono tracking-widest text-[13px] font-bold text-slate-800">
                    ||| | ||||| || | |||| ||| ||
                  </div>
                  <p className="font-black text-slate-900 uppercase">Thank You For Shopping At Zain Footwear!</p>
                  <p className="text-slate-500 text-[9px]">Have a great day ahead!</p>
                </div>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleNewSale}
                  className="py-3 bg-slate-900 hover:bg-black text-white font-extrabold rounded-xl text-xs transition-colors"
                >
                  New Sale
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 border border-slate-300"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button
                  onClick={() =>
                    handleWhatsAppShare(
                      completedSale.receipt_number,
                      completedSale.total,
                      completedSale.customer_phone,
                      completedSale.customer_name
                    )
                  }
                  className="py-3 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-md"
                >
                  <Send className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default CalculatorPOSPage;
