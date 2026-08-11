import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { posService } from '../../services/posService';
import { useShop } from '../../context/ShopContext';
import { ShieldCheck, IndianRupee } from 'lucide-react';

export const OpenCounterPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeShop, organization } = useShop();
  const [openingCash, setOpeningCash] = useState<number>(5000.0); // ₹5,000 opening float

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await posService.openCounter({
        organization_id: organization?.id || 'org-footwear-101',
        shop_id: activeShop?.id || 'shop-mumbai-01',
        opening_cash: openingCash,
      });
      alert('Footwear Cash Register Shift OPENED successfully!');
      navigate('/app/pos');
    } catch (err) {
      alert('Failed to open shift');
    }
  };

  return (
    <PermissionGuard requiredPermission="cash_close:manage">
      <div className="max-w-xl mx-auto space-y-6">
        <PageHeader
          title="Open Register Shift (INR ₹)"
          subtitle={`Set physical starting cash float for ${activeShop?.name || 'Store'}`}
          breadcrumbs={[
            { label: 'Home', href: '/app/dashboard' },
            { label: 'Counter', href: '/app/counter' },
            { label: 'Open Shift' },
          ]}
        />

        <form onSubmit={handleOpenShift} className="bg-white border border-[#e1e3e5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-slate-700">Opening Cash Float Amount (₹ INR)</label>
            <input
              type="number"
              step="1"
              required
              value={openingCash}
              onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
              className="w-full text-xl font-bold font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <p className="text-xs text-slate-500">Count physical currency notes and coins in starting register drawer.</p>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] bg-[#008060] hover:bg-[#006e52] text-white text-sm font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" /> Start Register Shift (₹{openingCash.toFixed(2)})
          </button>
        </form>
      </div>
    </PermissionGuard>
  );
};
