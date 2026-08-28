/**
 * supabaseService.ts
 * ==================
 * Centralized Supabase data access layer for Zain Footwear POS.
 * All CRUD operations for every entity go through this service.
 * Frontend components never touch localStorage — all data lives in Supabase.
 */

import { supabase } from '../lib/supabaseClient';
import type {
  Organization,
  Shop,
  UserProfile,
  SystemRole,
  Customer,
  CustomerLedgerEntry,
  SaleRecord,
  Vendor,
  VendorLedgerEntry,
  VendorPayment,
  Purchase,
  Expense,
  Employee,
  AttendanceRecord,
  SalaryPayment,
  TodoItem,
  PaymentAccount,
  CashSession,
} from '../types/database.types';

// Fixed org/shop IDs seeded in Supabase
export const ORG_ID = 'a1000000-0000-0000-0000-000000000001';
export const SHOP_ID = 'b2000000-0000-0000-0000-000000000002';

// ============================================================================
// PAYMENT ACCOUNT & UUID HELPERS
// ============================================================================

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const DEFAULT_PAYMENT_ACCOUNTS_MAP: Record<string, string> = {
  'acc-cash-01': 'd4000000-0000-0000-0000-000000000001',
  'acc-upi-02': 'd4000000-0000-0000-0000-000000000002',
  'acc-card-03': 'd4000000-0000-0000-0000-000000000003',
  'acc-bank-04': 'd4000000-0000-0000-0000-000000000004',
};

export const sanitizePaymentAccountId = (id?: string | null): string | null => {
  if (!id) return null;
  if (DEFAULT_PAYMENT_ACCOUNTS_MAP[id]) return DEFAULT_PAYMENT_ACCOUNTS_MAP[id];
  if (UUID_REGEX.test(id)) return id;
  return 'd4000000-0000-0000-0000-000000000004';
};

// ============================================================================
// AUTH — Custom email+PIN login (no Supabase Auth)
// ============================================================================

export const authService = {
  /** Login by looking up email/username + PIN in user_profiles table */
  async login(identifier: string, pin: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`email.ilike.${cleanIdent},username.ilike.${cleanIdent}`)
        .eq('status', 'Active')
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { user: null, error: 'Invalid email/username or PIN.' };
      }

      if (data.pin !== cleanPin && data.password !== cleanPin) {
        return { user: null, error: 'Invalid PIN or password.' };
      }

      // Update last_login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      return { user: { ...data, last_login: new Date().toISOString() }, error: null };
    } catch (err: any) {
      console.error('Login error:', err);
      return { user: null, error: err?.message || 'Authentication failed. Please try again.' };
    }
  },

  /** Save current user session to sessionStorage (not localStorage — cleared on tab close) */
  saveSession(user: UserProfile) {
    sessionStorage.setItem('zain_session_user', JSON.stringify(user));
  },

  /** Restore session from sessionStorage */
  restoreSession(): UserProfile | null {
    try {
      const saved = sessionStorage.getItem('zain_session_user');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  },

  /** Clear session */
  clearSession() {
    sessionStorage.removeItem('zain_session_user');
  },
};

// ============================================================================
// USERS
// ============================================================================

