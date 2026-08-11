import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  BarChart3,
  ShoppingBag,
  Receipt,
  Truck,
  Download,
  Calendar,
  Filter,
  Users,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { sales, expenses, vendors, purchases, vendorPayments, employees } = useShop();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'expenses' | 'parties'>('sales');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'this_week' | 'this_month'>('this_month');

  // Filter sales based on dateFilter
  const getFilteredSales = () => {
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') return sales.filter((s) => s.created_at.startsWith(today));
    return sales;
  };

  const filteredSales = getFilteredSales();
  const totalSalesSum = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const cashSalesSum = filteredSales.reduce((sum, s) => sum + s.cash_amount, 0);
  const onlineSalesSum = filteredSales.reduce((sum, s) => sum + s.online_amount, 0);

  // Group sales by salesperson
  const salespersonSalesMap: Record<string, { name: string; total: number; count: number }> = {};
  filteredSales.forEach((s) => {
    const empName = s.created_by_name || 'Staff';
    if (!salespersonSalesMap[empName]) {
      salespersonSalesMap[empName] = { name: empName, total: 0, count: 0 };
    }
    salespersonSalesMap[empName].total += s.total;
    salespersonSalesMap[empName].count += 1;
  });

  // Expenses grouped by category
  const expenseCatMap: Record<string, number> = {};
  expenses.forEach((e) => {
    if (!expenseCatMap[e.category_name]) expenseCatMap[e.category_name] = 0;
    expenseCatMap[e.category_name] += e.amount;
  });

  return (
    <PermissionGuard requiredPermission="reports:view">
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-xs text-slate-500 font-medium">Sales, Expense categories & Party dues reporting</p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveReportTab('sales')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                activeReportTab === 'sales' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setActiveReportTab('expenses')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                activeReportTab === 'expenses' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense Report
            </button>
            <button
              onClick={() => setActiveReportTab('parties')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                activeReportTab === 'parties' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Party Dues Report
            </button>
          </div>
        </div>

        {/* TAB 1: SALES REPORT */}
        {activeReportTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Filter Period:</span>
              <div className="flex gap-2">
                {(['today', 'yesterday', 'this_week', 'this_month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setDateFilter(period)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                      dateFilter === period ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {period.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Revenue</span>
                <p className="text-xl font-black text-emerald-700 mt-1">₹{totalSalesSum.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Cash Sales</span>
                <p className="text-xl font-black text-amber-700 mt-1">₹{cashSalesSum.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Online Sales</span>
                <p className="text-xl font-black text-blue-700 mt-1">₹{onlineSalesSum.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Transactions</span>
                <p className="text-xl font-black text-slate-900 mt-1">{filteredSales.length}</p>
              </div>
            </div>

            {/* SALESPERSON PERFORMANCE TABLE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Salesperson-wise Performance
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="py-3 px-4">Salesperson</th>
                      <th className="py-3 px-4 text-center">Transactions</th>
                      <th className="py-3 px-4 text-right">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.values(salespersonSalesMap).map((sp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{sp.name}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{sp.count}</td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{sp.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPENSE REPORT */}
        {activeReportTab === 'expenses' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" /> Expenses by Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(expenseCatMap).map(([cat, amt]) => (
                <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">{cat}</span>
                  <span className="text-sm font-black text-rose-600">₹{amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PARTY DUES REPORT */}
        {activeReportTab === 'parties' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" /> Party Dues Summary
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Party Name</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4 text-right">Total Purchase</th>
                    <th className="py-3 px-4 text-right">Total Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((party) => {
                    const partyPurTotal = purchases
                      .filter((p) => p.vendor_id === party.id)
                      .reduce((sum, p) => sum + p.total, 0);

                    const partyPaidTotal = vendorPayments
                      .filter((p) => p.vendor_id === party.id)
                      .reduce((sum, p) => sum + p.amount_paid, 0);

                    return (
                      <tr key={party.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{party.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{party.city}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                          ₹{(party.opening_balance + partyPurTotal).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          ₹{partyPaidTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600">
                          ₹{party.current_balance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};
