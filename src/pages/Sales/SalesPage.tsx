import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { Customer, SaleRecord } from '../../types/database.types';
import {
  Footprints,
  Plus,
  IndianRupee,
  Search,
  Users,
  Send,
  Printer,
  ShoppingBag,
  CheckCircle2,
  Phone,
  MessageSquare,
  Calendar,
  Sparkles,
  UserPlus,
  Trash2,
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sales, customers, addCustomer, deleteCustomer, activeShop, userProfile } = useShop();

  const [activeTab, setActiveTab] = useState<'sales' | 'crm'>('sales');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Customer Modal State
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState<boolean>(false);
  const [custNameInput, setCustNameInput] = useState<string>('');
  const [custPhoneInput, setCustPhoneInput] = useState<string>('');
  const [custEmailInput, setCustEmailInput] = useState<string>('');
  const [custCityInput, setCustCityInput] = useState<string>('Mumbai');
  const [custNotesInput, setCustNotesInput] = useState<string>('');

  // Selected receipt for modal / details
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.receipt_number.toLowerCase().includes(q) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
      (s.customer_phone && s.customer_phone.includes(q)) ||
      s.created_by_name.toLowerCase().includes(q)
    );
  });

  // Filter Customers CRM Directory
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.city && c.city.toLowerCase().includes(q));
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custNameInput || !custPhoneInput) return;

    addCustomer({
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      name: custNameInput,
      phone: custPhoneInput,
      email: custEmailInput,
      city: custCityInput,
      notes: custNotesInput,
      total_purchases_count: 0,
      total_spent: 0,
      last_purchase_date: new Date().toISOString(),
    });

    setIsAddCustModalOpen(false);
    setCustNameInput('');
    setCustPhoneInput('');
    setCustEmailInput('');
    setCustNotesInput('');
  };

  const handleSendWhatsAppPromo = (customer: Customer) => {
    const text = encodeURIComponent(
      `Hi ${customer.name}! Greetings from Zain Footwear. We have new footwear stock & exclusive offers available for our valued customers. Visit us at ${activeShop?.name || 'Zain Footwear'}!`
    );
    let phoneStr = customer.phone.replace(/\D/g, '');
    if (phoneStr.length === 10) phoneStr = `91${phoneStr}`;

    window.open(`https://wa.me/${phoneStr || ''}?text=${text}`, '_blank');
  };

  const handleShareReceiptWhatsApp = (sale: SaleRecord) => {
    const text = encodeURIComponent(
      `*ZAIN FOOTWEAR RECEIPT*\nReceipt No: ${sale.receipt_number}\nStore: ${activeShop?.name || 'Main Store'}${
        sale.customer_name ? `\nCustomer: ${sale.customer_name}` : ''
      }\nTotal Paid: ₹${sale.total.toLocaleString('en-IN')}\nStatus: PAID\n\nThank you for shopping with Zain Footwear!`
    );

    let phoneStr = '';
    if (sale.customer_phone) {
      const digits = sale.customer_phone.replace(/\D/g, '');
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
    <PermissionGuard requiredPermission="sales:view">
      <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-[#ff6600]" /> Footwear Sales & Customer CRM Directory
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Complete register of POS counter sales receipts, customer database & WhatsApp contact directory
            </p>
          </div>

          {/* TAB BUTTONS & CTA */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeTab === 'sales' ? 'bg-white text-[#ff6600] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sales Receipts ({sales.length})
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'crm' ? 'bg-white text-[#ff6600] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Customer Database ({customers.length})
              </button>
            </div>

            <button
              onClick={() => navigate('/app/pos')}
              className="px-4 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <Footprints className="w-4 h-4" /> Open Calculator POS
            </button>
          </div>
        </div>

        {/* CRM SUMMARY STATS (When on CRM Tab) */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Saved Customers</span>
              <p className="text-2xl font-black text-slate-900">{customers.length} Profiles</p>
              <p className="text-[11px] text-slate-500 font-medium">Auto-captured from POS sales & checkouts</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Repeat Customer Rate</span>
              <p className="text-2xl font-black text-orange-600">
                {customers.filter((c) => c.total_purchases_count > 1).length} Loyal Repeaters
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Customers with 2+ sales transactions</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Customer Lifetime Value</span>
              <p className="text-2xl font-black text-emerald-700">
                ₹{customers.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Total sales revenue from stored customers</p>
            </div>
          </div>
        )}

        {/* SEARCH BAR & CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'sales' ? 'Search receipt #, customer name, phone...' : 'Search customer by name or WhatsApp phone...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {activeTab === 'crm' && (
            <button
              onClick={() => setIsAddCustModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-orange-400" /> Manually Add Customer
            </button>
          )}
        </div>

        {/* TAB 1: SALES RECEIPTS LEDGER */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] bg-slate-50/50">
                    <th className="py-3.5 px-5">Receipt #</th>
                    <th className="py-3.5 px-5">Date & Time</th>
                    <th className="py-3.5 px-5">Customer Profile</th>
                    <th className="py-3.5 px-5">Salesperson</th>
                    <th className="py-3.5 px-5">Payment Breakdown</th>
                    <th className="py-3.5 px-5 text-right">Total Amount</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-extrabold text-slate-900">
                        {sale.receipt_number}
                      </td>

                      <td className="py-4 px-5 text-slate-500 text-[11px]">
                        {new Date(sale.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{sale.customer_name || 'Walk-in Customer'}</div>
                        {sale.customer_phone && (
                          <div className="text-[11px] font-mono text-orange-600 font-bold">{sale.customer_phone}</div>
                        )}
                      </td>

                      <td className="py-4 px-5 font-semibold text-slate-700">{sale.created_by_name}</td>

                      <td className="py-4 px-5 text-[11px]">
                        <div className="space-y-0.5">
                          {sale.cash_amount > 0 && (
                            <span className="inline-block bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-extrabold mr-1">
                              Cash: ₹{sale.cash_amount.toLocaleString('en-IN')}
                            </span>
                          )}
                          {sale.online_amount > 0 && (
                            <span className="inline-block bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-extrabold">
                              Online: ₹{sale.online_amount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right font-black text-slate-900 text-sm">
                        ₹{sale.total.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleShareReceiptWhatsApp(sale)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 font-extrabold rounded-xl text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5 text-[#ff6600]" /> WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-3">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-slate-400">{sale.receipt_number}</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{sale.customer_name || 'Walk-in Customer'}</h4>
                      {sale.customer_phone && <p className="text-[11px] font-mono text-orange-600 font-bold">{sale.customer_phone}</p>}
                    </div>
                    <span className="text-base font-black text-[#ff6600]">
                      ₹{sale.total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">By: {sale.created_by_name}</span>
                    <button
                      onClick={() => handleShareReceiptWhatsApp(sale)}
                      className="px-3 py-1 bg-[#ff6600] text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER CRM DIRECTORY */}
        {activeTab === 'crm' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] bg-slate-50/50">
                    <th className="py-3.5 px-5">Customer Name</th>
                    <th className="py-3.5 px-5">WhatsApp / Phone</th>
                    <th className="py-3.5 px-5">City</th>
                    <th className="py-3.5 px-5 text-center">Total Orders</th>
                    <th className="py-3.5 px-5 text-right">Lifetime Spent (₹)</th>
                    <th className="py-3.5 px-5">Last Purchase</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 text-xs">{customer.name}</div>
                        {customer.email && <div className="text-[11px] text-slate-400">{customer.email}</div>}
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-orange-600">
                        {customer.phone}
                      </td>

                      <td className="py-4 px-5 text-slate-600">{customer.city || 'Mumbai'}</td>

                      <td className="py-4 px-5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-800">
                          {customer.total_purchases_count} Sales
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right font-black text-emerald-700 text-sm">
                        ₹{customer.total_spent.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-5 text-slate-500 text-[11px]">
                        {new Date(customer.last_purchase_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleSendWhatsAppPromo(customer)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" /> Promo SMS
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                          title="Delete Customer Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-3">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
                      <p className="text-[11px] font-mono text-orange-600 font-bold">{customer.phone}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-700">
                      ₹{customer.total_spent.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    <span>{customer.total_purchases_count} Orders</span>
                    <button
                      onClick={() => handleSendWhatsAppPromo(customer)}
                      className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Promo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: MANUALLY ADD CUSTOMER */}
        {isAddCustModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateCustomer}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Add Customer CRM Profile</h3>
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custNameInput}
                    onChange={(e) => setCustNameInput(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={custPhoneInput}
                    onChange={(e) => setCustPhoneInput(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={custEmailInput}
                      onChange={(e) => setCustEmailInput(e.target.value)}
                      placeholder="aarav@gmail.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={custCityInput}
                      onChange={(e) => setCustCityInput(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Notes / Preferences</label>
                  <input
                    type="text"
                    value={custNotesInput}
                    onChange={(e) => setCustNotesInput(e.target.value)}
                    placeholder="Prefers Formal Leather Shoes, Size UK 8"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-2xl text-xs shadow-md transition-all mt-2"
              >
                Save Customer Profile
              </button>
            </form>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default SalesPage;