export const usersService = {
  async getAll(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch user_profiles:', error);
      throw error;
    }
    return data || [];
  },

  async create(userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const cleanUserData = {
      email: userData.email.trim().toLowerCase(),
      username: (userData.username || userData.email.split('@')[0]).trim().toLowerCase(),
      full_name: userData.full_name?.trim() || '',
      organization_id: ORG_ID,
      default_shop_id: userData.default_shop_id && !userData.default_shop_id.startsWith('shop_') ? userData.default_shop_id : SHOP_ID,
      role: (userData.role?.toUpperCase() || 'CASHIER') as SystemRole,
      pin: userData.pin?.trim() || '1234',
      status: userData.status || 'Active',
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(cleanUserData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting into user_profiles:', error);
      throw error;
    }
    return data;
  },

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const cleanUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.full_name !== undefined) cleanUpdates.full_name = updates.full_name.trim();
    if (updates.email !== undefined) cleanUpdates.email = updates.email.trim().toLowerCase();
    if (updates.username !== undefined) cleanUpdates.username = updates.username.trim().toLowerCase();
    if (updates.role !== undefined) cleanUpdates.role = updates.role.toUpperCase();
    if (updates.pin !== undefined) cleanUpdates.pin = updates.pin.trim();
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.default_shop_id !== undefined && !updates.default_shop_id.startsWith('shop_')) {
      cleanUpdates.default_shop_id = updates.default_shop_id;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(cleanUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating user_profiles:', error);
      throw error;
    }
    return data;
  },

  async remove(userId: string): Promise<void> {
    const { error } = await supabase.from('user_profiles').delete().eq('id', userId);
    if (error) {
      console.error('Supabase error deleting from user_profiles:', error);
      throw error;
    }
  },
};

// ============================================================================
// CUSTOMERS
// ============================================================================

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        organization_id: ORG_ID,
        shop_id: SHOP_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(customerId: string, updates: Partial<Customer>): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', customerId);
    if (error) throw error;
  },

  async remove(customerId: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) throw error;
  },
};

// ============================================================================
// CUSTOMER LEDGER
// ============================================================================

export const customerLedgerService = {
  async getByCustomer(customerId: string): Promise<CustomerLedgerEntry[]> {
    const { data, error } = await supabase
      .from('customer_ledger_entries')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAll(): Promise<CustomerLedgerEntry[]> {
    const { data, error } = await supabase
      .from('customer_ledger_entries')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addEntry(entry: Omit<CustomerLedgerEntry, 'id' | 'created_at'>): Promise<CustomerLedgerEntry> {
    const cleanEntry = {
      ...entry,
      organization_id: ORG_ID,
      customer_id: UUID_REGEX.test(entry.customer_id) ? entry.customer_id : undefined,
      debit: Number(entry.debit) || 0,
      credit: Number(entry.credit) || 0,
      running_balance: Number(entry.running_balance) || 0,
    };
    const { data, error } = await supabase
      .from('customer_ledger_entries')
      .insert(cleanEntry)
      .select()
      .single();
    if (error) {
      console.error('Failed to add customer ledger entry:', error);
      throw error;
    }
    return data;
  },
};

// ============================================================================
// SALES
// ============================================================================

export const salesService = {
  async getAll(): Promise<SaleRecord[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`*, sale_items(*), sale_payments(*)`)
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch sales:', error);
      throw error;
    }

    return (data || []).map((s: any) => ({
      ...s,
      items: s.sale_items || [],
      payments: s.sale_payments || [],
    }));
  },

  async create(saleData: Omit<SaleRecord, 'id' | 'created_at'>): Promise<SaleRecord> {
    // Insert sale record with sanitized UUIDs and numbers
    const { items, payments, ...saleRow } = saleData as any;
    const cleanSaleRow = {
      ...saleRow,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      created_by_user_id: UUID_REGEX.test(saleRow.created_by_user_id) ? saleRow.created_by_user_id : null,
      customer_id: UUID_REGEX.test(saleRow.customer_id) ? saleRow.customer_id : null,
      subtotal: Number(saleRow.subtotal) || 0,
      discount: Number(saleRow.discount) || 0,
      tax: Number(saleRow.tax) || 0,
      total: Number(saleRow.total) || 0,
      cash_amount: Number(saleRow.cash_amount) || 0,
      online_amount: Number(saleRow.online_amount) || 0,
      due_amount: Number(saleRow.due_amount) || 0,
    };

    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert(cleanSaleRow)
      .select()
      .single();
    if (saleErr) {
      console.error('Failed to insert sale:', saleErr);
      throw saleErr;
    }

    // Insert sale items
    if (items && items.length > 0) {
      const itemRows = items.map((item: any) => ({
        ...item,
        sale_id: sale.id,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        total_price: Number(item.total_price) || 0,
      }));
      const { error: itemsErr } = await supabase.from('sale_items').insert(itemRows);
      if (itemsErr) {
        console.error('Failed to insert sale items:', itemsErr);
        throw itemsErr;
      }
    }

    // Insert sale payments
    if (payments && payments.length > 0) {
      const payRows = payments.map((p: any) => ({
        ...p,
        sale_id: sale.id,
        amount: Number(p.amount) || 0,
      }));
      const { error: payErr } = await supabase.from('sale_payments').insert(payRows);
      if (payErr) {
        console.error('Failed to insert sale payments:', payErr);
        throw payErr;
      }
    }

    return { ...sale, items: items || [], payments: payments || [] };
  },
};

