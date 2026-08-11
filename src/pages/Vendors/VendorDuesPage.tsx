import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { IndexTable } from '../../components/common/IndexTable';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types/database.types';
import { AlertCircle, IndianRupee, Send, Calendar } from 'lucide-react';

export const VendorDuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    vendorService.getVendors().then(setVendors);
  }, []);

  const dueVendors = vendors.filter((v) => v.current_balance > 0);
  const totalDues = dueVendors.reduce((sum, v) => sum + v.current_balance, 0);

  return (
    <PermissionGuard requiredPermission="finance:view">
      <div className="space-y-6">
        <PageHeader
          title="Footwear Vendor Dues & Overdue Payables"
          subtitle="Reconciled supplier statement balances, overdue credit days, and payment triggers (INR ₹)"
          breadcrumbs={[
            { label: 'Home', href: '/app/dashboard' },
            { label: 'Vendors', href: '/app/vendors' },
            { label: 'Vendor Dues' },
          ]}
        />

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Total Vendor Payables" value={`₹${totalDues.toLocaleString('en-IN')}`} subtitle={`${dueVendors.length} Suppliers Pending`} icon={<IndianRupee className="w-5 h-5 text-rose-600" />} />
          <KPICard title="Overdue (> 30 Days)" value="₹84,000.00" subtitle="Agra Footwear Hub" icon={<AlertCircle className="w-5 h-5 text-amber-600" />} />
          <KPICard title="Due This Week" value="₹1,33,800.00" subtitle="Kanpur Leathercrafts" icon={<Calendar className="w-5 h-5 text-indigo-600" />} />
        </div>

        {/* DUES TABLE */}
        <IndexTable
          data={dueVendors}
          keyExtractor={(v) => v.id}
          columns={[
            {
              header: 'Supplier Name',
              cell: (r) => (
                <div>
                  <button onClick={() => navigate(`/app/vendors/${r.id}`)} className="font-bold text-slate-900 hover:text-[#008060] text-left">
                    {r.name}
                  </button>
                  <p className="text-[11px] text-slate-500">{r.city} • {r.category}</p>
                </div>
              ),
            },
            { header: 'Weekly Payment Day', accessorKey: 'weekly_payment_day' },
            { header: 'Credit Terms', cell: (r) => <span>Net {r.payment_terms} Days</span> },
            {
              header: 'Overdue Status',
              cell: (r) => (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.name.includes('Agra') ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800'}`}>
                  {r.name.includes('Agra') ? 'OVERDUE (34 Days)' : 'Due in 5 Days'}
                </span>
              ),
            },
            {
              header: 'Outstanding Balance (₹)',
              align: 'right',
              cell: (r) => <span className="font-bold font-mono text-rose-600 text-sm">₹{r.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
            },
            {
              header: 'Action',
              align: 'right',
              cell: (r) => (
                <button
                  onClick={() => alert(`Pay Supplier ${r.name}`)}
                  className="min-h-[36px] px-3 py-1 text-xs font-bold text-white bg-[#008060] hover:bg-[#006e52] rounded-lg shadow-2xs"
                >
                  Pay Vendor (₹)
                </button>
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
};
