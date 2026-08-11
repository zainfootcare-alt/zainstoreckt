import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { ZainLogo } from '../../components/common/ZainLogo';
import {
  Truck,
  Plus,
  IndianRupee,
  Calendar,
  Send,
  Printer,
  CheckCircle2,
  FileText,
  AlertCircle,
  Building2,
  Search,
  Trash2,
  UserPlus,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import { VendorPayment, Vendor } from '../../types/database.types';

export const VendorIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    vendors,
    purchases,
    paymentAccounts,
    recordPurchase,
    recordVendorPayment,
    addVendor,
    deleteVendor,
    activeRole,
    organization,
  } = useShop();

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState<boolean>(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [deleteTargetVendor, setDeleteTargetVendor] = useState<Vendor | null>(null);

  // New Party Form State
  const [newPartyName, setNewPartyName] = useState<string>('');
  const [newBusinessName, setNewBusinessName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Leather Footwear');
  const [newContactPerson, setNewContactPerson] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newWhatsappPhone, setNewWhatsappPhone] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Kanpur');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newGstin, setNewGstin] = useState<string>('');
  const [newOpeningBalance, setNewOpeningBalance] = useState<number>(0);
  const [newWeeklyPaymentDay, setNewWeeklyPaymentDay] = useState<string>('Monday');
  const [newPaymentTerms, setNewPaymentTerms] = useState<number>(30);

  // New Purchase Form
  const [purVendorId, setPurVendorId] = useState<string>(vendors[0]?.id || '');
  const [purBillNo, setPurBillNo] = useState<string>('');
  const [purTotal, setPurTotal] = useState<number>(0);
  const [purPaidNow, setPurPaidNow] = useState<number>(0);
  const [purAccountId, setPurAccountId] = useState<string>(paymentAccounts[0]?.id || '');
  const [purNotes, setPurNotes] = useState<string>('');

  // Party Payment Form
  const [payVendorId, setPayVendorId] = useState<string>(vendors[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payAccountId, setPayAccountId] = useState<string>(paymentAccounts[0]?.id || '');
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [payNotes, setPayNotes] = useState<string>('');

  // Created Payment Receipt for WhatsApp share
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<VendorPayment | null>(null);

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.city && v.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.phone && v.phone.includes(searchQuery))
  );

  const selectedPayVendor = vendors.find((v) => v.id === payVendorId);

  // Handle Add New Party
  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName) return;

    addVendor({
      organization_id: organization?.id || 'org-footwear-101',
      name: newPartyName,
      business_name: newBusinessName || newPartyName,
      category: newCategory,
      contact_person: newContactPerson,
      phone: newPhone,
      whatsapp_phone: newWhatsappPhone || newPhone,
      city: newCity,
      address: newAddress,
      gstin: newGstin,
      opening_balance: newOpeningBalance,
      weekly_payment_day: newWeeklyPaymentDay,
      payment_terms: newPaymentTerms,
      status: 'Active',
    });

    setIsAddPartyModalOpen(false);
    // Reset Form
    setNewPartyName('');
    setNewBusinessName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewWhatsappPhone('');
    setNewAddress('');
    setNewGstin('');
    setNewOpeningBalance(0);
  };

  // Handle Delete Party
  const handleConfirmDelete = () => {
    if (!deleteTargetVendor) return;
    deleteVendor(deleteTargetVendor.id);
    setDeleteTargetVendor(null);
  };

  const handleCreatePurchase = () => {
    if (!purVendorId || purTotal <= 0 || !purBillNo) return;

    recordPurchase({
      vendor_id: purVendorId,
      bill_number: purBillNo,
      business_date: new Date().toISOString().split('T')[0],
      total: purTotal,
      amount_paid: purPaidNow,
      payment_account_id: purPaidNow > 0 ? purAccountId : undefined,
      notes: purNotes,
    });

    setIsPurchaseModalOpen(false);
    setPurBillNo('');
    setPurTotal(0);
    setPurPaidNow(0);
    setPurNotes('');
  };

  const handleCreatePartyPayment = () => {
    if (!payVendorId || payAmount <= 0) return;

    const receipt = recordVendorPayment({
      vendor_id: payVendorId,
      amount_paid: payAmount,
      payment_account_id: payAccountId,
      payment_method: payMethod,
      reference_notes: payNotes,
    });

    setLastPaymentReceipt(receipt);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    setPayAmount(0);
    setPayNotes('');
  };

  const handleShareWhatsApp = (receipt: VendorPayment) => {
    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR - PAYMENT RECEIPT*\nParty Name: ${receipt.vendor_name}\nDate: ${receipt.payment_date}\nAmount Paid: ₹${receipt.amount_paid.toLocaleString('en-IN')}\nPrevious Due: ₹${receipt.previous_outstanding.toLocaleString('en-IN')}\nRemaining Due: ₹${receipt.remaining_outstanding.toLocaleString('en-IN')}\nPayment Mode: ${receipt.payment_method}\n\nThank you.\nRegards,\nZain Footwear`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <PermissionGuard requiredPermission="vendors:view">
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* HEADER SECTION WITH QUICK ACTIONS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              Wholesaler & Supplier Management
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Parties & Ledgers Directory</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
              Manage supplier balances, party purchases, dues & weekly payment schedules
            </p>
          </div>

          {/* ACTION BUTTONS GRID (Clean 2x2 grid on mobile, flex row on desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto pt-1 lg:pt-0">
            <button
              onClick={() => setIsAddPartyModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>Add New Party</span>
            </button>

            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <Plus className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>Record Purchase</span>
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <IndianRupee className="w-4 h-4 flex-shrink-0" />
              <span>Pay Supplier</span>
            </button>

            <button
              onClick={() => navigate('/app/vendors/weekly-payments')}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Weekly Planner</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR & DIRECTORY TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search party by name, city, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total Parties: <span className="text-slate-900">{filteredVendors.length}</span>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (For Mobile Phones) */}
          <div className="block md:hidden space-y-3">
            {filteredVendors.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-bold text-xs">
                No parties found. Click <span className="text-[#ff6600] font-black">+ Add New Party</span> to add a wholesaler.
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <div key={vendor.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{vendor.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{vendor.city || 'N/A'} • {vendor.category || 'General'}</p>
                    </div>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                      ₹{vendor.current_balance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="font-bold text-orange-600">Pay Day: {vendor.weekly_payment_day}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/app/vendors/${vendor.id}`)}
                        className="px-3 py-1.5 bg-slate-900 text-white font-extrabold rounded-xl text-[10px]"
                      >
                        360° Ledger
                      </button>
                      <button
                        onClick={() => setDeleteTargetVendor(vendor)}
                        className="p-1.5 text-rose-600 bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE OF PARTIES */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Weekly Pay Day</th>
                  <th className="py-3 px-4 text-right">Current Outstanding</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      No parties found. Click <span className="text-[#ff6600] font-black">+ Add New Party</span> to add a wholesaler.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{vendor.name}</div>
                        {vendor.business_name && (
                          <div className="text-[10px] text-slate-400 font-normal">{vendor.business_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{vendor.city || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {vendor.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-orange-600">{vendor.weekly_payment_day}</td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-600 text-sm">
                        ₹{vendor.current_balance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/app/vendors/${vendor.id}`)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-[11px] transition-colors"
                        >
                          View 360° Ledger
                        </button>

                        <button
                          onClick={() => setDeleteTargetVendor(vendor)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                          title="Delete Party"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: ADD NEW PARTY MODAL (Available to Salesman / Cashier, Manager, Finance, Admin) */}
        {isAddPartyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-[#ff6600]" />
                  <h3 className="font-extrabold text-slate-900 text-base">Add New Party / Supplier</h3>
                </div>
                <button onClick={() => setIsAddPartyModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateParty} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Party Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABC Wholesale Footwear"
                      value={newPartyName}
                      onChange={(e) => setNewPartyName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Business / Firm Name</label>
                    <input
                      type="text"
                      placeholder="e.g. ABC Footwear Syndicate"
                      value={newBusinessName}
                      onChange={(e) => setNewBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Supply Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="Leather Footwear">Leather Footwear</option>
                      <option value="Sports Shoes">Sports Shoes</option>
                      <option value="Casual & Sandals">Casual & Sandals</option>
                      <option value="Packaging & Boxes">Packaging & Boxes</option>
                      <option value="Shoe Care & Accessories">Shoe Care & Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={newContactPerson}
                      onChange={(e) => setNewContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Mobile Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98000 11223"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-800">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="+91 98000 11223"
                      value={newWhatsappPhone}
                      onChange={(e) => setNewWhatsappPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-800">City / Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kanpur, Agra, Delhi"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-800">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="27AAAAA0000A1Z5"
                      value={newGstin}
                      onChange={(e) => setNewGstin(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Opening Balance Due (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newOpeningBalance}
                      onChange={(e) => setNewOpeningBalance(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-800">Weekly Payment Day</label>
                    <select
                      value={newWeeklyPaymentDay}
                      onChange={(e) => setNewWeeklyPaymentDay(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all mt-4"
                >
                  SAVE NEW PARTY SUPPLIER
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: RECORD PARTY PURCHASE MODAL */}
        {isPurchaseModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Record Party Purchase Bill</h3>
                <button onClick={() => setIsPurchaseModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 font-bold">Select Party / Supplier</label>
                  <select
                    value={purVendorId}
                    onChange={(e) => setPurVendorId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Current Due: ₹{v.current_balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold">Supplier Invoice / Bill Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-99021"
                    value={purBillNo}
                    onChange={(e) => setPurBillNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Total Bill Amount (₹) *</label>
                  <input
                    type="number"
                    value={purTotal}
                    onChange={(e) => setPurTotal(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Amount Paid Now (₹)</label>
                  <input
                    type="number"
                    value={purPaidNow}
                    onChange={(e) => setPurPaidNow(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
                  />
                </div>

                {purPaidNow > 0 && (
                  <div>
                    <label className="block mb-1 font-bold">Paid From Account</label>
                    <select
                      value={purAccountId}
                      onChange={(e) => setPurAccountId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      {paymentAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Bal: ₹{a.current_balance.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handleCreatePurchase}
                disabled={!purVendorId || purTotal <= 0 || !purBillNo}
                className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 disabled:bg-slate-300 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all mt-2"
              >
                RECORD PURCHASE BILL
              </button>
            </div>
          </div>
        )}

        {/* MODAL 3: PAY PARTY / SUPPLIER */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Record Party Payment</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 font-bold">Select Party</label>
                  <select
                    value={payVendorId}
                    onChange={(e) => setPayVendorId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Outstanding Due: ₹{v.current_balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPayVendor && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 flex justify-between">
                    <span>Current Outstanding Due:</span>
                    <span>₹{selectedPayVendor.current_balance.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-bold">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Pay From Account</label>
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {paymentAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Bal: ₹{a.current_balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreatePartyPayment}
                disabled={!payVendorId || payAmount <= 0}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all mt-2"
              >
                RECORD PAYMENT & GENERATE RECEIPT
              </button>
            </div>
          </div>
        )}

        {/* MODAL 4: DELETE PARTY CONFIRMATION MODAL */}
        {deleteTargetVendor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Delete Party Record?</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{deleteTargetVendor.name}</span>?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetVendor(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors"
                >
                  Delete Party
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: PARTY PAYMENT RECEIPT + WHATSAPP SHARE */}
        {isReceiptModalOpen && lastPaymentReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center">
              <ZainLogo size="md" showText={true} className="justify-center" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Party Payment Confirmation Receipt</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 font-medium text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Party Name:</span>
                  <span className="font-bold text-slate-900">{lastPaymentReceipt.vendor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-bold text-slate-900">{lastPaymentReceipt.payment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Previous Outstanding:</span>
                  <span className="font-bold text-slate-900">₹{lastPaymentReceipt.previous_outstanding.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-orange-600 font-extrabold text-sm">
                  <span>Payment Made:</span>
                  <span>₹{lastPaymentReceipt.amount_paid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-extrabold pt-2 border-t border-slate-200">
                  <span>Remaining Outstanding:</span>
                  <span>₹{lastPaymentReceipt.remaining_outstanding.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Method:</span>
                  <span>{lastPaymentReceipt.payment_method}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>

                <button
                  onClick={() => handleShareWhatsApp(lastPaymentReceipt)}
                  className="col-span-2 py-3 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" /> Share on WhatsApp
                </button>
              </div>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};
