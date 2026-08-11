import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  PaymentAccount,
  Expense,
  ExpensePayable,
  RecurringExpense,
  MoneyTransaction,
} from '../types/database.types';

export const PREDEFINED_CATEGORIES = [
  'Freight / Transport & Courier',
  'Shop Rent (Commercial Storefront)',
  'Electricity & Utilities',
  'Internet & Wi-Fi',
  'Manager Salary',
  'Cashier Salary',
  'Shoe Craftsman / Fitting Salary',
  'Store Maintenance & Display',
  'Shoe Boxes & Packaging',
  'Marketing & Ads',
  'Professional Fees & CA',
  'Other',
];

export const INITIAL_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'acc-cash-01',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Main Cash Register Drawer',
    type: 'cash',
    current_balance: 15450.0, // ₹15,450
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-upi-02',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'UPI QR Merchant (PhonePe / GPay)',
    type: 'upi',
    current_balance: 48500.0, // ₹48,500
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-card-03',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'HDFC Card POS Swipe Machine',
    type: 'card',
    current_balance: 125000.0, // ₹1,25,000
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-bank-04',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'HDFC Bank Main Business Account',
    type: 'bank',
    current_balance: 485000.0, // ₹4,85,000
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-201',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    category_name: 'Shop Rent (Commercial Storefront)',
    title: 'Monthly Store Lease (Linking Rd Bandra)',
    amount: 85000.0, // ₹85,000
    business_date: '2026-08-01',
    expense_date: new Date().toISOString(),
    status: 'PAID',
    payment_account_id: 'acc-bank-04',
    payment_method: 'Bank Transfer (NEFT)',
    receipt_attachment_path: 'footwear/expenses/rent_receipt_aug.pdf',
    requires_approval: true,
    is_approved: true,
    is_immutable: true,
    is_voided: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-202',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    category_name: 'Shoe Boxes & Packaging',
    title: 'Custom Branded Shoe Boxes (500 units)',
    amount: 12500.0, // ₹12,500
    business_date: '2026-08-03',
    expense_date: new Date().toISOString(),
    status: 'UNPAID',
    payment_method: 'Bank Transfer',
    requires_approval: false,
    is_approved: true,
    is_immutable: true,
    is_voided: false,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_CASHBOOK_TRANSACTIONS: MoneyTransaction[] = [
  {
    id: 'mt-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    payment_account_id: 'acc-cash-01',
    type: 'SALE_INFLOW',
    amount: 4999.0, // ₹4,999
    business_date: '2026-08-09',
    description: 'Cash Footwear Sale Receipt #REC-8923 (Italian Oxford UK 8)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mt-2',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    payment_account_id: 'acc-upi-02',
    type: 'SALE_INFLOW',
    amount: 2499.0, // ₹2,499
    business_date: '2026-08-09',
    description: 'UPI QR Sale Receipt #REC-8921 (AirStride Sneakers UK 9)',
    created_at: new Date().toISOString(),
  },
];

