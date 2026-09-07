import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Sparkles,
  User,
  Phone,
  Tag,
  Footprints,
  IndianRupee,
  FileText,
  Check,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface DemandLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialItemName?: string;
}

export const DemandLogModal: React.FC<DemandLogModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'Sneakers',
  initialItemName = '',
}) => {
  const { addCustomerDemand, userProfile, activeShop } = useShop();

  const [itemName, setItemName] = useState<string>(initialItemName);
  const [category, setCategory] = useState<string>(initialCategory);
  const [size, setSize] = useState<string>('9');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const FOOTWEAR_CATEGORIES = [
    { id: 'Sneakers', label: '👟 Sneakers & Casuals' },
    { id: 'Formal', label: '👞 Formal Leather Shoes' },
    { id: 'Sports', label: '🏃 Sports & Running' },
    { id: 'Slippers', label: '🩴 Slippers & Chappal' },
    { id: 'Sandals', label: '👡 Sandals & Float' },
    { id: 'Boots', label: '🥾 Boots & High-Ankle' },
    { id: 'Crocs', label: '🐊 Clogs & Crocs' },
    { id: 'Kids', label: '🧒 Kids Footwear' },
    { id: 'Other', label: '📦 Other Specialty' },
  ];

  const SIZES = ['6', '7', '8', '9', '10', '11', '12', 'Free Size', '1', '2', '3', '4', '5'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !customerName.trim()) {
      alert('Please enter Item Name and Customer Name');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomerDemand({
        organization_id: activeShop?.organization_id || 'a1000000-0000-0000-0000-000000000001',
        shop_id: activeShop?.id || 'b2000000-0000-0000-0000-000000000002',
        item_name: itemName.trim(),
        category,
        size,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || 'N/A',
        expected_budget: budget ? parseFloat(budget) : undefined,
        notes: notes.trim() || undefined,
        status: 'PENDING',
        created_by_user_id: userProfile?.id,
        created_by_name: userProfile?.full_name || 'Staff',
      });

      setSuccessMsg(`Demand for "${itemName}" logged successfully!`);
      setTimeout(() => {
        setSuccessMsg(null);
        setItemName('');
        setCustomerName('');
        setCustomerPhone('');
        setBudget('');
        setNotes('');
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to save demand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-900">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Wishlist & Stock Demand</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Log Customer Demand
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Record items requested by customers that are currently out of stock.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Item Name / Style Requested */}
          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
              Shoe Name / Model / Brand Requested *
            </label>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Nike Dunk Low Panda, Brown Chelsea Boot"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Footwear Category */}
          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
              Footwear Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {FOOTWEAR_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shoe Size Selector */}
          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Footprints className="w-3 h-3 text-orange-600" />
              <span>Shoe Size (UK / India)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSize(sz)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    size === sz
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                WhatsApp / Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="tel"
                  placeholder="10-digit Mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Expected Budget & Notes */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                Expected Budget (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                Notes / Urgency
              </label>
              <input
                type="text"
                placeholder="e.g. White color only"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#ff6600] hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Saving Demand...' : 'Save Customer Demand'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemandLogModal;
