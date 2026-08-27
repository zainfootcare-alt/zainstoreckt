import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { KPICard } from '../../components/common/KPICard';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { financeService } from '../../services/financeService';
import { PaymentAccount, Expense } from '../../types/database.types';
import { DollarSign, ArrowLeftRight, BookOpen, AlertCircle, PieChart, CreditCard, ShieldCheck, IndianRupee } from 'lucide-react';

export const FinanceOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { paymentAccounts, vendors, expenses } = useShop();

  const cashAcc = paymentAccounts.find((a) => a.type === 'cash');
  const onlineAccs = paymentAccounts.filter((a) => a.type !== 'cash');

  const expectedCash = cashAcc ? cashAcc.current_balance : 0.0;
  const onlineBalances = onlineAccs.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0);
  const totalAvailableMoney = expectedCash + onlineBalances;
  const vendorPayable = vendors.reduce((sum, v) => sum + (v.current_balance || 0), 0);
  const cashSurplus = totalAvailableMoney - vendorPayable;

  const metrics = {
    expectedCash,
    onlineBalances,
    totalAvailableMoney,
    vendorPayable,
    cashSurplus,
  };

  return (
    <PermissionGuard requiredPermission="finance:view">
      <div className="space-y-6">
        <PageHeader
          title="Footwear Treasury & Finance Hub (INR ₹)"
          subtitle="Real-time cash float, UPI QR, HDFC bank balances, vendor payables, and P&L statement"
          breadcrumbs={[{ label: 'Home', href: '/app/dashboard' }, { label: 'Finance' }]}
          primaryAction={{
            label: 'Inter-Account Money Transfer',
            icon: <ArrowLeftRight className="w-4 h-4" />,
            onClick: () => navigate('/app/finance/accounts'),
          }}
          secondaryActions={[
            {
              label: 'View Cashbook Log',
              icon: <BookOpen className="w-4 h-4" />,
              onClick: () => navigate('/app/finance/cashbook'),
            },
            {
              label: 'Profit & Loss Statement',
              icon: <PieChart className="w-4 h-4 text-[#008060]" />,
              onClick: () => navigate('/app/finance/profit-loss'),
            },
          ]}
        />

        {/* FINANCIAL METRICS CARDS IN INR ₹ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Available Treasury Money" value={`₹${metrics.totalAvailableMoney.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} subtitle="Cash Register + Online Accounts" icon={<IndianRupee className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Expected Cash Drawer Float" value={`₹${metrics.expectedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} subtitle="Physical Register Balance" icon={<CreditCard className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Online Treasury Balances" value={`₹${metrics.onlineBalances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} subtitle="UPI QR + HDFC Bank" icon={<CreditCard className="w-5 h-5 text-blue-600" />} />
          <KPICard title="Total Vendor Payables" value={`₹${metrics.vendorPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} subtitle="Supplier Outstanding Bills" icon={<AlertCircle className="w-5 h-5 text-rose-600" />} />
        </div>

        {/* CASH SURPLUS & NET SURPLUS PANEL */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Net Financial Cash Surplus (INR ₹)</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              ₹{metrics.cashSurplus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">Available Treasury Money (₹{metrics.totalAvailableMoney.toLocaleString('en-IN')}) - Vendor Payables (₹{metrics.vendorPayable.toLocaleString('en-IN')})</p>
          </div>
          <button
            onClick={() => navigate('/app/finance/profit-loss')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl self-start md:self-auto"
          >
            Open P&L Statement →
          </button>
        </div>

        {/* PAYMENT ACCOUNTS GRID */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Configured Payment & Treasury Accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentAccounts.map((acc) => (
              <div key={acc.id} className="bg-white border border-[#e1e3e5] rounded-xl p-4 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 uppercase font-semibold">
                  <span>{acc.type}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{acc.name}</h4>
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  ₹{acc.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};
