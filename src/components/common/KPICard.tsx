import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="bg-white border border-[#e1e3e5] rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{icon}</div>}
      </div>

      <div className="mt-2 space-y-1">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center space-x-2 text-[11px]">
            {trend && (
              <span
                className={`font-bold ${
                  trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                } px-1.5 py-0.5 rounded border ${
                  trend.isPositive ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            )}
            {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
