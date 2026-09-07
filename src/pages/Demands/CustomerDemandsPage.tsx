import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Flame,
  ShoppingBag,
  User,
  Trash2,
  Send,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CustomerDemand } from '../../types/database.types';
import { DemandLogModal } from '../../components/common/DemandLogModal';

export const CustomerDemandsPage: React.FC = () => {
  const { customerDemands, updateCustomerDemand, deleteCustomerDemand, activeShop, activeRole } = useShop();
  const isAdmin = activeRole === 'ADMIN';

  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'AGGREGATED' | 'INDIVIDUAL'>('AGGREGATED');

  // Filter Demands
  const filteredDemands = useMemo(() => {
    return customerDemands.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.item_name.toLowerCase().includes(q) ||
        d.customer_name.toLowerCase().includes(q) ||
        d.customer_phone.includes(q) ||
        (d.category && d.category.toLowerCase().includes(q)) ||
        (d.size && d.size.includes(q));

      const matchCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || d.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [customerDemands, searchQuery, selectedCategory, selectedStatus]);

  // Aggregated Demands Grouping (Group by normalized Item Name + Size + Category)
  const aggregatedDemands = useMemo(() => {
    const groups: Record<
      string,
      {
        key: string;
        item_name: string;
        category: string;
        size?: string;
        count: number;
        customers: Array<{
          id: string;
          name: string;
          phone: string;
          budget?: number;
          date: string;
          status: string;
          notes?: string;
        }>;
        latestDate: string;
      }
    > = {};

    filteredDemands.forEach((d) => {
      const normName = d.item_name.trim().toLowerCase();
      const normSize = d.size || 'Free Size';
      const key = `${normName}_${normSize}_${d.category}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          item_name: d.item_name,
          category: d.category,
          size: d.size,
          count: 0,
          customers: [],
          latestDate: d.created_at,
        };
      }

      groups[key].count += 1;
      groups[key].customers.push({
        id: d.id,
        name: d.customer_name,
        phone: d.customer_phone,
        budget: d.expected_budget,
        date: d.created_at,
        status: d.status,
        notes: d.notes,
      });

      if (new Date(d.created_at) > new Date(groups[key].latestDate)) {
        groups[key].latestDate = d.created_at;
      }
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [filteredDemands]);

  const pendingCount = customerDemands.filter((d) => d.status === 'PENDING').length;
  const fulfilledCount = customerDemands.filter((d) => d.status === 'FULFILLED' || d.status === 'STOCK_ARRIVED').length;

  // WhatsApp Stock Arrival Message Trigger
  const handleSendStockArrivedWhatsApp = (customer: { name: string; phone: string }, itemName: string, size?: string) => {
    const cleanPhone = (customer.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const msg = `*ZAIN FOOTWEAR - STOCK ARRIVAL UPDATE* 👟\n----------------------------------------\nNamaste *${customer.name}* ji! 🙏\n\nAapne hamare store se *${itemName}* ${size ? `(Size UK ${size})` : ''} manga tha jo out-of-stock tha.\n\n✨ *Yeh item ab hamari dukan par available ho gaya hai!* ✨\n\n📍 *Store:* ${activeShop?.name || 'Zain Footwear (Main Store)'}\n📞 *Contact:* ${activeShop?.phone || '+91 98200 12345'}\n----------------------------------------\nAap aakar apna pair collect kar sakte hain. Limited stock available! Visit us soon! 🛍️`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleStatusChange = async (demandId: string, newStatus: any) => {
    try {
      await updateCustomerDemand(demandId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteDemand = async (demandId: string) => {
    if (!window.confirm('Delete this customer demand record?')) return;
    try {
      await deleteCustomerDemand(demandId);
    } catch (err) {
      console.error('Failed to delete demand:', err);
    }
  };

  const CATEGORIES_LIST = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Sneakers', label: '👟 Sneakers' },
    { id: 'Formal', label: '👞 Formal' },
    { id: 'Sports', label: '🏃 Sports' },
    { id: 'Slippers', label: '🩴 Slippers' },
    { id: 'Sandals', label: '👡 Sandals' },
    { id: 'Boots', label: '🥾 Boots' },
    { id: 'Crocs', label: '🐊 Crocs' },
    { id: 'Kids', label: '🧒 Kids' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 font-sans text-slate-900">
      {/* 1. CLEAN HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Customer Demand Book
              </h1>
              <span className="text-[11px] font-extrabold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                {customerDemands.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              Out-of-stock shoe requests & instant WhatsApp stock arrival alerts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center justify-center space-x-1.5 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Log Customer Demand</span>
        </button>
      </div>

      {/* 2. MINIMAL 3-METRIC STATS STRIP */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
            {customerDemands.length}
          </p>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Stock</p>
          <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono mt-0.5">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Fulfilled</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
            {fulfilledCount}
          </p>
        </div>
      </div>

      {/* 3. SEARCH & CONTROLS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shoe name, size, customer or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('AGGREGATED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'AGGREGATED'
                  ? 'bg-white text-orange-700 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>By Demand Group</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('INDIVIDUAL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'INDIVIDUAL'
                  ? 'bg-white text-slate-900 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>All Records</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN DEMANDS LIST */}
      {viewMode === 'AGGREGATED' ? (
        /* =======================================================================
           VIEW 1: CLEAN GROUPED DEMANDS (Ranked by how many customers asked)
           ======================================================================= */
        <div className="space-y-3">
          {aggregatedDemands.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No customer demands recorded</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                When a customer asks for a shoe size or model not in stock, click "+ Log Customer Demand" above.
              </p>
            </div>
          ) : (
            aggregatedDemands.map((group, gIdx) => (
              <div
                key={group.key}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3"
              >
                {/* Demand Group Title Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                        gIdx === 0
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{gIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                        {group.item_name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                          {group.category}
                        </span>
                        {group.size && (
                          <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                            UK Size {group.size}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-full text-xs font-black flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    <span>{group.count} Customer{group.count === 1 ? '' : 's'} Waiting</span>
                  </span>
                </div>

                {/* Waiting Customers Sub-list */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Waiting Customers & WhatsApp Alert:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.customers.map((c) => (
                      <div
                        key={c.id}
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">{c.phone}</p>
                          {c.budget && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700">
                              Budget: ₹{c.budget}
                            </span>
                          )}
                          {c.notes && (
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">Note: {c.notes}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleSendStockArrivedWhatsApp(
                              { name: c.name, phone: c.phone },
                              group.item_name,
                              group.size
                            )
                          }
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs flex-shrink-0 cursor-pointer"
                          title="Send Stock Arrived WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* =======================================================================
           VIEW 2: INDIVIDUAL DEMAND RECORDS LIST
           ======================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {filteredDemands.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              No customer demands match the selected filters.
            </div>
          ) : (
            filteredDemands.map((demand) => (
              <div
                key={demand.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {demand.item_name}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {demand.category}
                    </span>
                    {demand.size && (
                      <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded font-mono">
                        UK {demand.size}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-slate-800">{demand.customer_name}</span>
                    <span>•</span>
                    <span className="font-mono">{demand.customer_phone}</span>
                    {demand.expected_budget && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold font-mono">
                          ₹{demand.expected_budget}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(demand.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {demand.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-100/60 p-1.5 rounded-md">
                      📝 {demand.notes}
                    </p>
                  )}
                </div>

                {/* Status Dropdown & Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                  <select
                    value={demand.status}
                    onChange={(e) => handleStatusChange(demand.id, e.target.value)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                      demand.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : demand.status === 'STOCK_ARRIVED'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : demand.status === 'FULFILLED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <option value="PENDING">⏳ Pending Stock</option>
                    <option value="STOCK_ARRIVED">✨ Stock Arrived</option>
                    <option value="FULFILLED">✅ Fulfilled / Sold</option>
                    <option value="CANCELLED">❌ Cancelled</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendStockArrivedWhatsApp(
                        { name: demand.customer_name, phone: demand.customer_phone },
                        demand.item_name,
                        demand.size
                      )
                    }
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs transition-colors cursor-pointer"
                    title="Send WhatsApp Stock Arrival Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDemand(demand.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Demand Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. MODAL: LOG NEW CUSTOMER DEMAND */}
      <DemandLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
};

export default CustomerDemandsPage;