// ============================================================================
// VENDORS / PARTIES
// ============================================================================

export const vendorsService = {
  async getAll(): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        ...vendorData,
        organization_id: ORG_ID,
        current_balance: vendorData.opening_balance || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(vendorId: string, updates: Partial<Vendor>): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', vendorId);
    if (error) throw error;
  },

  async remove(vendorId: string): Promise<void> {
    const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) throw error;
  },
};

// ============================================================================
// VENDOR LEDGER
// ============================================================================

export const vendorLedgerService = {
  async getAll(): Promise<VendorLedgerEntry[]> {
    const { data, error } = await supabase
      .from('vendor_ledger_entries')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getByVendor(vendorId: string): Promise<VendorLedgerEntry[]> {
    const { data, error } = await supabase
      .from('vendor_ledger_entries')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addEntry(entry: Omit<VendorLedgerEntry, 'id' | 'created_at'>): Promise<VendorLedgerEntry> {
    const cleanEntry = {
      ...entry,
      organization_id: ORG_ID,
      vendor_id: UUID_REGEX.test(entry.vendor_id) ? entry.vendor_id : undefined,
      debit: Number(entry.debit) || 0,
      credit: Number(entry.credit) || 0,
      running_balance: Number(entry.running_balance) || 0,
    };
    const { data, error } = await supabase
      .from('vendor_ledger_entries')
      .insert(cleanEntry)
      .select()
      .single();
    if (error) {
      console.error('Failed to add vendor ledger entry:', error);
      throw error;
    }
    return data;
  },
};

// ============================================================================
// VENDOR PAYMENTS
// ============================================================================

export const vendorPaymentsService = {
  async getAll(): Promise<VendorPayment[]> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(paymentData: Omit<VendorPayment, 'id' | 'created_at'>): Promise<VendorPayment> {
    const cleanPaymentAccountId = sanitizePaymentAccountId(paymentData.payment_account_id);
    const { data, error } = await supabase
      .from('vendor_payments')
      .insert({
        ...paymentData,
        payment_account_id: cleanPaymentAccountId,
        organization_id: ORG_ID,
        shop_id: SHOP_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// PURCHASES
// ============================================================================

export const purchasesService = {
  async getAll(): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(purchaseData: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase> {
    const cleanPurchase = {
      ...purchaseData,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      vendor_id: UUID_REGEX.test(purchaseData.vendor_id) ? purchaseData.vendor_id : undefined,
      subtotal: Number(purchaseData.subtotal) || 0,
      transport_charges: Number(purchaseData.transport_charges) || 0,
      tax: Number(purchaseData.tax) || 0,
      other_charges: Number(purchaseData.other_charges) || 0,
      total: Number(purchaseData.total) || 0,
      amount_paid: Number(purchaseData.amount_paid) || 0,
      balance_due: Number(purchaseData.balance_due) || 0,
    };
    const { data, error } = await supabase
      .from('purchases')
      .insert(cleanPurchase)
      .select()
      .single();
    if (error) {
      console.error('Failed to create purchase:', error);
      throw error;
    }
    return data;
  },

  async update(purchaseId: string, updates: Partial<Purchase>): Promise<void> {
    const { error } = await supabase
      .from('purchases')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', purchaseId);
    if (error) throw error;
  },
};

// ============================================================================
// EXPENSES
// ============================================================================

export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const cleanPaymentAccountId = sanitizePaymentAccountId(expenseData.payment_account_id);
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        payment_account_id: cleanPaymentAccountId,
        organization_id: ORG_ID,
        shop_id: SHOP_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(expenseId: string, updates: Partial<Expense>): Promise<void> {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.payment_account_id !== undefined) {
      cleanUpdates.payment_account_id = sanitizePaymentAccountId(cleanUpdates.payment_account_id) as any;
    }
    const { error } = await supabase.from('expenses').update(cleanUpdates).eq('id', expenseId);
    if (error) throw error;
  },

  async remove(expenseId: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;
  },
};

// ============================================================================
// EMPLOYEES
// ============================================================================

export const employeesService = {
  async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(employeeData: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({ ...employeeData, organization_id: ORG_ID, shop_id: SHOP_ID })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(employeeId: string, updates: Partial<Employee>): Promise<void> {
    const { error } = await supabase.from('employees').update(updates).eq('id', employeeId);
    if (error) throw error;
  },

  async remove(employeeId: string): Promise<void> {
    const { error } = await supabase.from('employees').delete().eq('id', employeeId);
    if (error) throw error;
  },
};

// ============================================================================
// ATTENDANCE
// ============================================================================

export const attendanceService = {
  async getAll(): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('attendance_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upsert(record: Omit<AttendanceRecord, 'id' | 'created_at'>): Promise<AttendanceRecord> {
    const cleanRecord = {
      ...record,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      employee_id: UUID_REGEX.test(record.employee_id) ? record.employee_id : 'c3000000-0000-0000-0000-000000000003',
    };
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(cleanRecord, { onConflict: 'employee_id,attendance_date' })
      .select()
      .single();
    if (error) {
      console.error('Failed to upsert attendance record:', error);
      throw error;
    }
    return data;
  },
};

// ============================================================================
// SALARY PAYMENTS
// ============================================================================

export const salaryService = {
  async getAll(): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(salaryData: Omit<SalaryPayment, 'id' | 'created_at'>): Promise<SalaryPayment> {
    const cleanPaymentAccountId = sanitizePaymentAccountId(salaryData.payment_account_id);
    const { data, error } = await supabase
      .from('salary_payments')
      .insert({
        ...salaryData,
        payment_account_id: cleanPaymentAccountId,
        organization_id: ORG_ID,
        shop_id: SHOP_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// TODOS
// ============================================================================

export const todosService = {
  async getAll(): Promise<TodoItem[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(todoData: Omit<TodoItem, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Promise<TodoItem> {
    const cleanTodo = {
      ...todoData,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      created_by_user_id: todoData.created_by_user_id && UUID_REGEX.test(todoData.created_by_user_id) ? todoData.created_by_user_id : null,
    };
    const { data, error } = await supabase
      .from('todos')
      .insert(cleanTodo)
      .select()
      .single();
    if (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
    return data;
  },

  async update(todoId: string, updates: Partial<TodoItem>): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', todoId);
    if (error) throw error;
  },

  async remove(todoId: string): Promise<void> {
    const { error } = await supabase.from('todos').delete().eq('id', todoId);
    if (error) throw error;
  },
};

// ============================================================================
// PAYMENT ACCOUNTS
// ============================================================================

export const paymentAccountsService = {
  async getAll(): Promise<PaymentAccount[]> {
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('*')
      .eq('organization_id', ORG_ID)
      .eq('is_active', true)
      .order('type', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    const { error } = await supabase
      .from('payment_accounts')
      .update({ current_balance: newBalance })
      .eq('id', accountId);
    if (error) throw error;
  },
};

// ============================================================================
// CASH SESSIONS
// ============================================================================

export const cashSessionService = {
  async getActive(): Promise<CashSession | null> {
    const { data } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('organization_id', ORG_ID)
      .eq('status', 'OPEN')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },

  async create(sessionData: Omit<CashSession, 'id' | 'created_at'>): Promise<CashSession> {
    const cleanSession = {
      ...sessionData,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      cashier_id: sessionData.cashier_id && UUID_REGEX.test(sessionData.cashier_id) ? sessionData.cashier_id : null,
      opening_cash: Number(sessionData.opening_cash) || 0,
      expected_cash: Number(sessionData.expected_cash) || 0,
    };
    const { data, error } = await supabase
      .from('cash_sessions')
      .insert(cleanSession)
      .select()
      .single();
    if (error) {
      console.error('Failed to create cash session:', error);
      throw error;
    }
    return data;
  },

  async close(sessionId: string, updates: Partial<CashSession>): Promise<void> {
    const { error } = await supabase
      .from('cash_sessions')
      .update(updates)
      .eq('id', sessionId);
    if (error) throw error;
  },
};



// ============================================================================
// SHOPS / STORE BRANCHES
// ============================================================================

export const shopsService = {
  async getAll(): Promise<Shop[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Failed to fetch shops:', error);
      throw error;
    }
    return data || [];
  },

  async create(shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at'>): Promise<Shop> {
    const cleanShop = {
      name: shopData.name.trim(),
      code: shopData.code?.trim() || `ZAIN-0${Date.now().toString().slice(-2)}`,
      phone: shopData.phone?.trim() || '',
      email: shopData.email?.trim().toLowerCase() || '',
      address_line_1: shopData.address_line_1?.trim() || '',
      city: shopData.city?.trim() || 'Mumbai',
      postcode: shopData.postcode?.trim() || '',
      gstin: shopData.gstin?.trim() || '27AAACZ9999F1Z5',
      is_active: shopData.is_active !== undefined ? shopData.is_active : true,
      organization_id: ORG_ID,
    };

    const { data, error } = await supabase
      .from('shops')
      .insert(cleanShop)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert shop:', error);
      throw error;
    }
    return data;
  },

  async update(shopId: string, updates: Partial<Shop>): Promise<Shop> {
    const cleanUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.code !== undefined) cleanUpdates.code = updates.code.trim();
    if (updates.phone !== undefined) cleanUpdates.phone = updates.phone.trim();
    if (updates.email !== undefined) cleanUpdates.email = updates.email.trim().toLowerCase();
    if (updates.address_line_1 !== undefined) cleanUpdates.address_line_1 = updates.address_line_1.trim();
    if (updates.city !== undefined) cleanUpdates.city = updates.city.trim();
    if (updates.postcode !== undefined) cleanUpdates.postcode = updates.postcode.trim();
    if (updates.gstin !== undefined) cleanUpdates.gstin = updates.gstin.trim();
    if (updates.is_active !== undefined) cleanUpdates.is_active = updates.is_active;

    const { data, error } = await supabase
      .from('shops')
      .update(cleanUpdates)
      .eq('id', shopId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update shop:', error);
      throw error;
    }
    return data;
  },

  async remove(shopId: string): Promise<void> {
    const { error } = await supabase.from('shops').delete().eq('id', shopId);
    if (error) {
      console.error('Failed to delete shop:', error);
      throw error;
    }
  },
};

// ============================================================================
// ORGANIZATION & SHOP INFO
// ============================================================================

export const orgService = {
  async getOrg(): Promise<Organization | null> {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', ORG_ID)
      .single();
    return data || null;
  },

  async getShop(): Promise<Shop | null> {
    const { data } = await supabase
      .from('shops')
      .select('*')
      .eq('id', SHOP_ID)
      .single();
    return data || null;
  },
};
