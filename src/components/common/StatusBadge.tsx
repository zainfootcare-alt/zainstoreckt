import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = status.toUpperCase();

  let style = 'bg-slate-100 text-slate-800 border-slate-200';

  if (['ACTIVE', 'COMPLETED', 'PAID', 'OPEN', 'SENT', 'PUBLISHED', 'PRESENT'].includes(norm)) {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
  } else if (['UNPAID', 'PENDING', 'SCHEDULED', 'ISSUED', 'TODO', 'HALF_DAY'].includes(norm)) {
    style = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
  } else if (['VOIDED', 'OVERDUE', 'CANCELLED', 'ABSENT', 'FAILED', 'HIGH', 'URGENT'].includes(norm)) {
    style = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
  } else if (['PARTIALLY_PAID', 'IN_PROGRESS', 'DRAFT'].includes(norm)) {
    style = 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-md border ${px} ${style} tracking-tight`}>
      {status}
    </span>
  );
};
