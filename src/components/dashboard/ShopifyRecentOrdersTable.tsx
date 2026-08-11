import React from 'react';
import { ShoppingBag, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentOrder {
  id: string;
  customerName: string;
  shoeArticle: string;
  sizeUK: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash';
  amount: number;
  time: string;
  status: 'Completed' | 'Processing';
}

const RECENT_POS_ORDERS: RecentOrder[] = [
  {
    id: 'POS-8902',
    customerName: 'Rahul Sharma',
    shoeArticle: 'SoleCraft Italian Leather Oxfords Black',
    sizeUK: 'UK 8',
    paymentMethod: 'UPI',
    amount: 4999,
    time: '10:42 PM',
    status: 'Completed',
  },
  {
    id: 'POS-8901',
    customerName: 'Priya Patel',
    shoeArticle: 'AirStride Running Sneakers White/Blue',
    sizeUK: 'UK 6',
    paymentMethod: 'Card',
    amount: 3499,
    time: '09:15 PM',
    status: 'Completed',
  },
  {
    id: 'POS-8900',
    customerName: 'Amit Verma',
    shoeArticle: 'Formal Monk Strap Hand-Burnished Tan',
    sizeUK: 'UK 9',
    paymentMethod: 'UPI',
    amount: 5890,
    time: '08:30 PM',
    status: 'Completed',
  },
  {
    id: 'POS-8899',
    customerName: 'Custom Order #CO-2026-001',
    shoeArticle: 'Custom Handcrafted Leather Brogues',
    sizeUK: 'UK 8',
    paymentMethod: 'Cash',
    amount: 7500,
    time: '06:10 PM',
    status: 'Processing',
  },
];

export const ShopifyRecentOrdersTable: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#e1e3e5] rounded-2xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live POS Activity</span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#008060]" /> Recent Shoe Sales & Custom Orders
          </h3>
        </div>
        <button
          onClick={() => navigate('/app/sales')}
          className="text-xs font-bold text-[#008060] hover:text-[#006e52] flex items-center gap-1 hover:underline font-sans"
        >
          <span>View All Sales</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Shoe Item & Size</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {RECENT_POS_ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-[#008060]">{order.id}</td>
                <td className="py-3 px-3 text-slate-900 font-semibold">{order.customerName}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-800 font-medium truncate max-w-[200px]" title={order.shoeArticle}>
                      {order.shoeArticle}
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                      {order.sizeUK}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      order.paymentMethod === 'UPI'
                        ? 'bg-purple-100 text-purple-800'
                        : order.paymentMethod === 'Card'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">
                  ₹{order.amount.toLocaleString('en-IN')}.00
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {order.status === 'Completed' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
