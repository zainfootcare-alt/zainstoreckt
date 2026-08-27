import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Search,
  Plus,
  ArrowRight,
  Phone,
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  Receipt,
  FileText,
  Upload,
  Clock,
  Send,
  Sparkles,
  DollarSign,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Vendor, Customer } from '../../types/database.types';

export const PartiesListPage: React.FC = () => {
  const {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    purchases,
    recordPurchase,
    recordVendorPayment,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    userProfile,
    activeRole,
  } = useShop();

  const navigate = useNavigate();
  const isAdmin = activeRole === 'ADMIN' || activeRole === 'MANAGER';

  // Active Sub-tab: 'SUPPLIERS' (Maal Kharid) or 'CUSTOMERS' (Grahak Udhaar)
  const [activeTab, setActiveTab] = useState<'SUPPLIERS' | 'CUSTOMERS'>('SUPPLIERS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState<boolean>(false);
  const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState<boolean>(false);
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<Vendor | null>(null);

  const [isStockInModalOpen, setIsStockInModalOpen] = useState<boolean>(false);
  const [isPayVendorModalOpen, setIsPayVendorModalOpen] = useState<boolean>(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<Vendor | null>(null);

  // New Vendor Form State
  const [vendorName, setVendorName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>('');
  const [vendorCity, setVendorCity] = useState<string>('Agra');
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [customCityInput, setCustomCityInput] = useState<string>('');

  const [vendorCategory, setVendorCategory] = useState<string>('Leather Formal Shoes');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

  const [weeklyPayoutDay, setWeeklyPayoutDay] = useState<string>('Friday');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [vendorNotes, setVendorNotes] = useState<string>('');

  // Edit Vendor Form State
  const [editVendorName, setEditVendorName] = useState<string>('');
  const [editContactPerson, setEditContactPerson] = useState<string>('');
  const [editVendorPhone, setEditVendorPhone] = useState<string>('');
  const [editVendorCity, setEditVendorCity] = useState<string>('');
  const [editVendorCategory, setEditVendorCategory] = useState<string>('');
  const [editWeeklyPayoutDay, setEditWeeklyPayoutDay] = useState<string>('Friday');
  const [editDueBalance, setEditDueBalance] = useState<string>('0');

  // Customer Udhaar Modals & States
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustDue, setNewCustDue] = useState<string>('0');

  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState<boolean>(false);
  const [selectedCustForEdit, setSelectedCustForEdit] = useState<Customer | null>(null);
  const [editCustName, setEditCustName] = useState<string>('');
  const [editCustPhone, setEditCustPhone] = useState<string>('');
  const [editCustDue, setEditCustDue] = useState<string>('0');

  // Stock In / Purchase Form State
  const [stockVendorId, setStockVendorId] = useState<string>('');
  const [billNumber, setBillNumber] = useState<string>(`INV-${Date.now().toString().slice(-4)}`);
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billTotal, setBillTotal] = useState<string>('');
  const [billPaidNow, setBillPaidNow] = useState<string>('0');
  const [stockNotes, setStockNotes] = useState<string>('');
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);

  // Pay Vendor Form State
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [paymentNote, setPaymentNote] = useState<string>('');

  // Preset Footwear Supplier Categories
  const PRESET_CATEGORIES = [
    'Leather Formal Shoes',
    'Sports & Running Shoes',
    'Casual Sneakers & Loafers',
    'Daily Slippers & Chappal',
    'Sandals & Heels',
    'School Shoes & Boots',
    'Soles, Raw Materials & Accessories',
  ];

  // Major Footwear Production Hub Cities
  const PRESET_CITIES = ['Agra', 'Kanpur', 'Delhi NCR', 'Mumbai', 'Jaipur', 'Chennai', 'Kolkata', 'Hathras', 'Unnao'];

  // Filtered Lists
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.contact_person && v.contact_person.toLowerCase().includes(q)) ||
      (v.city && v.city.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q)) ||
      (v.category && v.category.toLowerCase().includes(q))
    );
  });

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  // Calculate Aggregates
  const totalSupplierDue = vendors.reduce((sum, v) => sum + (v.current_balance || 0), 0);
  const totalCustomerDue = customers.reduce((sum, c) => sum + Math.max(0, c.current_balance || 0), 0);

  // Handle Add New Supplier Party
  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const resolvedCity = isCustomCity ? customCityInput.trim() || 'Other' : vendorCity;
    const resolvedCategory = isCustomCategory ? customCategoryInput.trim() || 'General Footwear' : vendorCategory;
    const opBal = parseFloat(openingBalance) || 0;

    addVendor({
      organization_id: 'org-footwear-101',
      name: vendorName.trim(),
      contact_person: contactPerson.trim() || undefined,
      phone: vendorPhone.trim() || undefined,
      city: resolvedCity,
      category: resolvedCategory,
      weekly_payment_day: weeklyPayoutDay,
      opening_balance: opBal,
      credit_limit: 500000,
      payment_terms: 7,
      status: 'Active',
      notes: vendorNotes.trim() || undefined,
    });

    setIsAddVendorModalOpen(false);
    setVendorName('');
    setContactPerson('');
    setVendorPhone('');
    setVendorCity('Agra');
    setIsCustomCity(false);
    setCustomCityInput('');
    setVendorCategory('Leather Formal Shoes');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setOpeningBalance('0');
    setVendorNotes('');
  };

  // Open Edit Vendor Modal
  const handleOpenEditVendor = (v: Vendor) => {
    setSelectedVendorForEdit(v);
    setEditVendorName(v.name);
    setEditContactPerson(v.contact_person || '');
    setEditVendorPhone(v.phone || '');
    setEditVendorCity(v.city || 'Agra');
    setEditVendorCategory(v.category || 'Leather Formal Shoes');
    setEditWeeklyPayoutDay(v.weekly_payment_day || 'Friday');
    setEditDueBalance((v.current_balance || 0).toString());
    setIsEditVendorModalOpen(true);
  };

  // Handle Save Edit Vendor
  const handleSaveEditVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForEdit || !editVendorName.trim()) return;

    updateVendor(selectedVendorForEdit.id, {
      name: editVendorName.trim(),
      contact_person: editContactPerson.trim() || undefined,
      phone: editVendorPhone.trim() || undefined,
      city: editVendorCity.trim() || 'Agra',
      category: editVendorCategory.trim() || 'General Footwear',
      weekly_payment_day: editWeeklyPayoutDay,
      current_balance: parseFloat(editDueBalance) || 0,
    });

    setIsEditVendorModalOpen(false);
    setSelectedVendorForEdit(null);
  };

  // Handle Delete Vendor
  const handleDeleteVendor = (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to delete supplier "${vendor.name}"? This action cannot be undone.`)) {
      deleteVendor(vendor.id);
    }
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (c: Customer) => {
    setSelectedCustForEdit(c);
    setEditCustName(c.name);
    setEditCustPhone(c.phone || '');
    setEditCustDue((c.current_balance || 0).toString());
    setIsEditCustomerModalOpen(true);
  };

  // Handle Save Edit Customer
  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForEdit || !editCustName.trim()) return;

    updateCustomer(selectedCustForEdit.id, {
      name: editCustName.trim(),
      phone: editCustPhone.trim() || 'N/A',
      current_balance: parseFloat(editCustDue) || 0,
    });

    setIsEditCustomerModalOpen(false);
    setSelectedCustForEdit(null);
  };

  // Handle Delete Customer
  const handleDeleteCustomer = (c: Customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${c.name}" and their khata?`)) {
      deleteCustomer(c.id);
    }
  };

  // Handle File / Invoice Upload
  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoicePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Record Stock In / Purchase
  const handleRecordStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseFloat(billTotal);
    if (!stockVendorId || isNaN(totalNum) || totalNum <= 0) {
      alert('Please select a supplier party and enter a valid bill amount.');
      return;
    }

    const paidNum = parseFloat(billPaidNow) || 0;

    recordPurchase({
      vendor_id: stockVendorId,
      bill_number: billNumber || `BILL-${Date.now().toString().slice(-4)}`,
      business_date: billDate,
      total: totalNum,
      amount_paid: paidNum,
      invoice_attachment_path: invoicePreview || undefined,
      notes: stockNotes.trim() || undefined,
    });

    setIsStockInModalOpen(false);
    setStockVendorId('');
    setBillTotal('');
    setBillPaidNow('0');
    setStockNotes('');
    setInvoicePreview(null);
  };

  // Handle Pay Supplier & WhatsApp Receipt
  const handlePayVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPayment) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    recordVendorPayment({
      vendor_id: selectedVendorForPayment.id,
      amount_paid: amt,
      payment_account_id: 'acc-bank-04',
      payment_method: paymentMethod,
      reference_notes: paymentNote || `Weekly payment on ${new Date().toLocaleDateString('en-IN')}`,
    });

    // Generate WhatsApp Link
    const remainingDue = (selectedVendorForPayment.current_balance || 0) - amt;
    const cleanPhone = (selectedVendorForPayment.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const msg = `*Payment Confirmation - Zain Footwear*\n\nDear ${selectedVendorForPayment.name},\nWe have transferred ₹${amt.toLocaleString('en-IN')} via ${paymentMethod}.\n\n*Previous Balance:* ₹${(selectedVendorForPayment.current_balance || 0).toLocaleString('en-IN')}\n*Amount Paid Now:* ₹${amt.toLocaleString('en-IN')}\n*Remaining Balance Due:* ₹${Math.max(0, remainingDue).toLocaleString('en-IN')}\n\nThank you for the partnership!\n- Zain Footwear (Management)`;

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;

    setIsPayVendorModalOpen(false);
    setPaymentAmount('');
    setPaymentNote('');

    if (cleanPhone.length >= 10) {
      window.open(whatsappUrl, '_blank');
    }
  };

  // Generate Direct WhatsApp URL for a Vendor
  const getSupplierWhatsAppUrl = (vendor: Vendor) => {
    const cleanPhone = (vendor.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hello ${vendor.name} (${vendor.city || 'Supplier'}),\nThis is regarding our footwear orders with Zain Footwear.\nCurrent Account Balance: ₹${(vendor.current_balance || 0).toLocaleString('en-IN')}.\nWeekly Settlement Day: ${vendor.weekly_payment_day || 'Friday'}.\n\n- Zain Footwear`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 font-sans">
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#ff6600] flex-shrink-0" />
            <span className="truncate">Parties & Khatabook</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Footwear Wholesale Suppliers & Retail Customer Udhaar
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {activeTab === 'SUPPLIERS' ? (
            <>
              <button
                type="button"
                onClick={() => setIsStockInModalOpen(true)}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Package className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>Maal In</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddVendorModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span>Add Party</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-3.5 py-2.5 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DUAL SEGMENT TOGGLE TABS (Clean & Minimal) */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:max-w-md border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'SUPPLIERS'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className={`w-4 h-4 flex-shrink-0 ${activeTab === 'SUPPLIERS' ? 'text-orange-600' : 'text-slate-400'}`} />
          <span className="truncate">Suppliers / Maal Kharid ({vendors.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'CUSTOMERS'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className={`w-4 h-4 flex-shrink-0 ${activeTab === 'CUSTOMERS' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className="truncate">Customer Udhaar ({customers.length})</span>
        </button>
      </div>

      {/* 3. SUMMARY STATS BANNER */}
      {activeTab === 'SUPPLIERS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Supplier Dues (Payable)</p>
            <p className="text-2xl font-black text-rose-700 mt-1 font-mono">
              ₹{totalSupplierDue.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Across {vendors.length} supplier parties</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Parties</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{vendors.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Agra, Kanpur & custom hubs</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purchases Recorded</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{purchases.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">With attached bills & invoices</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customer Udhaar (Receivable)</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              ₹{totalCustomerDue.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">From retail POS footwear sales</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Due Customers</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{customers.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Admin can edit / delete customer records</p>
          </div>
        </div>
      )}

      {/* 4. SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'SUPPLIERS'
              ? 'Search supplier by party name, city, category or phone...'
              : 'Search retail customer by name or phone...'
          }
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-2xs"
        />
      </div>

      {/* 5. SUPPLIERS LIST VIEW */}
      {activeTab === 'SUPPLIERS' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Footwear Suppliers Found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Add wholesale footwear parties to track stock and weekly dues.
              </p>
              <button
                onClick={() => setIsAddVendorModalOpen(true)}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supplier Party</span>
              </button>
            </div>
          ) : (
            filteredVendors.map((vendor) => {
              const due = vendor.current_balance || 0;
              const hasDue = due > 0;

              return (
                <div
                  key={vendor.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-700 border border-orange-200 font-black text-sm flex items-center justify-center flex-shrink-0">
                      {vendor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-black text-slate-900 truncate">{vendor.name}</p>
                        {vendor.city && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            📍 {vendor.city}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {vendor.contact_person && (
                          <span className="font-medium">Contact: {vendor.contact_person}</span>
                        )}
                        {vendor.phone && (
                          <span className="font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{vendor.phone}</span>
                          </span>
                        )}
                        {vendor.category && (
                          <span className="text-orange-700 font-bold bg-orange-50/60 px-2 py-0.5 rounded-md text-[10px]">
                            {vendor.category}
                          </span>
                        )}
                      </div>

                      {vendor.weekly_payment_day && (
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Weekly Settlement: <strong>{vendor.weekly_payment_day}</strong></span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Balance Due</p>
                      <p className={`text-base sm:text-lg font-black font-mono ${hasDue ? 'text-rose-700' : 'text-emerald-700'}`}>
                        ₹{due.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedVendorForPayment(vendor);
                          setPaymentAmount(due > 0 ? due.toString() : '');
                          setIsPayVendorModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>

                      {vendor.phone && (
                        <a
                          href={getSupplierWhatsAppUrl(vendor)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors"
                          title="WhatsApp Supplier"
                        >
                          <Send className="w-4 h-4" />
                        </a>
                      )}

                      {/* Admin Edit & Delete */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditVendor(vendor)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                            title="Edit Party Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Delete Party"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 6. CUSTOMER UDHAAR LIST VIEW */}
      {activeTab === 'CUSTOMERS' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Retail Customer Dues</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Customer udhaar generated from the POS Calculator will automatically appear here.
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => {
              const bal = customer.current_balance || 0;

              return (
                <div
                  key={customer.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div
                    onClick={() => navigate(`/app/parties/${customer.id}`)}
                    className="flex items-center space-x-3 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center flex-shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{customer.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{customer.phone || 'No phone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <p className="text-xs sm:text-sm font-black text-emerald-700 font-mono">
                        ₹{bal.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600 block">Due Receivable</span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditCustomer(customer)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/app/parties/${customer.id}`)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW SUPPLIER PARTY (WITH MANUAL CITY & CUSTOM CATEGORY) */}
      {/* ========================================================================= */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#ff6600]" />
                <span>Add Footwear Supplier Party</span>
              </h3>
              <button
                onClick={() => setIsAddVendorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Party / Firm Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agra Royal Leather Shoes"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Mohd Tariq"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="10-digit Phone"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* MANUAL / CUSTOM CITY SELECTION */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-black text-slate-800 uppercase">Production Hub / City</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCity(!isCustomCity)}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    {isCustomCity ? '← Choose Preset City' : '+ Enter Custom City Manually'}
                  </button>
                </div>

                {isCustomCity ? (
                  <input
                    type="text"
                    required
                    placeholder="Type city name (e.g. Hathras, Ambur, Jalandhar)..."
                    value={customCityInput}
                    onChange={(e) => setCustomCityInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-orange-400 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                ) : (
                  <select
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {PRESET_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* MANUAL / CUSTOM CATEGORY SELECTION */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-black text-slate-800 uppercase">Footwear Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    {isCustomCategory ? '← Choose Preset Category' : '+ Add Custom Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    required
                    placeholder="Type custom category (e.g. EVA Sliders, Kids LED Shoes)..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-orange-400 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                ) : (
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Weekly Settlement Day</label>
                  <select
                    value={weeklyPayoutDay}
                    onChange={(e) => setWeeklyPayoutDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>
                        Every {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Opening Balance Due (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-xl font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Supplier Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN EDIT SUPPLIER PARTY */}
      {/* ========================================================================= */}
      {isEditVendorModalOpen && selectedVendorForEdit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-500" />
                <span>Edit Supplier Party Details</span>
              </h3>
              <button
                onClick={() => setIsEditVendorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Party / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={editVendorName}
                  onChange={(e) => setEditVendorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editVendorPhone}
                    onChange={(e) => setEditVendorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">City / Production Hub</label>
                  <input
                    type="text"
                    value={editVendorCity}
                    onChange={(e) => setEditVendorCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Category Supplied</label>
                  <input
                    type="text"
                    value={editVendorCategory}
                    onChange={(e) => setEditVendorCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Weekly Settlement Day</label>
                  <select
                    value={editWeeklyPayoutDay}
                    onChange={(e) => setEditWeeklyPayoutDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>
                        Every {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Current Balance Due (₹)</label>
                  <input
                    type="number"
                    value={editDueBalance}
                    onChange={(e) => setEditDueBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-rose-400 rounded-xl font-mono font-black text-rose-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN EDIT CUSTOMER KHATA */}
      {/* ========================================================================= */}
      {isEditCustomerModalOpen && selectedCustForEdit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                <span>Edit Customer Khata</span>
              </h3>
              <button
                onClick={() => setIsEditCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editCustPhone}
                  onChange={(e) => setEditCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Outstanding Due Amount (₹)</label>
                <input
                  type="number"
                  value={editCustDue}
                  onChange={(e) => setEditCustDue(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-emerald-400 rounded-xl font-mono font-black text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm shadow-md cursor-pointer"
                >
                  Update Customer Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STOCK IN / PURCHASE WITH ATTACH INVOICE */}
      {/* ========================================================================= */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                <span>Record Maal / Stock In (Purchase Bill)</span>
              </h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordStockIn} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Select Supplier Party *</label>
                <select
                  required
                  value={stockVendorId}
                  onChange={(e) => setStockVendorId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="">-- Choose Supplier Party --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city || 'Hub'}) - Due: ₹{v.current_balance || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Bill / Invoice Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-8812"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Total Bill Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    value={billTotal}
                    onChange={(e) => setBillTotal(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-orange-400 rounded-xl font-mono font-black text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Paid Now (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={billPaidNow}
                    onChange={(e) => setBillPaidNow(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* ATTACH INVOICE (Bill Photo / File) */}
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3.5 text-center space-y-2">
                <label className="font-black text-slate-800 uppercase block text-[11px]">
                  📷 Attach Invoice / Bill Photo
                </label>
                {invoicePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={invoicePreview}
                      alt="Invoice Preview"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-300 shadow-sm mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setInvoicePreview(null)}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
                      <span>Upload Bill Photo / PDF</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleInvoiceUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Stock Details / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 20 cartons men formal shoes size 7-10"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Stock In & Update Party Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAY SUPPLIER & SEND WHATSAPP RECEIPT */}
      {/* ========================================================================= */}
      {isPayVendorModalOpen && selectedVendorForPayment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Record Payment to Party</h3>
                <p className="text-xs text-slate-500">{selectedVendorForPayment.name}</p>
              </div>
              <button
                onClick={() => setIsPayVendorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-200 flex justify-between items-center text-xs">
              <span className="font-bold text-orange-950">Current Outstanding Due:</span>
              <span className="font-mono font-black text-base text-rose-700">
                ₹{(selectedVendorForPayment.current_balance || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handlePayVendorSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Amount Paying Now (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-emerald-400 rounded-xl font-mono font-black text-slate-900 text-base focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Bank Transfer', 'UPI / GPay', 'Cash'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Reference / Transaction Note</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly settlement via NEFT/IMPS"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirm Payment & Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOMER UDHAAR */}
      {/* ========================================================================= */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Add Customer for Udhaar</h3>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustName.trim()) return;
                const dueNum = parseFloat(newCustDue) || 0;
                addCustomer({
                  organization_id: 'org-footwear-101',
                  name: newCustName.trim(),
                  phone: newCustPhone.trim() || 'N/A',
                  opening_balance: dueNum,
                  current_balance: dueNum,
                  total_purchases_count: 1,
                  total_spent: dueNum,
                });
                setIsAddCustomerModalOpen(false);
                setNewCustName('');
                setNewCustPhone('');
                setNewCustDue('0');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Bhai"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Phone Number (for WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="10-digit Mobile"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Initial Due Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newCustDue}
                  onChange={(e) => setNewCustDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl font-black text-sm shadow-md cursor-pointer"
                >
                  Save Customer Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