export const financeService = {
  async getPaymentAccounts(): Promise<PaymentAccount[]> {
    return INITIAL_PAYMENT_ACCOUNTS;
  },

  async getExpenses(): Promise<Expense[]> {
    return INITIAL_EXPENSES;
  },

  async getCashbook(): Promise<MoneyTransaction[]> {
    return INITIAL_CASHBOOK_TRANSACTIONS;
  },

  async createExpense(payload: {
    idempotency_key: string;
    organization_id: string;
    shop_id: string;
    category_name: string;
    title: string;
    vendor_name?: string;
    amount: number;
    business_date: string;
    status: 'PAID' | 'UNPAID';
    payment_account_id?: string;
    payment_method?: string;
    receipt_attachment_path?: string;
    notes?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_create_expense', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC create expense failed, using local simulation:', err);
      }
    }

    const reqApproval = payload.amount > 25000.0; // ₹25,000 threshold in India
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      category_name: payload.category_name,
      title: payload.title,
      vendor_name: payload.vendor_name,
      amount: payload.amount,
      business_date: payload.business_date,
      expense_date: new Date().toISOString(),
      status: payload.status,
      payment_account_id: payload.payment_account_id,
      payment_method: payload.payment_method || 'Cash',
      receipt_attachment_path: payload.receipt_attachment_path,
      requires_approval: reqApproval,
      is_approved: !reqApproval,
      is_immutable: true,
      is_voided: false,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };

    INITIAL_EXPENSES.unshift(newExp);

    if (payload.status === 'PAID') {
      INITIAL_CASHBOOK_TRANSACTIONS.unshift({
        id: `mt_exp_${Date.now()}`,
        organization_id: payload.organization_id,
        shop_id: payload.shop_id,
        payment_account_id: payload.payment_account_id,
        type: 'EXPENSE_OUTFLOW',
        amount: payload.amount,
        business_date: payload.business_date,
        description: `Footwear Expense (${payload.category_name}): ${payload.title}`,
        created_at: new Date().toISOString(),
      });

      const acc = INITIAL_PAYMENT_ACCOUNTS.find((a) => a.id === payload.payment_account_id);
      if (acc) acc.current_balance -= payload.amount;
    }

    return { success: true, expense_id: newExp.id, status: payload.status, requires_approval: reqApproval };
  },

  async transferMoney(payload: {
    idempotency_key: string;
    organization_id: string;
    shop_id: string;
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_transfer_money', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC transfer_money failed, using local simulation:', err);
      }
    }

    const fromAcc = INITIAL_PAYMENT_ACCOUNTS.find((a) => a.id === payload.from_account_id);
    const toAcc = INITIAL_PAYMENT_ACCOUNTS.find((a) => a.id === payload.to_account_id);

    if (fromAcc) fromAcc.current_balance -= payload.amount;
    if (toAcc) toAcc.current_balance += payload.amount;

    const groupRef = `tr_grp_${Date.now()}`;
    INITIAL_CASHBOOK_TRANSACTIONS.unshift({
      id: `mt_tr_out_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      payment_account_id: payload.from_account_id,
      type: 'TRANSFER',
      amount: -payload.amount,
      business_date: new Date().toISOString().split('T')[0],
      description: `Transfer Out to ${toAcc?.name || 'Account'} (${payload.description || 'Inter-account transfer'})`,
      created_at: new Date().toISOString(),
    });

    INITIAL_CASHBOOK_TRANSACTIONS.unshift({
      id: `mt_tr_in_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      payment_account_id: payload.to_account_id,
      type: 'TRANSFER',
      amount: payload.amount,
      business_date: new Date().toISOString().split('T')[0],
      description: `Transfer In from ${fromAcc?.name || 'Account'} (${payload.description || 'Inter-account transfer'})`,
      created_at: new Date().toISOString(),
    });

    return { success: true, transfer_group_id: groupRef, amount: payload.amount };
  },

  getFinancialFormulas(accounts: PaymentAccount[], expenses: Expense[]) {
    const cashAcc = accounts.find((a) => a.type === 'cash');
    const onlineAccs = accounts.filter((a) => a.type !== 'cash');

    const expectedCash = cashAcc ? cashAcc.current_balance : 0.0;
    const onlineBalances = onlineAccs.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0);
    const totalAvailableMoney = expectedCash + onlineBalances;

    const vendorPayable = 249000.0; // ₹2,49,000 vendor payable
    const cashSurplus = totalAvailableMoney - vendorPayable;

    const grossRevenue = 845000.0; // ₹8,45,000 gross revenue
    const cogs = 380000.0; // ₹3,80,000 COGS
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.status === 'PAID' ? e.amount : 0), 0);
    const accountingProfit = grossRevenue - cogs - totalExpenses;

    const isCOGSDataComplete = true;

    return {
      expectedCash,
      onlineBalances,
      totalAvailableMoney,
      vendorPayable,
      cashSurplus,
      grossRevenue,
      cogs,
      totalExpenses,
      accountingProfit,
      isCOGSDataComplete,
    };
  },
};
