import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle,
  Filter,
  Flame,
  X,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { TodoItem } from '../../types/database.types';

export const TodoPage: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, userProfile } = useShop();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'SELF_GROWTH'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Task Form
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskCategory, setTaskCategory] = useState<
    'SHOP_TASK' | 'SUPPLIER_PAYMENT' | 'CUSTOMER_FOLLOWUP' | 'SELF_GROWTH'
  >('SHOP_TASK');
  const [taskPriority, setTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');

  // Quick Preset Tasks
  const PRESET_TASKS = [
    { title: 'Check Sunday running & sports shoe stock', cat: 'SHOP_TASK' as const, prio: 'HIGH' as const },
    { title: 'Pay weekly outstanding to Agra Supplier', cat: 'SUPPLIER_PAYMENT' as const, prio: 'HIGH' as const },
    { title: 'Send WhatsApp catalog to regular customers', cat: 'CUSTOMER_FOLLOWUP' as const, prio: 'MEDIUM' as const },
    { title: 'Count cash drawer float at start of day', cat: 'SELF_GROWTH' as const, prio: 'MEDIUM' as const },
  ];

  // Filtered Tasks
  const filteredTodos = todos.filter((t) => {
    if (activeFilter === 'PENDING') return !t.is_completed;
    if (activeFilter === 'COMPLETED') return t.is_completed;
    if (activeFilter === 'SELF_GROWTH') return t.category === 'SELF_GROWTH';
    return true;
  });

  const completedCount = todos.filter((t) => t.is_completed).length;
  const pendingCount = todos.filter((t) => !t.is_completed).length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTodo({
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      due_date: taskDueDate || undefined,
      description: taskDescription.trim() || undefined,
      is_completed: false,
    });

    setIsAddModalOpen(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
  };

  const getCategoryBadge = (cat: TodoItem['category']) => {
    switch (cat) {
      case 'SHOP_TASK':
        return { label: '🛒 Shop Task', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'SUPPLIER_PAYMENT':
        return { label: '💰 Supplier Payout', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'CUSTOMER_FOLLOWUP':
        return { label: '📱 Customer Follow-up', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'SELF_GROWTH':
        return { label: '🚀 Self Growth', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'Task', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getPriorityBadge = (prio: TodoItem['priority']) => {
    switch (prio) {
      case 'HIGH':
        return <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">MED</span>;
      case 'LOW':
        return <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">LOW</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* 1. TOP HEADER & MOTIVATION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Daily Ops & Self-Growth</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Action Planner & Shop Goals
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Keep Zain Footwear running smoothly, track weekly dues, and achieve daily growth targets.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Task</span>
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{completedCount} Completed</span>
            </div>
            <div className="flex items-center space-x-1.5 font-bold text-slate-300">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>{pendingCount} Pending</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-64">
            <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-black text-orange-400">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-lg overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: `All (${todos.length})` },
          { id: 'PENDING', label: `Pending (${pendingCount})` },
          { id: 'COMPLETED', label: `Done (${completedCount})` },
          { id: 'SELF_GROWTH', label: '🚀 Self-Growth' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`flex-1 min-w-[80px] py-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
              activeFilter === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. QUICK 1-TAP PRESET ACTIONS (If tasks are few) */}
      {todos.length < 5 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>1-Tap Recommended Tasks for Today:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_TASKS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  addTodo({
                    title: p.title,
                    category: p.cat,
                    priority: p.prio,
                    is_completed: false,
                  });
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50/60 hover:border-orange-200 text-left text-xs font-bold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate pr-2">{p.title}</span>
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. TASK LIST VIEW */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No tasks pending under this category. Add a new task or goal for today.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#ff6600] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const catBadge = getCategoryBadge(todo.category);

            return (
              <div
                key={todo.id}
                className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all flex items-start justify-between gap-3 ${
                  todo.is_completed
                    ? 'border-slate-200 bg-slate-50/60 opacity-60'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {todo.is_completed ? (
                      <CheckSquare className="w-6 h-6 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Square className="w-6 h-6 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <p
                      className={`text-sm font-black tracking-tight ${
                        todo.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {todo.title}
                    </p>

                    {todo.description && (
                      <p className="text-xs text-slate-500 font-medium">{todo.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadge.bg}`}>
                        {catBadge.label}
                      </span>
                      {getPriorityBadge(todo.priority)}
                      {todo.due_date && (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{todo.due_date}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW TASK / GOAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-orange-500" />
                <span>Create New Task / Goal</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order 20 pairs formal size 8"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="SHOP_TASK">🛒 Shop Task</option>
                    <option value="SUPPLIER_PAYMENT">💰 Supplier Payout</option>
                    <option value="CUSTOMER_FOLLOWUP">📱 Customer Follow-up</option>
                    <option value="SELF_GROWTH">🚀 Self-Growth</option>
                  </select>
                </div>

                <div>
                  <label className="font-black text-slate-800 uppercase block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="HIGH">🔴 High Priority</option>
                    <option value="MEDIUM">🟠 Medium Priority</option>
                    <option value="LOW">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Due Date / Time (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Today 5:00 PM, Every Friday"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 uppercase block mb-1">Description / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional instructions or notes..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white rounded-xl font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
