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
  const { activeShop, organization, recordExpense, paymentAccounts } = useShop();

  const [categoryName, setCategoryName] = useState<string>(PREDEFINED_CATEGORIES[0]);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(0.0);
  const [businessDate, setBusinessDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(paymentAccounts[0]?.id || 'd4000000-0000-0000-0000-000000000004');
  const [receiptPath, setReceiptPath] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const idempotencyKey = `exp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      await recordExpense({
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

      alert('Footwear Operational Expense Recorded Successfully!');
      navigate('/app/expenses');
    } catch (err) {
      console.error('Failed to record expense:', err);
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                >
                  {paymentAccounts.length > 0 ? (
                    paymentAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type.toUpperCase()})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="d4000000-0000-0000-0000-000000000004">Main Bank Account (BANK)</option>
                      <option value="d4000000-0000-0000-0000-000000000001">Cash Counter Register (CASH)</option>
                      <option value="d4000000-0000-0000-0000-000000000002">UPI / QR (PhonePe/GPay)</option>
                      <option value="d4000000-0000-0000-0000-000000000003">Card POS Machine</option>
                    </>
                  )}
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
