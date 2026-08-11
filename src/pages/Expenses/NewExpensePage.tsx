import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { AttachmentUploader } from '../../components/common/AttachmentUploader';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { financeService, PREDEFINED_CATEGORIES } from '../../services/financeService';
import { useShop } from '../../context/ShopContext';
import { ShieldCheck, IndianRupee } from 'lucide-react';

export const NewExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeShop, organization } = useShop();

  const [categoryName, setCategoryName] = useState<string>(PREDEFINED_CATEGORIES[0]);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(0.0);
  const [businessDate, setBusinessDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [paymentAccountId, setPaymentAccountId] = useState<string>('acc-bank-04');
  const [receiptPath, setReceiptPath] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const idempotencyKey = `exp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const res = await financeService.createExpense({
        idempotency_key: idempotencyKey,
        organization_id: organization?.id || 'org-footwear-101',
        shop_id: activeShop?.id || 'shop-mumbai-01',
        category_name: categoryName,
        title,
        amount,
        business_date: businessDate,
        status,
        payment_account_id: status === 'PAID' ? paymentAccountId : undefined,
        payment_method: status === 'PAID' ? 'Bank Transfer' : undefined,
        receipt_attachment_path: receiptPath,
        notes,
      });

      if (res.requires_approval) {
        alert(`Expense ₹${amount.toFixed(2)} recorded! Note: Exceeds ₹25,000 threshold, set to PENDING MANAGER APPROVAL.`);
      } else {
        alert('Footwear Operational Expense Recorded Successfully!');
      }

      navigate('/app/expenses');
    } catch (err) {
      alert('Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGuard requiredPermission="finance:manage">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="Record Operational Expense (INR ₹)"
          subtitle="Log store rent, packaging boxes, utilities, or salary payouts"
          breadcrumbs={[
            { label: 'Home', href: '/app/dashboard' },
            { label: 'Expenses', href: '/app/expenses' },
            { label: 'New Expense' },
          ]}
        />

        <form onSubmit={handleSubmit} className="bg-white border border-[#e1e3e5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-slate-700">Expense Category</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-slate-700">Expense Amount (₹ INR)</label>
              <input
                type="number"
                step="1"
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="₹0.00"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-rose-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-700">Expense Title / Description</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Custom Branded Shoe Boxes (500 units)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-slate-700">Payment Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="PAID">PAID NOW (Money Outflow)</option>
                <option value="UNPAID">UNPAID (Create Expense Payable)</option>
              </select>
            </div>

            {status === 'PAID' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">Payment Outflow Account</label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="acc-bank-04">HDFC Bank Main Business Account</option>
                  <option value="acc-cash-01">Main Cash Register Drawer</option>
                  <option value="acc-upi-02">UPI QR Merchant (PhonePe)</option>
                  <option value="acc-card-03">HDFC Card POS Swipe Machine</option>
                </select>
              </div>
            )}
          </div>

          {/* RLS ATTACHMENT VAULT UPLOADER */}
          <AttachmentUploader
            bucketName="expense-receipts-bucket"
            value={receiptPath}
            onChange={setReceiptPath}
            label="Attach GST Expense Receipt / Invoice PDF (RLS Vault)"
          />

          <button
            type="submit"
            disabled={isSubmitting || amount <= 0 || !title}
            className="w-full min-h-[48px] bg-[#008060] hover:bg-[#006e52] disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" /> Save Footwear Expense (₹{amount.toFixed(2)})
          </button>
        </form>
      </div>
    </PermissionGuard>
  );
};
