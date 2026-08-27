import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  PaymentAccount,
  Expense,
  MoneyTransaction,
} from '../types/database.types';

export const PREDEFINED_CATEGORIES = [
  'Tea & Refreshment',
  'Bags & Shoe Packaging',
  'Freight / Transport & Courier',
  'Electricity & Utilities',
  'Shop Rent (Commercial Storefront)',
  'Staff Advance & Kharcha',
  'Store Maintenance & Display',
  'Marketing & Ads',
  'Repairs & Maintenance',
  'Other',
];

export const INITIAL_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'acc-cash-01',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Cash Counter Register',
    type: 'cash',
    current_balance: 0.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-upi-02',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'UPI / QR (PhonePe/GPay)',
    type: 'upi',
    current_balance: 0.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-card-03',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Card POS Machine',
    type: 'card',
    current_balance: 0.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acc-bank-04',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Main Bank Account',
    type: 'bank',
    current_balance: 0.0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_CASHBOOK_TRANSACTIONS: MoneyTransaction[] = [];

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

    const reqApproval = payload.amount > 25000.0;
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      category_name: payload.category_name,
      title: payload.title,
      vendor_name: payload.vendor_name,
      amount: payload.amount,
      business_date: payload.business_date || new Date().toISOString().split('T')[0],
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
        business_date: payload.business_date || new Date().toISOString().split('T')[0],
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

    const vendorPayable = 0.0;
    const cashSurplus = totalAvailableMoney;

    const grossRevenue = 0.0;
    const cogs = 0.0;
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
