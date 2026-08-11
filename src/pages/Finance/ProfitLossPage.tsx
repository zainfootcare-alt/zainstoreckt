import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { KPICard } from '../../components/common/KPICard';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { financeService } from '../../services/financeService';
import { PaymentAccount, Expense } from '../../types/database.types';
import { PieChart, Download, Printer, ShieldAlert, IndianRupee } from 'lucide-react';

export const ProfitLossPage: React.FC = () => {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    financeService.getPaymentAccounts().then(setAccounts);
    financeService.getExpenses().then(setExpenses);
  }, []);

  const metrics = financeService.getFinancialFormulas(accounts, expenses);

  return (
    <PermissionGuard requiredPermission="finance:view">
      <div className="space-y-6">
        <PageHeader
          title="Profit & Loss Financial Statement (INR ₹)"
          subtitle="Accrual-basis gross sales revenue, cost of goods sold (COGS), operating expenses, and net profit"
          breadcrumbs={[
            { label: 'Home', href: '/app/dashboard' },
            { label: 'Finance', href: '/app/finance' },
            { label: 'Profit & Loss' },
          ]}
          primaryAction={{
            label: 'Print Statement PDF',
            icon: <Printer className="w-4 h-4" />,
            onClick: () => window.print(),
          }}
        />

        {/* DATA QUALITY WARNING */}
        {metrics.isCOGSDataComplete && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#008060]" />
              <span>Data Quality Check: All footwear item purchase cost records verified. Accounting profit formula active.</span>
            </div>
            <span className="font-mono text-[10px] uppercase bg-emerald-100 px-2 py-0.5 rounded">High Confidence</span>
          </div>
        )}

        {/* FINANCIAL SUMMARY CARDS IN INR ₹ */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <KPICard title="Gross Footwear Revenue" value={`₹${metrics.grossRevenue.toLocaleString('en-IN')}`} subtitle="POS Sales + Online Orders" icon={<IndianRupee className="w-5 h-5 text-[#008060]" />} />
          <KPICard title="Cost of Goods Sold (COGS)" value={`₹${metrics.cogs.toLocaleString('en-IN')}`} subtitle="Direct Supplier Purchase Cost" icon={<IndianRupee className="w-5 h-5 text-amber-600" />} />
          <KPICard title="Operational Expenses" value={`₹${metrics.totalExpenses.toLocaleString('en-IN')}`} subtitle="Rent, Utilities & Salaries" icon={<IndianRupee className="w-5 h-5 text-rose-600" />} />
          <KPICard title="Net Period Accounting Profit" value={`₹${metrics.accountingProfit.toLocaleString('en-IN')}`} subtitle="Gross Revenue - COGS - Expenses" icon={<PieChart className="w-5 h-5 text-indigo-600" />} />
        </div>

        {/* DETAILED P&L LEDGER STATEMENT */}
        <div className="bg-white border border-[#e1e3e5] rounded-xl p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Income & Expenditure Summary (Aug 2026)</h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg font-bold text-slate-900">
              <span>Gross Sales Revenue (Footwear Sales)</span>
              <span>₹{metrics.grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-50 rounded-lg font-bold text-slate-700 pl-6">
              <span>Less: Cost of Goods Sold (COGS)</span>
              <span className="text-amber-700">- ₹{metrics.cogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3 bg-emerald-50 rounded-lg font-bold text-emerald-900 border border-emerald-200">
              <span>GROSS PROFIT MARGIN (Revenue - COGS)</span>
              <span>₹{(metrics.grossRevenue - metrics.cogs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="font-bold text-slate-500 block uppercase">Less: Operational Expenses</span>
              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between p-2 bg-slate-50 rounded text-slate-700 pl-6">
                  <span>{e.category_name}: {e.title}</span>
                  <span className="text-rose-600">- ₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between p-4 bg-slate-900 text-white rounded-xl font-bold text-sm">
              <span>NET ACCOUNTING OPERATING PROFIT (INR ₹)</span>
              <span className="text-emerald-400 font-extrabold text-base">
                ₹{metrics.accountingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};
