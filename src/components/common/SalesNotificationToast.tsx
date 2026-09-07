import React, { useEffect, useState } from 'react';
import { ShoppingBag, CheckCircle2, X, FileText, ArrowRight } from 'lucide-react';
import { SaleRecord } from '../../types/database.types';

interface SalesNotificationToastProps {
  latestSale: SaleRecord | null;
  onViewInvoice: (sale: SaleRecord) => void;
  onDismiss: () => void;
}

export const SalesNotificationToast: React.FC<SalesNotificationToastProps> = ({
  latestSale,
  onViewInvoice,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (latestSale) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [latestSale, onDismiss]);

  if (!visible || !latestSale) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 animate-in slide-in-from-top-4 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                Sale Order Created
              </span>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <h4 className="text-xs font-black text-white mt-1 truncate">
              #{latestSale.receipt_number} • ₹{latestSale.total.toLocaleString('en-IN')}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {latestSale.customer_name || 'Walk-in'} (by {latestSale.created_by_name || 'POS'})
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">
          {latestSale.items?.length || 1} Item(s) recorded
        </span>
        <button
          onClick={() => {
            setVisible(false);
            onViewInvoice(latestSale);
          }}
          className="px-2.5 py-1 bg-[#ff6600] hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <span>View Invoice</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SalesNotificationToast;
