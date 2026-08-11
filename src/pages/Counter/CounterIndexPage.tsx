import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { posService } from '../../services/posService';
import { useShop } from '../../context/ShopContext';
import { CashSession } from '../../types/database.types';
import { DollarSign, ShieldCheck, AlertCircle, Clock, IndianRupee } from 'lucide-react';

export const CounterIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeShop } = useShop();
  const [session, setSession] = useState<CashSession | null>(null);

  useEffect(() => {
    if (activeShop) {
      posService.getActiveSession(activeShop.id).then(setSession);
    }
  }, [activeShop]);

  return (
    <PermissionGuard requiredPermission="cash_close:manage">
      <div className="space-y-6">
        <PageHeader
          title="Cash Counter Shift Operations (INR ₹)"
          subtitle="Manage store cash drawer floats, register shift openings, closing variance reconciliations, and manager approvals"
          breadcrumbs={[{ label: 'Home', href: '/app/dashboard' }, { label: 'Counter Shift' }]}
          primaryAction={{
            label: session ? 'Close Cash Shift (INR ₹)' : 'Open Cash Shift (INR ₹)',
            icon: <IndianRupee className="w-4 h-4" />,
            onClick: () => navigate(session ? '/app/counter/close' : '/app/counter/open'),
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Register Shift Status" value={session ? session.status : 'CLOSED'} subtitle={session ? `Opened: ${new Date(session.opened_at).toLocaleTimeString()}` : 'No active shift'} icon={<Clock className="w-5 h-5 text-[#008060]" />} />
          <KPICard title="Opening Cash Float (₹)" value={`₹${(session?.opening_cash || 5000).toFixed(2)}`} subtitle="Physical Starting Drawer Cash" icon={<IndianRupee className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Expected Cash Drawer (₹)" value={`₹${(session?.expected_cash || 5000).toFixed(2)}`} subtitle="Opening Cash + Today Cash Sales" icon={<IndianRupee className="w-5 h-5 text-[#008060]" />} />
        </div>
      </div>
    </PermissionGuard>
  );
};
