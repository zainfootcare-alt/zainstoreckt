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
  User,
  History,
  ShoppingBag,
  Tag,
  Phone,
  CheckCircle2,
  X,
  MapPin,
  Navigation,
  Copy,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { DemandLogModal } from '../../components/common/DemandLogModal';

interface PosLineItem {
  id: string;
  name: string;
  category: string;
  size: string;
  unit_price: number;
}

export const CalculatorPOSPage: React.FC = () => {
  const {
    activeShop,
    userProfile,
    activeRole,
    customers,
    addCustomer,
    sales,
    recordSale,
    deleteSale,
    isLocationVerified,
    locationError,
    verifyStoreLocation,
    bypassLocationVerification,
    checkSalesTimeAllowed,
    lockScreen,
  } = useShop();
  const isAdmin = activeRole === 'ADMIN';
  const salesTimeCheck = checkSalesTimeAllowed();
  const isSalesCreationBlocked = !salesTimeCheck.allowed;
  const [searchParams] = useSearchParams();
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [duplicateWarningSale, setDuplicateWarningSale] = useState<any | null>(null);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);

  // Wizard Step: 'CALCULATOR' (Step 1) -> 'DETAILS' (Step 2) -> 'PAYMENT' (Step 3) -> 'COMPLETED' (Step 4)
  const [step, setStep] = useState<'CALCULATOR' | 'DETAILS' | 'PAYMENT' | 'COMPLETED'>('CALCULATOR');

  // STEP 1: CALCULATOR STATE
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [lineItems, setLineItems] = useState<PosLineItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Sandals');
  const [activeSize, setActiveSize] = useState<string>('8');

  // STEP 2: SHOE SIZE & CUSTOMER STATE
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isItemsSectionOpen, setIsItemsSectionOpen] = useState<boolean>(true);
  const [isCustomerSectionOpen, setIsCustomerSectionOpen] = useState<boolean>(true);
  const [isCustPickerOpen, setIsCustPickerOpen] = useState<boolean>(false);
  const [custPickerSearch, setCustPickerSearch] = useState<string>('');

  // CUSTOMER HISTORY MODAL
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

  // Footwear Categories (Default: Sandals)
  const FOOTWEAR_CATEGORIES = [
    { id: 'Sandals', label: '👡 Sandals', icon: '👡' },
    { id: 'Sneakers', label: '👟 Sneakers', icon: '👟' },
    { id: 'Formal', label: '👞 Formal', icon: '👞' },
    { id: 'Casual', label: '🥿 Casual', icon: '🥿' },
    { id: 'Slippers', label: '🩴 Slippers', icon: '🩴' },
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

  // Find active customer object from database
  const activeCustomer = useMemo(() => {
    if (selectedCustomerId) {
      return customers.find((c) => c.id === selectedCustomerId) || null;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      return (
        customers.find((c) => {
          const cPhone = (c.phone || '').replace(/\D/g, '');
          return cPhone.length >= 10 && (cPhone.endsWith(cleanPhone.slice(-10)) || cleanPhone.endsWith(cPhone.slice(-10)));
        }) || null
      );
    }
    if (customerName && customerName.trim() !== '' && customerName.toLowerCase() !== 'walk-in' && customerName.toLowerCase() !== 'walk-in customer') {
      return customers.find((c) => c.name.toLowerCase() === customerName.trim().toLowerCase()) || null;
    }
    return null;
  }, [selectedCustomerId, customerPhone, customerName, customers]);

  // Customer Sales & Purchase Items History (sorted newest first)
  const customerPastSales = useMemo(() => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!activeCustomer && cleanPhone.length < 10) return [];
    return sales
      .filter((s) => {
        if (activeCustomer && s.customer_id === activeCustomer.id) return true;
        const sPhone = (s.customer_phone || '').replace(/\D/g, '');
        if (cleanPhone.length >= 10 && sPhone.length >= 10 && (sPhone.endsWith(cleanPhone.slice(-10)) || cleanPhone.endsWith(sPhone.slice(-10)))) {
          return true;
        }
        return false;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activeCustomer, customerPhone, sales]);

  // Most recent past purchase
  const lastPurchase = useMemo(() => {
    return customerPastSales.length > 0 ? customerPastSales[0] : null;
  }, [customerPastSales]);

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

  // Handle customer mobile input change & auto-match database customer / past sales
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    const clean = val.replace(/\D/g, '');

    if (clean.length >= 10) {
      // 1. Try finding in customers database
      const matched = customers.find((c) => {
        const cPhone = (c.phone || '').replace(/\D/g, '');
        return cPhone.length >= 10 && (cPhone.endsWith(clean.slice(-10)) || clean.endsWith(cPhone.slice(-10)));
      });

      if (matched) {
        setSelectedCustomerId(matched.id);
        if (!customerName || customerName === 'Walk-in Customer' || customerName === 'Walk-in') {
          setCustomerName(matched.name);
        }
        return;
      }

      // 2. Try finding in past sales records
      const saleMatch = sales.find((s) => {
        const sPhone = (s.customer_phone || '').replace(/\D/g, '');
        return sPhone.length >= 10 && (sPhone.endsWith(clean.slice(-10)) || clean.endsWith(sPhone.slice(-10)));
      });

      if (saleMatch) {
        if (saleMatch.customer_id) {
          setSelectedCustomerId(saleMatch.customer_id);
        }
        if (saleMatch.customer_name && saleMatch.customer_name !== 'Walk-in Customer') {
          if (!customerName || customerName === 'Walk-in Customer' || customerName === 'Walk-in') {
            setCustomerName(saleMatch.customer_name);
          }
        }
      }
    } else {
      if (selectedCustomerId) {
        setSelectedCustomerId('');
      }
    }
  };

  // Helper date formatter for last purchase
  const formatPurchaseDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
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

    // AUTOMATIC PLUS (+) BEHAVIOR: Adds item to cart immediately with selected category & size
    if (key === '+') {
      const val = Math.round(evaluateCalc(calcDisplay));
      if (val > 0) {
        const itemIndex = lineItems.length + 1;
        const newItem: PosLineItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: `Item #${itemIndex}`,
          category: activeCategory,
          size: activeSize || preferredSize || '8',
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

  // Handle salesperson GPS Geofence Verification
  const handleVerifyGPS = async () => {
    setIsVerifyingLocation(true);
    try {
      const res = await verifyStoreLocation();
      if (!res.success) {
        alert(res.message || 'Outside store location perimeter. Store presence required.');
      }
    } catch (err: any) {
      alert('GPS location error: ' + (err.message || 'Failed'));
    } finally {
      setIsVerifyingLocation(false);
    }
  };

  // Go to Step 2 (Shoe Size & Category Configuration)
  const handleProceedToDetails = async () => {
    // Check salesperson store location if required
    if (!isAdmin && activeShop?.require_location_for_sales && !isLocationVerified) {
      setIsVerifyingLocation(true);
      const loc = await verifyStoreLocation();
      setIsVerifyingLocation(false);
      if (!loc.success) {
        alert(`📍 Store Location Required: Salespersons must be present at the shop to bill orders.\n${locationError || loc.message}`);
        return;
      }
    }

    const currentVal = Math.round(evaluateCalc(calcDisplay));
    let items = [...lineItems];

    // If there's an amount on screen that wasn't added with plus yet, add it
    if (currentVal > 0) {
      const itemIndex = items.length + 1;
      const newItem: PosLineItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: `Item #${itemIndex}`,
        category: activeCategory,
        size: activeSize || preferredSize || '8',
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

  // Complete Sale & Store Transaction with Duplicate Detection
  const handleCompleteSale = async (bypassDuplicateCheck = false) => {
    if (isProcessingSale) return;
    if (activeSubtotal <= 0) return;

    // Check store sales operating hours
    if (isSalesCreationBlocked) {
      alert(
        `⚠️ Counter Sales Locked: Store sales hours set by Admin are ${salesTimeCheck.startTime} to ${salesTimeCheck.endTime}. Sales creation is locked.`
      );
      return;
    }

    // Duplicate Order Protection: Check if an identical sale with exact same amount was created within last 45s
    if (!bypassDuplicateCheck) {
      const recentMatchingSale = sales.find((s) => {
        const saleTime = new Date(s.created_at).getTime();
        const timeDiffSec = (Date.now() - saleTime) / 1000;
        return s.total === netPayable && timeDiffSec <= 45;
      });

      if (recentMatchingSale) {
        setDuplicateWarningSale(recentMatchingSale);
        return;
      }
    }

    setDuplicateWarningSale(null);
    setIsProcessingSale(true);

    const cashNum = parseFloat(cashPaid) || 0;
    const onlineNum = parseFloat(onlinePaid) || 0;
    const dueNum = parseFloat(dueAmount) || 0;

    let finalCustId = selectedCustomerId;

    // Auto-create customer if phone or name provided and does not exist in customer list yet
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!finalCustId && (cleanPhone.length >= 10 || (customerName.trim() && customerName !== 'Walk-in Customer'))) {
      try {
        const created = await addCustomer({
          organization_id: activeShop?.organization_id || 'org-footwear-101',
          shop_id: activeShop?.id || 'shop-mumbai-01',
          name: customerName.trim() || (cleanPhone ? `Customer ${cleanPhone.slice(-4)}` : 'Walk-in Customer'),
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
    } finally {
      setIsProcessingSale(false);
    }
  };

  // Delete Completed Sale (Admin Only Authority)
  const handleDeleteCompletedSale = async () => {
    if (!completedSale) return;
    if (!isAdmin) {
      alert('Unauthorized: Only Admins can delete sales orders.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Are you sure you want to permanently delete order #${completedSale.receipt_number}?\nThis will reverse the payment of ₹${completedSale.total.toLocaleString('en-IN')}.`
    );
    if (!confirmed) return;

    try {
      await deleteSale(completedSale.id);
      alert(`Order #${completedSale.receipt_number} deleted successfully.`);
      handleResetForNextSale();
    } catch (err: any) {
      alert(err.message || 'Failed to delete order.');
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
    setActiveCategory('Sandals');
    setActiveSize('8');
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
  // STEP 2: SHOE SIZE, ITEMS & CUSTOMER DETAILS (Clean, Simple, Professional)
  // =========================================================================
  if (step === 'DETAILS') {
    const activeItem = lineItems.find((it) => it.id === expandedItemId) || lineItems[0];

    return (
      <div className="h-[100dvh] max-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col justify-between max-w-md mx-auto p-3 select-none overflow-hidden animate-in fade-in duration-150 font-sans">
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

          {/* Location Status Pill */}
          <div className="flex items-center space-x-1.5">
            {isLocationVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Store OK</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleVerifyGPS}
                disabled={isVerifyingLocation}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full hover:bg-amber-100 cursor-pointer"
              >
                <Navigation className={`w-3 h-3 ${isVerifyingLocation ? 'animate-spin' : ''}`} />
                <span>{isVerifyingLocation ? 'Checking GPS...' : 'Verify GPS'}</span>
              </button>
            )}
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Step 2 • Sizing & Customer
            </span>
          </div>
        </div>

        {/* Bill Summary Bar */}
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 my-1">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Bill Amount</p>
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

        {/* Scrollable Center: Section 1 (Footwear Sizing) & Section 2 (Customer) */}
        <div className="flex-1 flex flex-col space-y-2.5 overflow-y-auto no-scrollbar py-1">
          {/* ================================================================= */}
          {/* 1. UPPER SECTION: FOOTWEAR CATEGORY & SIZE */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
            {/* Multi-Item Tab Selector (Only if more than 1 item) */}
            {lineItems.length > 1 && (
              <div className="space-y-1.5 pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Select Item to Set Sizing ({lineItems.length} items):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {lineItems.map((it, idx) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setExpandedItemId(it.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer border ${
                        activeItem?.id === it.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span>{it.category}</span>
                      <span className="opacity-80 font-mono text-[10px]">(Sz {it.size})</span>
                      <span className="font-mono text-orange-400 font-black">₹{it.unit_price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Selected Item Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {lineItems.length > 1
                      ? `Item #${lineItems.findIndex((it) => it.id === activeItem?.id) + 1} • ${activeItem?.category}`
                      : 'Footwear Category & Size'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Item Price: ₹{activeItem?.unit_price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => activeItem && handleRemoveLineItem(activeItem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove this item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-xs font-black font-mono text-orange-600">
                  ₹{activeItem?.unit_price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Category Chips with Icons */}
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Select Footwear Category
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {FOOTWEAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => activeItem && updateItemCategory(activeItem.id, cat.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center truncate transition-all cursor-pointer ${
                      activeItem?.category === cat.id
                        ? 'bg-[#ff6600] text-white shadow-xs font-black scale-102 ring-2 ring-orange-400/40'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UK Shoe Size Chips */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Select Shoe Size (UK / IND)
                </span>
                <span className="text-xs font-black text-orange-600">Selected: UK {activeItem?.size}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SHOE_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => activeItem && updateItemSize(activeItem.id, sz)}
                    className={`h-9 ${
                      sz === 'Free Size' ? 'px-2.5 text-[11px]' : 'w-9 text-xs'
                    } rounded-xl font-black flex items-center justify-center transition-all cursor-pointer ${
                      activeItem?.size === sz
                        ? 'bg-slate-900 text-white shadow-xs border-2 border-slate-900 scale-105 ring-2 ring-slate-400/30'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 2. LOWER SECTION: CUSTOMER DETAILS (NAME & NUMBER) */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5">
            {/* Customer Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Customer Information
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {lastPurchase || activeCustomer
                      ? 'Existing Customer in DB'
                      : customerPhone.replace(/\D/g, '').length >= 10
                      ? 'New Customer (will auto-save)'
                      : 'Walk-in Customer (Optional)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsCustPickerOpen(!isCustPickerOpen)}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {isCustPickerOpen ? 'Close List ▴' : 'Saved List ▾'}
                </button>
                {(customerPhone || customerName) && (
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Saved Customers Popover */}
            {isCustPickerOpen && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-xs animate-in fade-in duration-100">
                <input
                  type="text"
                  value={custPickerSearch}
                  onChange={(e) => setCustPickerSearch(e.target.value)}
                  placeholder="Search customer by name or phone..."
                  className="w-full pl-3 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                />
                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100 no-scrollbar">
                  {customers
                    .filter((c) => {
                      if (!custPickerSearch.trim()) return true;
                      const q = custPickerSearch.toLowerCase();
                      return c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
                    })
                    .slice(0, 8)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setCustomerName(c.name);
                          setCustomerPhone(c.phone || '');
                          setIsCustPickerOpen(false);
                          setCustPickerSearch('');
                        }}
                        className="w-full text-left p-2 hover:bg-orange-50/80 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{c.phone || 'No phone'}</p>
                        </div>
                        {c.current_balance !== undefined && c.current_balance > 0 ? (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ₹{c.current_balance} Due
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Select →</span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Direct Phone & Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile Number (Optional)"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={15}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-mono"
                />
              </div>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Customer Name (Walk-in)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Detected Past Purchase Compact Card */}
            {lastPurchase ? (
              <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 rounded-xl p-2.5 border border-emerald-200/90 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-900 font-extrabold">{activeCustomer?.name || customerName}</span>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Existing
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="text-[10px] text-orange-600 hover:underline font-bold cursor-pointer"
                  >
                    History ({customerPastSales.length}) →
                  </button>
                </div>

                <p className="text-[11px] text-slate-600">
                  Last purchase: <b className="text-slate-800">{formatPurchaseDate(lastPurchase.created_at)}</b> (₹{lastPurchase.total})
                  {preferredSize && (
                    <span className="ml-2 font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                      Preferred Sz {preferredSize}
                    </span>
                  )}
                </p>
              </div>
            ) : customerPhone.replace(/\D/g, '').length >= 10 ? (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>New customer • Will be auto-added to your store database.</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="pt-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleProceedToPayment}
            className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-base shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Proceed to Payment (₹{activeSubtotal.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL: CUSTOMER PAST PURCHASE HISTORY */}
        {isHistoryModalOpen && (customerPastSales.length > 0 || activeCustomer) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 space-y-4 shadow-2xl max-h-[90dvh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {activeCustomer?.name || customerName || 'Customer'}'s Purchase History
                  </h3>
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
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
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

            {/* Admin-only Delete Sale Option on Completed Screen */}
            {isAdmin && (
              <div className="pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDeleteCompletedSale}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Order (Admin Authority Only)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thermal Print Modal */}
        {showThermalPreview && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto">
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
      <div className="h-[100dvh] max-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col justify-start max-w-md mx-auto p-2.5 sm:p-3 select-none overflow-hidden animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1 flex-shrink-0">
          <button
            onClick={() => setStep('DETAILS')}
            className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 px-2.5 py-1 rounded-full shadow-2xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Back to Details</span>
          </button>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Step 3 • Payment & Settlement
          </span>
        </div>

        {/* Compact Integrated Bill & Footwear Items Summary Card */}
        <div className="bg-slate-950 text-white rounded-2xl p-3 shadow-md flex-shrink-0 my-1 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Payable</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-orange-400">₹</span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {(activeSubtotal - discountAmount).toLocaleString('en-IN')}
                </span>
                {discountAmount > 0 && (
                  <span className="text-xs font-bold text-emerald-400 ml-1.5 line-through opacity-70">
                    ₹{activeSubtotal.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Badge */}
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-200 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
                <User className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[120px]">{activeCustomer?.name || customerName || 'Walk-in'}</span>
              </span>
              {customerPhone && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{customerPhone}</p>
              )}
            </div>
          </div>

          {/* Footwear Items Summary Breakdown Pills */}
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <ShoppingBag className="w-3 h-3 text-slate-400" />
              <span>{lineItems.length > 0 ? lineItems.length : 1} Item{lineItems.length > 1 ? 's' : ''}:</span>
            </span>
            {lineItems.length > 0 ? (
              lineItems.map((item, idx) => (
                <span
                  key={item.id || idx}
                  className="inline-flex items-center gap-1 bg-slate-800/90 border border-slate-700/90 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                >
                  <span className="font-bold text-white">{item.category || item.name}</span>
                  <span className="text-amber-300 font-mono text-[9px] bg-slate-900 px-1 rounded">Sz {item.size}</span>
                  <span className="text-emerald-400 font-mono font-bold">₹{item.unit_price}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                <span>{shoeCategory}</span>
                <span className="text-amber-300 font-mono text-[9px]">Sz {shoeSize}</span>
                <span className="text-emerald-400 font-mono">₹{activeSubtotal}</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Center Content - Tight Spacing without dead space */}
        <div className="flex-1 flex flex-col justify-start space-y-2 overflow-y-auto no-scrollbar py-1">
          {/* Quick 1-Tap Payment Mode Presets */}
          <div className="grid grid-cols-3 gap-1.5 flex-shrink-0">
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

          {/* Cash & Online Direct Inputs - Compact & Clean */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs space-y-2 flex-shrink-0">
            {/* Cash Input Box */}
            <div className="flex items-center justify-between space-x-2 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80">
              <div className="flex items-center space-x-2 min-w-0">
                <Banknote className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-emerald-950">Cash Received</p>
                  <p className="text-[9px] text-emerald-700">Cash in drawer</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(e.target.value)}
                  placeholder="0"
                  className="w-24 text-right px-2 py-1 bg-white border border-emerald-300 rounded-lg text-sm font-black text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Online UPI Input Box */}
            <div className="flex items-center justify-between space-x-2 bg-indigo-50/70 p-2 rounded-lg border border-indigo-200/80">
              <div className="flex items-center space-x-2 min-w-0">
                <Smartphone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-indigo-950">Online / UPI</p>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <QrCode className="w-2.5 h-2.5" />
                    <span>Show Store QR</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={onlinePaid}
                  onChange={(e) => setOnlinePaid(e.target.value)}
                  placeholder="0"
                  className="w-24 text-right px-2 py-1 bg-white border border-indigo-300 rounded-lg text-sm font-black text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* AUTO-DISCOUNT OR DUE PROMPT (When Customer Pays Less) */}
          {unpaidDifference > 0 && discountAmount === 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 space-y-1.5 animate-in fade-in flex-shrink-0">
              <div className="flex justify-between items-center text-xs font-black text-amber-900">
                <span>⚠️ Remaining Amount: ₹{unpaidDifference}</span>
                <span className="text-[9px] font-bold bg-amber-200 px-1.5 py-0.5 rounded-full text-amber-900">Action Required</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyRemainingAsDiscount}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs text-center"
                >
                  🏷️ Give ₹{unpaidDifference} Discount
                </button>
                <button
                  type="button"
                  onClick={handleKeepRemainingAsDue}
                  className="py-2 px-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs text-center"
                >
                  ⏳ Keep ₹{unpaidDifference} as Due
                </button>
              </div>
            </div>
          )}

          {/* Discount Applied Badge */}
          {discountAmount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex justify-between items-center text-xs flex-shrink-0">
              <span className="font-bold text-emerald-900 text-xs">🏷️ Discount Applied: ₹{discountAmount} (Bill Settled)</span>
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
            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 space-y-2 animate-in fade-in flex-shrink-0">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <p className="text-xs font-black text-amber-950">
                  Customer Details Required for Udhaar (Due: ₹{dueAmount || unpaidDifference})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-black text-amber-900 uppercase block mb-0.5">
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
                    className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-amber-900 uppercase block mb-0.5">
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
                    className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Big Complete Sale Button - Compact & Fixed Bottom */}
        <div className="pt-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleCompleteSale(false)}
            disabled={isDueCustomerMissing || isProcessingSale || isSalesCreationBlocked}
            className={`w-full py-3.5 rounded-xl font-black text-base shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isSalesCreationBlocked
                ? 'bg-rose-500 text-white opacity-75 cursor-not-allowed'
                : isDueCustomerMissing || isProcessingSale
                ? 'bg-amber-400 text-amber-950 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/25'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {isSalesCreationBlocked
                ? `🔒 Sales Locked (${salesTimeCheck.startTime} - ${salesTimeCheck.endTime})`
                : isProcessingSale
                ? 'Processing Sale...'
                : isDueCustomerMissing
                ? '⚠️ Enter Customer Name & Phone for Udhaar'
                : `Complete Sale (₹${(activeSubtotal - discountAmount).toLocaleString('en-IN')})`}
            </span>
          </button>
        </div>

        {/* POPUP MODAL: DUPLICATE ORDER WARNING (Same Amount / Double-Click) */}
        {duplicateWarningSale && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border-2 border-amber-400 text-slate-900">
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 animate-pulse" />
                <h3 className="text-base font-black text-slate-900">Duplicate Order Warning</h3>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                <p className="font-bold text-amber-950">
                  An order with the exact same amount (<span className="text-sm font-black text-amber-900">₹{netPayable.toLocaleString('en-IN')}</span>) was just created {Math.max(1, Math.round((Date.now() - new Date(duplicateWarningSale.created_at).getTime()) / 1000))}s ago.
                </p>
                <p className="text-[11px] text-amber-800">
                  Receipt: <b>#{duplicateWarningSale.receipt_number}</b> • Customer: <b>{duplicateWarningSale.customer_name || 'Walk-in'}</b>
                </p>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to add this order again? (Avoid accidental double-tap).
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleCompleteSale(true)}
                  disabled={isProcessingSale}
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>{isProcessingSale ? 'Creating Order...' : 'Yes, Add Duplicate Order'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDuplicateWarningSale(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel Duplicate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live PhonePe & BHIM UPI Store QR Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-xs w-full p-4 sm:p-5 space-y-3 shadow-2xl text-center max-h-[90dvh] overflow-y-auto">
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
    <div className="h-[100dvh] max-h-[100dvh] bg-slate-950 text-white flex flex-col justify-between max-w-md mx-auto p-3 select-none overflow-hidden animate-in fade-in duration-150 font-sans">
      {/* Top Header Bar - Clean & Simple */}
      <div className="flex items-center justify-between pt-0.5 pb-1 flex-shrink-0">
        <Link
          to="/app/dashboard"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Exit</span>
        </Link>
        <span className="text-xs font-bold text-slate-400 font-mono">Counter POS</span>
      </div>

      {/* Store Sales Hours Alert Banner if restricted */}
      {salesTimeCheck.isRestricted && !salesTimeCheck.isWithinWindow && (
        <div
          className={`mx-1 my-1 p-2 rounded-2xl flex items-center justify-between text-xs font-bold border ${
            isAdmin
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {isAdmin
                ? `Sales Window: ${salesTimeCheck.startTime} - ${salesTimeCheck.endTime} (Admin Override Active)`
                : `Store Sales Closed (${salesTimeCheck.startTime} - ${salesTimeCheck.endTime})`}
            </span>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-white/10 flex-shrink-0 ml-2">
            {isAdmin ? 'Admin OK' : 'Locked'}
          </span>
        </div>
      )}

      {/* POS Big Display Screen - Clean & Minimal */}
      <div className="flex-1 flex flex-col justify-end text-right px-4 py-3 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-inner my-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-[11px] font-bold text-slate-400">
            {activeCustomer ? `Customer: ${activeCustomer.name}` : 'Walk-in Sale'}
          </span>
          <p className="tracking-wider truncate font-mono">
            {calcDisplay !== '0' ? calcDisplay : lineItems.length > 0 ? `${lineItems.length} item(s) in bill` : '0'}
          </p>
        </div>

        <div className="flex items-baseline justify-end space-x-2 my-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#ff7b00]">₹</span>
          <span className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white">
            {(lineItems.length > 0 ? activeSubtotal : currentCalcValue || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Selected Items Badges (Chips) */}
        {lineItems.length > 0 && (
          <div className="flex items-center justify-end space-x-1.5 overflow-x-auto py-1 no-scrollbar">
            {lineItems.map((it, idx) => (
              <div
                key={it.id}
                className="flex items-center space-x-1 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-200 flex-shrink-0"
              >
                <span>#{idx + 1} {it.category} (Sz {it.size}) ₹{it.unit_price}</span>
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

      {/* Tactile 4x5 Retail Keypad */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-1 flex-shrink-0">
        {/* Row 1: C, ⌫, %, ÷ */}
        <button
          type="button"
          onClick={() => handleKeypadPress('C')}
          className="h-12 sm:h-13 rounded-2xl font-black text-base bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-rose-500/20"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('BACKSPACE')}
          className="h-12 sm:h-13 rounded-2xl font-black text-base bg-slate-850 text-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('%')}
          className="h-12 sm:h-13 rounded-2xl font-black text-base bg-slate-850 text-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('÷')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, × */}
        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-slate-850 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeypadPress('×')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, - */}
        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-slate-850 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeypadPress('-')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
        >
          -
        </button>

        {/* Row 4: 1, 2, 3, + */}
        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeypadPress(n)}
            className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-slate-850 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeypadPress('+')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-orange-500/25"
          title="Add Item (+)"
        >
          +
        </button>

        {/* Row 5: 0, 00, ., = */}
        <button
          type="button"
          onClick={() => handleKeypadPress('0')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-slate-850 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('00')}
          className="h-12 sm:h-13 rounded-2xl font-black text-lg bg-slate-850 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('.')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-slate-850 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/5 shadow-xs"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('=')}
          className="h-12 sm:h-13 rounded-2xl font-black text-xl bg-[#ff6600] text-white hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/30"
        >
          =
        </button>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-1.5 pb-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={handleProceedToDetails}
          disabled={(activeSubtotal <= 0 && currentCalcValue <= 0) || isSalesCreationBlocked}
          className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-2xl font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <span>
            {isSalesCreationBlocked
              ? `🔒 Sales Locked (${salesTimeCheck.startTime} - ${salesTimeCheck.endTime})`
              : `Continue (${lineItems.length + (currentCalcValue > 0 ? 1 : 0)} Items • ₹${(
                  lineItems.reduce((sum, it) => sum + it.unit_price, 0) +
                  (currentCalcValue > 0 ? Math.round(currentCalcValue) : 0)
                ).toLocaleString('en-IN')})`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* MODAL: QUICK OUT OF STOCK DEMAND LOG */}
      <DemandLogModal
        isOpen={isDemandModalOpen}
        onClose={() => setIsDemandModalOpen(false)}
      />
    </div>
  );
};

export default CalculatorPOSPage;
