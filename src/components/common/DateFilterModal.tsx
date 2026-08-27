import React, { useState } from 'react';
import { Calendar, X, Check, Clock, ChevronRight } from 'lucide-react';

export type DatePreset = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL_TIME' | 'CUSTOM';

export interface DateFilterValue {
  preset: DatePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: DateFilterValue;
  onApply: (filter: DateFilterValue) => void;
}

export const getPresetDates = (preset: DatePreset): { startDate: string; endDate: string; label: string } => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (preset === 'TODAY') {
    return { startDate: todayStr, endDate: todayStr, label: 'Today' };
  }

  if (preset === 'YESTERDAY') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    return { startDate: yStr, endDate: yStr, label: 'Yesterday' };
  }

  if (preset === 'THIS_WEEK') {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay() || 7;
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    return { startDate: startOfWeekStr, endDate: todayStr, label: 'This Week' };
  }

  if (preset === 'THIS_MONTH') {
    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { startDate: startOfMonthStr, endDate: todayStr, label: 'This Month' };
  }

  if (preset === 'LAST_MONTH') {
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const sStr = firstDayLastMonth.toISOString().split('T')[0];
    const eStr = lastDayLastMonth.toISOString().split('T')[0];
    return { startDate: sStr, endDate: eStr, label: 'Last Month' };
  }

  if (preset === 'ALL_TIME') {
    return { startDate: '', endDate: '', label: 'All Time' };
  }

  return { startDate: todayStr, endDate: todayStr, label: 'Custom Date' };
};

export const formatDateLabel = (filter: DateFilterValue): string => {
  if (filter.preset !== 'CUSTOM') {
    return filter.label || 'Today';
  }

  if (!filter.startDate && !filter.endDate) return 'All Time';
  if (filter.startDate && !filter.endDate) return filter.startDate;
  if (filter.startDate === filter.endDate) {
    try {
      const d = new Date(filter.startDate + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return filter.startDate;
    }
  }

  try {
    const s = new Date(filter.startDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const e = new Date(filter.endDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} - ${e}`;
  } catch {
    return `${filter.startDate} to ${filter.endDate}`;
  }
};

export const DateFilterModal: React.FC<DateFilterModalProps> = ({
  isOpen,
  onClose,
  currentValue,
  onApply,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(currentValue.preset);
  const [customStart, setCustomStart] = useState<string>(currentValue.startDate || new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState<string>(currentValue.endDate || new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: DatePreset) => {
    setSelectedPreset(preset);
    if (preset !== 'CUSTOM') {
      const dates = getPresetDates(preset);
      setCustomStart(dates.startDate);
      setCustomEnd(dates.endDate);
    }
  };

  const handleApply = () => {
    if (selectedPreset === 'CUSTOM') {
      const isSingleDay = customStart === customEnd;
      let label = 'Custom Date';
      if (customStart) {
        try {
          const s = new Date(customStart + 'T00:00:00');
          if (isSingleDay) {
            label = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          } else {
            const e = new Date(customEnd + 'T00:00:00');
            label = `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
          }
        } catch {
          label = `${customStart} - ${customEnd}`;
        }
      }
      onApply({
        preset: 'CUSTOM',
        startDate: customStart,
        endDate: customEnd || customStart,
        label,
      });
    } else {
      const dates = getPresetDates(selectedPreset);
      onApply({
        preset: selectedPreset,
        startDate: dates.startDate,
        endDate: dates.endDate,
        label: dates.label,
      });
    }
    onClose();
  };

  const PRESETS_LIST: Array<{ id: DatePreset; label: string; desc: string }> = [
    { id: 'TODAY', label: 'Today', desc: 'Current day sales' },
    { id: 'YESTERDAY', label: 'Yesterday', desc: 'Previous business day' },
    { id: 'THIS_WEEK', label: 'This Week', desc: 'Monday to Sunday' },
    { id: 'THIS_MONTH', label: 'This Month', desc: 'Current calendar month' },
    { id: 'LAST_MONTH', label: 'Last Month', desc: 'Previous month 1st to 31st' },
    { id: 'ALL_TIME', label: 'All Time', desc: 'Full business history' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Select Date Filter</h3>
              <p className="text-[11px] text-slate-500 font-medium">Filter sales & bills by date range</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QUICK PRESET BUTTONS */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Period Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS_LIST.map((p) => {
              const isSelected = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{p.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                  <span className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOM CALENDAR DATE PICKER */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Or Custom Date / Range (📅 Calendar)
            </label>
            {selectedPreset === 'CUSTOM' && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Custom Active
              </span>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setSelectedPreset('CUSTOM');
                    setCustomStart(e.target.value);
                    if (!customEnd || e.target.value > customEnd) {
                      setCustomEnd(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  onChange={(e) => {
                    setSelectedPreset('CUSTOM');
                    setCustomEnd(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>💡 Select same date for single-day sale</span>
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  setSelectedPreset('CUSTOM');
                  setCustomStart(todayStr);
                  setCustomEnd(todayStr);
                }}
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                Set to Today
              </button>
            </div>
          </div>
        </div>

        {/* MODAL ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('TODAY')}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            Reset (Today)
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-2 py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
