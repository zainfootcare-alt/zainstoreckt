import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  DollarSign,
  TrendingDown,
  Trash2,
  Edit,
  X,
  Coffee,
  Package,
  Truck,
  Zap,
  Building,
  Wrench,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Expense } from '../../types/database.types';

export const ExpensesListPage: React.FC = () => {
  const { expenses, recordExpense, updateExpense, deleteExpense, activeRole, userProfile } = useShop();
  const navigate = useNavigate();
  const isAdmin = activeRole === 'ADMIN' || activeRole === 'MANAGER';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Add Expense Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [expTitle, setExpTitle] = useState<string>('');
  const [expCategory, setExpCategory] = useState<string>('Tea & Refreshment');
  const [isCustomCat, setIsCustomCat] = useState<boolean>(false);
  const [customCatInput, setCustomCatInput] = useState<string>('');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'cash' | 'upi' | 'bank' | 'card'>('cash');
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState<string>('');

  // Edit Expense Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedExpForEdit, setSelectedExpForEdit] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'cash' | 'upi' | 'bank' | 'card'>('cash');
  const [editNotes, setEditNotes] = useState<string>('');

  // Preset Footwear Shop Expense Categories
  const PRESET_EXPENSE_CATS = [
    { label: 'Tea & Refreshment', icon: Coffee, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Bags & Shoe Packaging', icon: Package, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Transport / Freight', icon: Truck, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { label: 'Electricity & Bills', icon: Zap, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    { label: 'Shop Rent & Lease', icon: Building, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { label: 'Repairs & Maintenance', icon: Wrench, color: 'text-slate-700 bg-slate-100 border-slate-200' },
    { label: 'Staff Advance & Kharcha', icon: UserCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      e.title.toLowerCase().includes(q) ||
      e.category_name.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q));
    const matchesCat = categoryFilter === 'ALL' || e.category_name === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(expAmount);
    if (isNaN(amtNum) || amtNum <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const resolvedCat = isCustomCat ? customCatInput.trim() || 'General Expense' : expCategory;
    const resolvedTitle = expTitle.trim() || resolvedCat;

    await recordExpense({
      title: resolvedTitle,
      category_name: resolvedCat,
      amount: amtNum,
      payment_method: expPaymentMethod,
      business_date: expDate,
      status: 'PAID',
      notes: expNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
    setIsCustomCat(false);
    setCustomCatInput('');
  };

  const handleOpenEdit = (exp: Expense) => {
    setSelectedExpForEdit(exp);
    setEditTitle(exp.title);
    setEditCategory(exp.category_name);
    setEditAmount(exp.amount.toString());
    setEditPaymentMethod(exp.payment_method as any);
    setEditNotes(exp.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpForEdit) return;

    const amtNum = parseFloat(editAmount);
    if (isNaN(amtNum) || amtNum <= 0) return;

    updateExpense(selectedExpForEdit.id, {
      title: editTitle.trim() || editCategory,
      category_name: editCategory.trim(),
      amount: amtNum,
      payment_method: editPaymentMethod,
      notes: editNotes.trim() || undefined,
    });

    setIsEditModalOpen(false);
    setSelectedExpForEdit(null);
  };

  const handleDelete = (exp: Expense) => {
    if (window.confirm(`Are you sure you want to delete "${exp.title}" (₹${exp.amount})?`)) {
      deleteExpense(exp.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-600" />
            <span>Shop Expenses & Cash Outflow</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Daily petty cash, tea, electricity, shop rent, transport freight & repairs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center space-x-1.5 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* 2. SUMMARY TOTAL BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses Outflow</p>
          <p className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight mt-0.5 font-mono">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {filteredExpenses.length} expense record{filteredExpenses.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* 3. 1-TAP CATEGORY FILTER PILLS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex-shrink-0 ${
            categoryFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({expenses.length})
        </button>

        {PRESET_EXPENSE_CATS.map((c) => (
          <button
            key={c.label}
            onClick={() => setCategoryFilter(c.label)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
              categoryFilter === c.label
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 4. SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search expenses by title, category or notes..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-2xs"
        />
      </div>

      {/* 5. EXPENSE LIST VIEW */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Expenses Recorded</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Tap "+ Record Expense" to log daily shop expenses, tea, or transport bills.
            </p>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 font-bold flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{exp.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
                      {exp.category_name}
                    </span>
                    <span className="uppercase font-bold text-slate-400">• {exp.payment_method}</span>
                    <span>• {exp.business_date || exp.expense_date.split('T')[0]}</span>
                    {exp.notes && <span className="italic text-slate-400">({exp.notes})</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <p className="text-sm sm:text-base font-black text-rose-600 font-mono">
                  -₹{exp.amount.toLocaleString('en-IN')}
                </p>

                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: RECORD NEW EXPENSE */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                <span>Record Expense (Kharcha)</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              {/* Category selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-black text-slate-800 uppercase">Expense Category *</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCat(!isCustomCat)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    {isCustomCat ? '← Choose Preset' : '+ Custom Category'}
                  </button>
                </div>

                {isCustomCat ? (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwal Bonus, Generator Fuel, Shoe Polish..."
                    value={customCatInput}
                    onChange={(e) => setCustomCatInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-rose-400 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                ) : (
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {PRESET_EXPENSE_CATS.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-rose-400 rounded-xl font-mono font-black text-rose-700 text-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', label: '💵 Cash Drawer' },
                    { id: 'upi', label: '📱 UPI / Online' },
                    { id: 'bank', label: '🏦 Bank' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setExpPaymentMethod(m.id as any)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        expPaymentMethod === m.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Title / Details (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Tea cups for customer + Staff snacks"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Expense Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN EDIT EXPENSE */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedExpForEdit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-rose-600" />
                <span>Edit Expense Record</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-rose-400 rounded-xl font-mono font-black text-rose-700 text-base focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', label: '💵 Cash' },
                    { id: 'upi', label: '📱 UPI' },
                    { id: 'bank', label: '🏦 Bank' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditPaymentMethod(m.id as any)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        editPaymentMethod === m.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
