import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Search,
  User,
  UserPlus,
  History,
  ShoppingBag,
  Tag,
  Phone,
  CheckCircle2,
  X,
  Footprints,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface PosLineItem {
  id: string;
  name: string;
  category: string;
  size: string;
  unit_price: number;
}

export const CalculatorPOSPage: React.FC = () => {
  const { activeShop, userProfile, customers, addCustomer, sales, recordSale } = useShop();
  const [searchParams] = useSearchParams();

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

  // CUSTOMER PICKER & HISTORY MODALS
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState<boolean>(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState<boolean>(false);
  const [newCustNameInput, setNewCustNameInput] = useState<string>('');
  const [newCustPhoneInput, setNewCustPhoneInput] = useState<string>('');
  const [newCustOpeningDueInput, setNewCustOpeningDueInput] = useState<string>('0');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

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

  // Pre-select customer if customerId or customer_id is provided in URL
  useEffect(() => {
    const custIdFromUrl = searchParams.get('customerId') || searchParams.get('customer_id');
    if (custIdFromUrl) {
      const matched = customers.find((c) => c.id === custIdFromUrl);
      if (matched) {
        setSelectedCustomerId(matched.id);
        setCustomerName(matched.name);
        setCustomerPhone(matched.phone || '');
      }
    }
  }, [searchParams, customers]);

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
  const shoeSize =
    lineItems.length > 1
      ? `${lineItems[0]?.size || '8'} (+${lineItems.length - 1})`
      : lineItems[0]?.size || '8';

  // Find active customer object
  const activeCustomer = useMemo(() => {
    if (selectedCustomerId) {
      return customers.find((c) => c.id === selectedCustomerId) || null;
    }
    if (customerPhone && customerPhone.length >= 10) {
      return customers.find((c) => c.phone.includes(customerPhone.slice(-10))) || null;
    }
    if (customerName && customerName.trim() !== '' && customerName !== 'Walk-in Customer') {
      return customers.find((c) => c.name.toLowerCase() === customerName.trim().toLowerCase()) || null;
    }
    return null;
  }, [selectedCustomerId, customerPhone, customerName, customers]);

  // Customer Sales & Purchase Items History
  const customerPastSales = useMemo(() => {
    if (!activeCustomer && !customerPhone) return [];
    return sales.filter((s) => {
      if (activeCustomer && s.customer_id === activeCustomer.id) return true;
      if (activeCustomer && activeCustomer.phone && s.customer_phone === activeCustomer.phone) return true;
      if (customerPhone && s.customer_phone === customerPhone) return true;
      return false;
    });
  }, [activeCustomer, customerPhone, sales]);

  // Extract all individual items purchased by this customer in past
  const customerPastItems = useMemo(() => {
    return customerPastSales.flatMap((s) =>
      (s.items || []).map((it) => ({
        ...it,
        receipt_number: s.receipt_number,
        sale_date: s.created_at,
      }))
    );
  }, [customerPastSales]);

  // Favorite / Preferred Shoe Size
  const preferredSize = useMemo(() => {
    const counts: Record<string, number> = {};
    customerPastItems.forEach((it) => {
      if (it.size) {
        counts[it.size] = (counts[it.size] || 0) + (it.quantity || 1);
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [customerPastItems]);

  // Filtered customer list for modal
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return customers.slice(0, 15);
    return customers.filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)));
  }, [customerSearchQuery, customers]);

  // Select a customer from picker
  const handleSelectCustomer = (c: any) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone || '');
    setIsCustomerPickerOpen(false);
  };

  // Quick Add Customer directly from POS
  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustNameInput.trim()) return;

    try {
      const created = await addCustomer({
        organization_id: activeShop?.organization_id || 'org-footwear-101',
        shop_id: activeShop?.id || 'shop-mumbai-01',
        name: newCustNameInput.trim(),
        phone: newCustPhoneInput.trim() || 'N/A',
        opening_balance: parseFloat(newCustOpeningDueInput) || 0,
        total_purchases_count: 0,
        total_spent: 0,
      });

      setSelectedCustomerId(created.id);
      setCustomerName(created.name);
      setCustomerPhone(created.phone || '');
      setIsQuickAddCustomerOpen(false);
      setIsCustomerPickerOpen(false);
      setNewCustNameInput('');
      setNewCustPhoneInput('');
      setNewCustOpeningDueInput('0');
    } catch (err) {
      console.error('Failed to quick add customer:', err);
    }
  };

  // Clear selected customer (revert to Walk-in)
  const handleClearCustomer = () => {
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
  };

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
          size: preferredSize || '8',
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

  // Duplicate Line Item
  const handleDuplicateLineItem = (item: PosLineItem) => {
    const newItem: PosLineItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: `Item #${lineItems.length + 1}`,
    };
    setLineItems((prev) => [...prev, newItem]);
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
        size: preferredSize || '8',
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

  // Complete Sale & Store Transaction
  const handleCompleteSale = async () => {
    if (activeSubtotal <= 0) return;

    const cashNum = parseFloat(cashPaid) || 0;
    const onlineNum = parseFloat(onlinePaid) || 0;
    const dueNum = parseFloat(dueAmount) || 0;

    let finalCustId = selectedCustomerId;

    // Auto-create customer if typed manually and does not exist yet
    if (!finalCustId && customerName.trim() && customerName !== 'Walk-in Customer') {
      try {
        const created = await addCustomer({
          organization_id: activeShop?.organization_id || 'org-footwear-101',
          shop_id: activeShop?.id || 'shop-mumbai-01',
          name: customerName.trim(),
          phone: customerPhone.trim() || 'N/A',
          opening_balance: 0,
          total_purchases_count: 0,
          total_spent: 0,
        });
        finalCustId = created.id;
      } catch (err) {
        console.error('Auto customer creation error:', err);
      }
    }

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
        customer_id: finalCustId || undefined,
        customer_name: customerName.trim() || (finalCustId ? activeCustomer?.name : 'Walk-in Customer'),
        customer_phone: customerPhone.trim() || (finalCustId ? activeCustomer?.phone : undefined),
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
  // STEP 2: SHOE SIZE, ITEMS & CUSTOMER STATE (Collapsible Dropdown for Multi-Item)
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
            Step 2 • {lineItems.length} Selected Item{lineItems.length === 1 ? '' : 's'} & Customer
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

        {/* Scrollable Center Content with Selected Items & Customer Profile */}
        <div className="flex-1 flex flex-col space-y-2.5 overflow-y-auto no-scrollbar py-1">
          {/* CUSTOMER SELECTION & PURCHASE HISTORY PANEL */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Customer / Party</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomerPickerOpen(true)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span>{activeCustomer ? 'Change Customer' : 'Select Customer'}</span>
              </button>
            </div>

            {/* If Customer is selected */}
            {activeCustomer ? (
              <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 rounded-xl p-3 border border-orange-200/80 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{activeCustomer.name}</h4>
                      {activeCustomer.current_balance !== undefined && activeCustomer.current_balance > 0 ? (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          ₹{activeCustomer.current_balance.toLocaleString('en-IN')} Due
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          Settled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{activeCustomer.phone || 'No phone'}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Remove Customer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Customer Purchase Insights & History Quick Summary */}
                <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between text-[11px]">
                  <div className="text-slate-700">
                    <span className="font-bold text-slate-900">{customerPastSales.length}</span> Past Bills •{' '}
                    <span className="font-bold text-emerald-700">₹{(activeCustomer.total_spent || 0).toLocaleString('en-IN')}</span> Total Spent
                    {preferredSize && (
                      <span className="block text-[10px] font-semibold text-orange-700">
                        👟 Preferred Shoe Size: UK {preferredSize}
                      </span>
                    )}
                  </div>

                  {customerPastSales.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-800 border border-orange-300 rounded-lg text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3 h-3" />
                      <span>Past Items ({customerPastItems.length})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* If no customer selected yet */
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Customer Name / Mobile (or type to add)"
                    value={customerPhone ? `${customerName} (${customerPhone})` : customerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerName(val);
                      const digits = val.replace(/\D/g, '');
                      setCustomerPhone(digits.length === 10 ? digits : '');
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomerPickerOpen(true)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5 text-orange-400" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>New or Walk-in customer will be saved automatically</span>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddCustomerOpen(true)}
                    className="text-orange-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ New Party</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: SELECTED ITEMS BEING PURCHASED (ABHI KYA KHAREED RAHE HAIN) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                <span>Selected Items to Purchase ({lineItems.length})</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-orange-600">
                ₹{calculatedItemsTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* List of Cart Items */}
            {lineItems.map((item, idx) => {
              const isExpanded = lineItems.length === 1 || expandedItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Collapsible Header */}
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
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.category} • Size {item.size}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Footwear #{idx + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{item.unit_price.toLocaleString('en-IN')}
                      </span>

                      {/* Duplicate & Delete Buttons */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateLineItem(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLineItem(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {lineItems.length > 1 && (
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Body: Categories & Sizes */}
                  {isExpanded && (
                    <div className="p-3.5 space-y-3 bg-white animate-in fade-in duration-100">
                      {/* 1. Category Chips */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Footwear Type
                          </span>
                          <span className="text-xs font-black text-orange-600">{item.category}</span>
                        </div>
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

        {/* MODAL: CUSTOMER SELECTOR PICKER */}
        {isCustomerPickerOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-orange-600" />
                  <span>Select Customer / Party</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCustomerPickerOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Customer List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <p>No customer found matching "{customerSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCustNameInput(customerSearchQuery);
                        setIsQuickAddCustomerOpen(true);
                      }}
                      className="mt-2 text-orange-600 font-bold hover:underline"
                    >
                      + Create "{customerSearchQuery}" as New Customer
                    </button>
                  </div>
                ) : (
                  filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="p-2.5 flex items-center justify-between rounded-xl hover:bg-orange-50/70 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">{c.phone || 'No phone'}</p>
                      </div>
                      <div className="text-right">
                        {c.current_balance !== undefined && c.current_balance > 0 ? (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full block">
                            ₹{c.current_balance} Due
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-700">Settled</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Quick Add Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleClearCustomer();
                    setIsCustomerPickerOpen(false);
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Walk-in (No Party)
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickAddCustomerOpen(true)}
                  className="px-3 py-2 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Quick Add Customer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: QUICK ADD CUSTOMER */}
        {isQuickAddCustomerOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <form
              onSubmit={handleQuickAddCustomer}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#ff6600]" />
                  <span>Add New Customer Party</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuickAddCustomerOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Imran Khan"
                  value={newCustNameInput}
                  onChange={(e) => setNewCustNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  10-Digit Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newCustPhoneInput}
                  onChange={(e) => setNewCustPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Previous Due / Opening Balance (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newCustOpeningDueInput}
                  onChange={(e) => setNewCustOpeningDueInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddCustomerOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: CUSTOMER PAST PURCHASE HISTORY */}
        {isHistoryModalOpen && activeCustomer && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">{activeCustomer.name}'s Purchase History</h3>
                  <p className="text-[11px] text-slate-500">
                    {customerPastSales.length} Total Bills • {customerPastItems.length} Footwear Items
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                {customerPastSales.map((sale) => (
                  <div key={sale.id} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
                      <div>
                        <span className="font-mono font-black text-slate-900">#{sale.receipt_number}</span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          {new Date(sale.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="font-black text-orange-600 font-mono">
                        ₹{sale.total.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Individual Items */}
                    <div className="space-y-1">
                      {(sale.items || []).map((it, itIdx) => (
                        <div key={itIdx} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                          <span className="truncate pr-2">
                            • {it.item_name} {it.size ? `[Size ${it.size}]` : ''}
                          </span>
                          <span className="font-mono text-slate-900">₹{it.unit_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close History
              </button>
            </div>
          </div>
        )}
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
            {lineItems.length} Items • {activeCustomer?.name || customerName || 'Walk-in'}
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
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
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
                className="text-slate-400 hover:text-rose-600 text-xs font-bold underline cursor-pointer"
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
      {/* Top Header Bar with Customer Pill & Exit Sale */}
      <div className="flex items-center justify-between pt-1 pb-1 flex-shrink-0">
        <Link
          to="/app/dashboard"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 bg-[#282a2d] hover:bg-[#34373c] active:scale-95 px-3 py-2 rounded-full border border-white/5 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Exit Sale</span>
        </Link>

        {/* CUSTOMER SELECTION PILL AT TOP */}
        <div className="flex items-center space-x-1.5">
          {activeCustomer ? (
            <button
              type="button"
              onClick={() => setIsCustomerPickerOpen(true)}
              className="flex items-center space-x-1.5 text-[11px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-full hover:bg-orange-500/30 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span className="max-w-[110px] truncate">{activeCustomer.name}</span>
              {activeCustomer.current_balance !== undefined && activeCustomer.current_balance > 0 && (
                <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">
                  ₹{activeCustomer.current_balance} Due
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCustomerPickerOpen(true)}
              className="flex items-center space-x-1 text-[11px] font-bold text-slate-300 bg-[#282a2d] hover:bg-[#34373c] border border-white/10 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Customer</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleKeypadPress('AC')}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-full bg-[#282a2d] hover:bg-rose-950/40 border border-white/5 transition-colors cursor-pointer"
          >
            AC
          </button>
        </div>
      </div>

      {/* Android Big Display Screen */}
      <div className="flex-1 flex flex-col justify-end text-right px-3 py-1 space-y-1 relative overflow-hidden flex-shrink-0">
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-400">
          <span className="text-[11px] font-bold text-slate-500">
            {activeCustomer ? `Customer: ${activeCustomer.name}` : 'Walk-in'}
          </span>
          <p className="tracking-wider truncate">
            {calcDisplay !== '0' ? calcDisplay : lineItems.length > 0 ? `${lineItems.length} item(s) selected` : '0'}
          </p>
        </div>

        <div className="flex items-baseline justify-end space-x-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#ff7b00]">₹</span>
          <span className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white">
            {(lineItems.length > 0 ? activeSubtotal : currentCalcValue || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Selected Items Mini Badges (Chips) */}
        {lineItems.length > 0 && (
          <div className="flex items-center justify-end space-x-1.5 overflow-x-auto py-1 no-scrollbar">
            {lineItems.map((it, idx) => (
              <div
                key={it.id}
                className="flex items-center space-x-1 bg-[#282a2d] border border-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-200 flex-shrink-0"
              >
                <span>#{idx + 1} {it.category} (Size {it.size}) ₹{it.unit_price}</span>
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

      {/* MODAL: CUSTOMER SELECTOR PICKER (FROM STEP 1) */}
      {isCustomerPickerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-600" />
                <span>Select Customer / Party</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerPickerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>No customer found matching "{customerSearchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCustNameInput(customerSearchQuery);
                      setIsQuickAddCustomerOpen(true);
                    }}
                    className="mt-2 text-orange-600 font-bold hover:underline"
                  >
                    + Create "{customerSearchQuery}" as New Customer
                  </button>
                </div>
              ) : (
                filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="p-2.5 flex items-center justify-between rounded-xl hover:bg-orange-50/70 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">{c.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right">
                      {c.current_balance !== undefined && c.current_balance > 0 ? (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full block">
                          ₹{c.current_balance} Due
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-700">Settled</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Quick Add Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleClearCustomer();
                  setIsCustomerPickerOpen(false);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Walk-in (No Party)
              </button>

              <button
                type="button"
                onClick={() => setIsQuickAddCustomerOpen(true)}
                className="px-3 py-2 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Quick Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD CUSTOMER (FROM STEP 1) */}
      {isQuickAddCustomerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form
            onSubmit={handleQuickAddCustomer}
            className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl text-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#ff6600]" />
                <span>Add New Customer Party</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAddCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Imran Khan"
                value={newCustNameInput}
                onChange={(e) => setNewCustNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                10-Digit Mobile / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={newCustPhoneInput}
                onChange={(e) => setNewCustPhoneInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                Previous Due / Opening Balance (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={newCustOpeningDueInput}
                onChange={(e) => setNewCustOpeningDueInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setIsQuickAddCustomerOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save & Select
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CalculatorPOSPage;
