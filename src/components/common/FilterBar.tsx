import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  placeholder?: string;
  filters?: FilterConfig[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
}) => {
  return (
    <div className="bg-white border border-[#e1e3e5] rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[38px] pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
        />
      </div>

      {/* Dynamic Dropdown Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {filters.map((f) => (
            <select
              key={f.key}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <option value="">All {f.label}s</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
};
