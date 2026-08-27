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
// AUTH — Custom email+PIN login (no Supabase Auth)
// ============================================================================

export const authService = {
  /** Login by looking up email + PIN in user_profiles table */
  async login(email: string, pin: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .eq('status', 'Active')
      .single();

    if (error || !data) {
      return { user: null, error: 'Invalid email/username or password.' };
    }

    if (data.pin !== cleanPin) {
      return { user: null, error: 'Invalid email/username or password.' };
    }

    // Update last_login
    await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    return { user: { ...data, last_login: new Date().toISOString() }, error: null };
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
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        ...userData,
        organization_id: ORG_ID,
        default_shop_id: SHOP_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId: string): Promise<void> {
    const { error } = await supabase.from('user_profiles').delete().eq('id', userId);
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('customer_ledger_entries')
      .insert({ ...entry, organization_id: ORG_ID })
      .select()
      .single();
    if (error) throw error;
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
    if (error) throw error;

    return (data || []).map((s: any) => ({
      ...s,
      items: s.sale_items || [],
      payments: s.sale_payments || [],
    }));
  },

  async create(saleData: Omit<SaleRecord, 'id' | 'created_at'>): Promise<SaleRecord> {
    // Insert sale record
    const { items, payments, ...saleRow } = saleData as any;
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({ ...saleRow, organization_id: ORG_ID, shop_id: SHOP_ID })
      .select()
      .single();
    if (saleErr) throw saleErr;

    // Insert sale items
    if (items && items.length > 0) {
      const itemRows = items.map((item: any) => ({ ...item, sale_id: sale.id }));
      const { error: itemsErr } = await supabase.from('sale_items').insert(itemRows);
      if (itemsErr) throw itemsErr;
    }

    // Insert sale payments
    if (payments && payments.length > 0) {
      const payRows = payments.map((p: any) => ({ ...p, sale_id: sale.id }));
      const { error: payErr } = await supabase.from('sale_payments').insert(payRows);
      if (payErr) throw payErr;
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
    const { data, error } = await supabase
      .from('vendor_ledger_entries')
      .insert({ ...entry, organization_id: ORG_ID })
      .select()
      .single();
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('vendor_payments')
      .insert({ ...paymentData, organization_id: ORG_ID, shop_id: SHOP_ID })
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
    const { data, error } = await supabase
      .from('purchases')
      .insert({ ...purchaseData, organization_id: ORG_ID, shop_id: SHOP_ID })
      .select()
      .single();
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expenseData, organization_id: ORG_ID, shop_id: SHOP_ID })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(expenseId: string, updates: Partial<Expense>): Promise<void> {
    const { error } = await supabase.from('expenses').update(updates).eq('id', expenseId);
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
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(
        { ...record, organization_id: ORG_ID, shop_id: SHOP_ID },
        { onConflict: 'employee_id,attendance_date' }
      )
      .select()
      .single();
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('salary_payments')
      .insert({ ...salaryData, organization_id: ORG_ID, shop_id: SHOP_ID })
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
    const { data, error } = await supabase
      .from('todos')
      .insert({ ...todoData, organization_id: ORG_ID, shop_id: SHOP_ID })
      .select()
      .single();
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('cash_sessions')
      .insert({ ...sessionData, organization_id: ORG_ID, shop_id: SHOP_ID })
      .select()
      .single();
    if (error) throw error;
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
