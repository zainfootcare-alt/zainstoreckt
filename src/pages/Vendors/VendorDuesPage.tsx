import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { IndexTable } from '../../components/common/IndexTable';
import { KPICard } from '../../components/common/KPICard';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { useShop } from '../../context/ShopContext';
import { AlertCircle, IndianRupee, Calendar } from 'lucide-react';

export const VendorDuesPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendors } = useShop();

  const dueVendors = vendors.filter((v) => (v.current_balance || 0) > 0);
  const totalDues = dueVendors.reduce((sum, v) => sum + (v.current_balance || 0), 0);

  return (
    <PermissionGuard requiredPermission="finance:view">
      <div className="space-y-6">
        <PageHeader
          title="Footwear Vendor Dues & Overdue Payables"
          subtitle="Reconciled supplier statement balances, overdue credit days, and payment triggers (INR ₹)"
          breadcrumbs={[
            { label: 'Home', href: '/app/dashboard' },
            { label: 'Parties', href: '/app/parties' },
            { label: 'Vendor Dues' },
          ]}
        />

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="Total Vendor Payables"
            value={`₹${totalDues.toLocaleString('en-IN')}`}
            subtitle={`${dueVendors.length} Suppliers Pending`}
            icon={<IndianRupee className="w-5 h-5 text-rose-600" />}
          />
          <KPICard
            title="Suppliers with Dues"
            value={`${dueVendors.length}`}
            subtitle="Active pending suppliers"
            icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          />
          <KPICard
            title="Total Suppliers"
            value={`${vendors.length}`}
            subtitle="Registered parties"
            icon={<Calendar className="w-5 h-5 text-indigo-600" />}
          />
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
                  <button
                    onClick={() => navigate(`/app/parties`)}
                    className="font-bold text-slate-900 hover:text-orange-600 text-left cursor-pointer"
                  >
                    {r.name}
                  </button>
                  <p className="text-[11px] text-slate-500">{r.city} • {r.category}</p>
                </div>
              ),
            },
            { header: 'Weekly Payment Day', accessorKey: 'weekly_payment_day' },
            { header: 'Credit Terms', cell: (r) => <span>Net {r.payment_terms || 7} Days</span> },
            {
              header: 'Outstanding Balance (₹)',
              align: 'right',
              cell: (r) => (
                <span className="font-black font-mono text-rose-600 text-sm">
                  ₹{(r.current_balance || 0).toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              header: 'Action',
              align: 'right',
              cell: () => (
                <button
                  onClick={() => navigate('/app/parties')}
                  className="min-h-[36px] px-3 py-1 text-xs font-bold text-white bg-[#ff6600] hover:bg-orange-600 rounded-lg shadow-2xs cursor-pointer"
                >
                  Pay Party (₹)
                </button>
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
};

export default VendorDuesPage;
