import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="bg-white border border-[#e1e3e5] rounded-2xl p-12 text-center shadow-2xs max-w-lg mx-auto space-y-4 my-8">
      {icon && <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">{icon}</div>}
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="min-h-[44px] px-4 py-2 bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
