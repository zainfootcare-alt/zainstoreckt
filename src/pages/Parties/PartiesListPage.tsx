import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Phone,
  CheckCircle2,
  X,
  UserPlus,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Customer } from '../../types/database.types';

export const PartiesListPage: React.FC = () => {
  const { customers, addCustomer } = useShop();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState<boolean>(false);

  // New Party Form State
  const [newPartyName, setNewPartyName] = useState<string>('');
  const [newPartyPhone, setNewPartyPhone] = useState<string>('');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [balanceType, setBalanceType] = useState<'RECEIVE' | 'GIVE'>('RECEIVE');

  // Filter customers by search
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  // Calculate Total Receivable & Total Payable
  const totalReceivable = customers
    .filter((c) => (c.current_balance || 0) > 0)
    .reduce((sum, c) => sum + c.current_balance!, 0);

  const totalPayable = customers
    .filter((c) => (c.current_balance || 0) < 0)
    .reduce((sum, c) => sum + Math.abs(c.current_balance!), 0);

  const handleAddParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;

    const bal = parseFloat(openingBalance) || 0;
    const finalBal = balanceType === 'RECEIVE' ? bal : -bal;

    const created = addCustomer({
      organization_id: 'org-footwear-101',
      name: newPartyName.trim(),
      phone: newPartyPhone.trim() || 'N/A',
      opening_balance: finalBal,
      current_balance: finalBal,
      total_purchases_count: 0,
      total_spent: 0,
      last_purchase_date: new Date().toISOString(),
    });

    setIsAddPartyModalOpen(false);
    setNewPartyName('');
    setNewPartyPhone('');
    setOpeningBalance('0');
    navigate(`/app/parties/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* 1. TOP HEADER & ADD PARTY BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Parties & Customers</h1>
          <p className="text-xs font-semibold text-slate-500">Khatabook Ledger & Customer Outstanding</p>
        </div>

        <button
          onClick={() => setIsAddPartyModalOpen(true)}
          className="px-4 py-2.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Party</span>
        </button>
      </div>

      {/* 2. SUMMARY RIBBON (You Will Receive vs You Will Give) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">You will receive</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            ₹{totalReceivable.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">You will give</p>
          <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">
            ₹{totalPayable.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* 3. PROMINENT SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search customer by name or phone..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-2xs"
        />
      </div>

      {/* 4. PARTIES LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No parties found</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your first customer to start tracking credit, dues, and payments.
            </p>
            <button
              onClick={() => setIsAddPartyModalOpen(true)}
              className="px-4 py-2 bg-[#ff6600] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Party</span>
            </button>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const bal = customer.current_balance || 0;
            const isReceivable = bal > 0;
            const isPayable = bal < 0;
            const isSettled = bal === 0;

            return (
              <div
                key={customer.id}
                onClick={() => navigate(`/app/parties/${customer.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm flex items-center justify-center flex-shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{customer.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{customer.phone || 'No phone'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-3">
                  <div>
                    {isReceivable && (
                      <div>
                        <p className="text-xs sm:text-sm font-black text-emerald-700">
                          ₹{bal.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600 block">You will receive</span>
                      </div>
                    )}
                    {isPayable && (
                      <div>
                        <p className="text-xs sm:text-sm font-black text-rose-700">
                          ₹{Math.abs(bal).toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] font-bold text-rose-600 block">You will give</span>
                      </div>
                    )}
                    {isSettled && (
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-500">₹0</p>
                        <span className="text-[10px] font-bold text-slate-400 block">Settled</span>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. ADD PARTY MODAL */}
      {isAddPartyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add New Party</h3>
                <p className="text-xs text-slate-500 font-medium">Create customer profile for ledger tracking</p>
              </div>
              <button
                onClick={() => setIsAddPartyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddParty} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Customer / Party Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 98200 12345"
                  value={newPartyPhone}
                  onChange={(e) => setNewPartyPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Opening Balance (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setBalanceType('RECEIVE')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border ${
                      balanceType === 'RECEIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    You will receive
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceType('GIVE')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border ${
                      balanceType === 'GIVE'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    You will give
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartyModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesListPage;
