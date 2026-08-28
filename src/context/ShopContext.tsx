/**
 * ShopContext.tsx
 * ===============
 * Application-wide state management for Zain Footwear POS.
 * ALL data comes from Supabase — zero localStorage usage.
 * On mount, all data is fetched in parallel from Supabase.
 * All mutations (create/update/delete) call Supabase service and update React state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Organization,
  Shop,
  UserProfile,
  ActiveRole,
  PaymentAccount,
  Expense,
  Vendor,
  Purchase,
  VendorLedgerEntry,
  VendorPayment,
  Employee,
  AttendanceRecord,
  SalaryPayment,
  SaleRecord,
  CashSession,
  Customer,
  CustomerLedgerEntry,
  TodoItem,
} from '../types/database.types';
import {
  authService,
  usersService,
  shopsService,
  customersService,
  customerLedgerService,
  salesService,
  vendorsService,
  vendorLedgerService,
  vendorPaymentsService,
  purchasesService,
  expensesService,
  employeesService,
  attendanceService,
  salaryService,
  todosService,
  paymentAccountsService,
  cashSessionService,
  orgService,
  ORG_ID,
  SHOP_ID,
} from '../services/supabaseService';

// Fallback default user (used only if Supabase is unreachable)
export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'c3000000-0000-0000-0000-000000000003',
    email: 'saif@admin.com',
    username: 'saif',
    full_name: 'Saif',
    organization_id: ORG_ID,
    default_shop_id: SHOP_ID,
    is_onboarded: true,
    role: 'ADMIN',
    pin: 'Saif@Zain',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ============================================================================
// Context Type
// ============================================================================

interface ShopContextType {
  organization: Organization | null;
  shops: Shop[];
  activeShop: Shop | null;
  setActiveShop: (shop: Shop) => void;
  users: UserProfile[];
  userProfile: UserProfile | null;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  hasPermission: (permissionKey: string) => boolean;
  isLoading: boolean;
  dbError: string | null;

  loginUser: (identifier: string, pinOrPassword?: string) => Promise<{ success: boolean; message?: string }>;
  loginAsUserProfile: (user: UserProfile) => void;
  logoutUser: () => void;
  addUser: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<UserProfile>;
  updateUser: (userId: string, userData: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addShop: (shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at'>) => Promise<Shop>;
  updateShop: (shopId: string, shopData: Partial<Shop>) => Promise<void>;

  sales: SaleRecord[];
  customers: Customer[];
  customerLedgers: Record<string, CustomerLedgerEntry[]>;
  vendors: Vendor[];
  purchases: Purchase[];
  vendorLedgers: Record<string, VendorLedgerEntry[]>;
  vendorPayments: VendorPayment[];
  expenses: Expense[];
  paymentAccounts: PaymentAccount[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  salaryPayments: SalaryPayment[];
  todos: TodoItem[];
  activeCashSession: CashSession | null;

  recordSale: (saleData: Omit<SaleRecord, 'id' | 'created_at'>) => Promise<SaleRecord>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<Customer>;
  updateCustomer: (customerId: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  recordCustomerPayment: (paymentData: {
    customer_id: string;
    amount: number;
    payment_account_id?: string;
    payment_method: 'cash' | 'upi' | 'card' | 'bank';
    notes?: string;
  }) => Promise<CustomerLedgerEntry>;

  recordPurchase: (purchaseData: {
    vendor_id: string;
    bill_number: string;
    business_date: string;
    total: number;
    amount_paid: number;
    payment_account_id?: string;
    invoice_attachment_path?: string;
    notes?: string;
  }) => Promise<Purchase>;
  recordVendorPayment: (paymentData: {
    vendor_id: string;
    amount_paid: number;
    payment_account_id: string;
    payment_method: string;
    reference_notes?: string;
  }) => Promise<VendorPayment>;
  recordExpense: (expenseData: Omit<Expense, 'id' | 'created_at' | 'organization_id' | 'shop_id' | 'expense_date'>) => Promise<Expense>;
  updateExpense: (expenseId: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  recordSalaryPayment: (salaryData: {
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }) => Promise<SalaryPayment>;
  markAttendance: (employeeId: string, status: 'present' | 'absent' | 'half_day' | 'leave', notes?: string) => Promise<AttendanceRecord>;
  punchAttendance: (employeeIdOrName?: string, status?: 'present' | 'absent' | 'half_day' | 'leave', notes?: string) => Promise<AttendanceRecord>;
  addVendor: (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>) => Promise<Vendor>;
  updateVendor: (vendorId: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (vendorId: string) => Promise<void>;
  addTodo: (todoData: Omit<TodoItem, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => Promise<TodoItem>;
  toggleTodo: (todoId: string) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  openCashCounter: (openingCash: number) => Promise<CashSession>;
  closeCashCounter: (countedCash: number, reason?: string) => Promise<{ expectedCash: number; variance: number }>;
  clearAllDummyData: () => void;
  addEmployee: (employeeData: Omit<Employee, 'id' | 'created_at'>) => Promise<Employee>;
  updateEmployee: (employeeId: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>('ADMIN');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // App data state
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLedgers, setCustomerLedgers] = useState<Record<string, CustomerLedgerEntry[]>>({});
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorLedgers, setVendorLedgers] = useState<Record<string, VendorLedgerEntry[]>>({});
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [activeCashSession, setActiveCashSession] = useState<CashSession | null>(null);

  // ============================================================================
  // Helper: build ledger maps from flat arrays
  // ============================================================================

  const buildCustomerLedgerMap = (entries: CustomerLedgerEntry[]): Record<string, CustomerLedgerEntry[]> => {
    const map: Record<string, CustomerLedgerEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.customer_id]) map[e.customer_id] = [];
      map[e.customer_id].push(e);
    });
    return map;
  };

  const buildVendorLedgerMap = (entries: VendorLedgerEntry[]): Record<string, VendorLedgerEntry[]> => {
    const map: Record<string, VendorLedgerEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.vendor_id]) map[e.vendor_id] = [];
      map[e.vendor_id].push(e);
    });
    return map;
  };

  // ============================================================================
  // Initial Data Load from Supabase
  // ============================================================================

  const loadAllData = useCallback(async () => {
    try {
      const [
        orgData,
        shopData,
        usersData,
        customersData,
        customerLedgersData,
        salesData,
        vendorsData,
        vendorLedgersData,
        vendorPaymentsData,
        purchasesData,
        expensesData,
        employeesData,
        attendanceData,
        salaryData,
        todosData,
        paymentAccountsData,
        activeCashData,
      ] = await Promise.all([
        orgService.getOrg(),
        shopsService.getAll(),
        usersService.getAll(),
        customersService.getAll(),
        customerLedgerService.getAll(),
        salesService.getAll(),
        vendorsService.getAll(),
        vendorLedgerService.getAll(),
        vendorPaymentsService.getAll(),
        purchasesService.getAll(),
        expensesService.getAll(),
        employeesService.getAll(),
        attendanceService.getAll(),
        salaryService.getAll(),
        todosService.getAll(),
        paymentAccountsService.getAll(),
        cashSessionService.getActive(),
      ]);

      if (orgData) setOrganization(orgData);
      if (shopData && shopData.length > 0) {
        setShops(shopData);
        setActiveShop(shopData[0]);
      } else {
        const fallbackShop: Shop = {
          id: SHOP_ID,
          organization_id: ORG_ID,
          name: 'Zain Footwear (Main Store)',
          code: 'ZAIN-01',
          city: 'Mumbai',
          phone: '+91 98200 12345',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setShops([fallbackShop]);
        setActiveShop(fallbackShop);
      }

      // Always ensure users are loaded and Saif fallback is present if needed
      const allUsers = usersData.length > 0 ? usersData : DEFAULT_USERS;
      const hasSaif = allUsers.some((u) => u.email?.toLowerCase() === 'saif@admin.com');
      const finalUsers = hasSaif ? allUsers : [...DEFAULT_USERS, ...allUsers];
      setUsers(finalUsers);

      setCustomers(customersData);
      setCustomerLedgers(buildCustomerLedgerMap(customerLedgersData));
      setSales(salesData);
      setVendors(vendorsData);
      setVendorLedgers(buildVendorLedgerMap(vendorLedgersData));
      setVendorPayments(vendorPaymentsData);
      setPurchases(purchasesData);
      setExpenses(expensesData);
      setEmployees(employeesData);
      setAttendance(attendanceData);
      setSalaryPayments(salaryData);
      setTodos(todosData);

      if (paymentAccountsData.length > 0) {
        setPaymentAccounts(paymentAccountsData);
      } else {
        // Fallback payment accounts if Supabase seed hasn't run yet
        setPaymentAccounts([
          { id: 'd4000000-0000-0000-0000-000000000001', organization_id: ORG_ID, shop_id: SHOP_ID, name: 'Cash Counter Register', type: 'cash', current_balance: 0, is_active: true, created_at: new Date().toISOString() },
          { id: 'd4000000-0000-0000-0000-000000000002', organization_id: ORG_ID, shop_id: SHOP_ID, name: 'UPI / QR (PhonePe/GPay)', type: 'upi', current_balance: 0, is_active: true, created_at: new Date().toISOString() },
          { id: 'd4000000-0000-0000-0000-000000000003', organization_id: ORG_ID, shop_id: SHOP_ID, name: 'Card POS Machine', type: 'card', current_balance: 0, is_active: true, created_at: new Date().toISOString() },
          { id: 'd4000000-0000-0000-0000-000000000004', organization_id: ORG_ID, shop_id: SHOP_ID, name: 'Main Bank Account', type: 'bank', current_balance: 0, is_active: true, created_at: new Date().toISOString() },
        ]);
      }

      if (activeCashData) setActiveCashSession(activeCashData);
      setDbError(null);
    } catch (err: any) {
      console.error('Supabase load error:', err);
      setDbError('Database connection error. Check your internet or Supabase config.');
    }
  }, []);

  // ============================================================================
  // Bootstrap: restore session + load data
  // ============================================================================

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Restore user session
      const savedUser = authService.restoreSession();
      if (savedUser) {
        setUserProfile(savedUser);
        setActiveRole((savedUser.role as ActiveRole) || 'ADMIN');
      }

      // Load all data from Supabase
      await loadAllData();
      setIsLoading(false);
    };
    init();
  }, [loadAllData]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await loadAllData();
    setIsLoading(false);
  }, [loadAllData]);

  // ============================================================================
  // Authentication
  // ============================================================================

  const loginUser = async (identifier: string, pinOrPassword?: string): Promise<{ success: boolean; message?: string }> => {
    const { user, error } = await authService.login(identifier, pinOrPassword || '');
    if (error || !user) return { success: false, message: error || 'Invalid credentials.' };
    loginAsUserProfile(user);
    return { success: true };
  };

  const loginAsUserProfile = (user: UserProfile) => {
    const updatedUser = { ...user, last_login: new Date().toISOString() };
    setUserProfile(updatedUser);
    setActiveRole((user.role as ActiveRole) || 'ADMIN');
    authService.saveSession(updatedUser);
  };

  const logoutUser = () => {
    setUserProfile(null);
    setActiveRole('ADMIN');
    authService.clearSession();
  };

  // ============================================================================
  // User Management
  // ============================================================================

  const addUser = async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
    const newUser = await usersService.create(userData);
    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    return newUser;
  };

  const updateUser = async (userId: string, userData: Partial<UserProfile>): Promise<void> => {
    const updated = await usersService.update(userId, userData);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    if (userProfile?.id === userId) {
      loginAsUserProfile(updated);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    await usersService.remove(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Shop management persisted to Supabase
  const addShop = async (shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at'>): Promise<Shop> => {
    const newShop = await shopsService.create(shopData);
    setShops((prev) => [...prev.filter((s) => s.id !== newShop.id), newShop]);
    return newShop;
  };

  const updateShop = async (shopId: string, shopData: Partial<Shop>): Promise<void> => {
    const updated = await shopsService.update(shopId, shopData);
    setShops((prev) => prev.map((s) => (s.id === shopId ? updated : s)));
    if (activeShop?.id === shopId) setActiveShop(updated);
  };

  // Role-Based Permissions Matrix
  const ROLE_PERMISSIONS: Record<ActiveRole, string[]> = {
    ADMIN: ['*'],
    MANAGER: [
      'dashboard:view',
      'pos:create',
      'pos:view',
      'sales:view',
      'parties:view',
      'customers:view',
      'customers:manage',
      'vendors:view',
      'vendors:manage',
      'inventory:view',
      'inventory:manage',
      'expenses:view',
      'expenses:manage',
      'cash_close:manage',
      'counter:manage',
      'staff:view',
      'reports:view',
      'todos:view',
      'todos:manage',
      'my_attendance:view',
      'my_attendance:punch',
    ],
    CASHIER: [
      'dashboard:view',
      'pos:create',
      'pos:view',
      'sales:view',
      'parties:view',
      'customers:view',
      'customers:manage',
      'cash_close:manage',
      'counter:manage',
      'my_attendance:view',
      'my_attendance:punch',
      'todos:view',
      'todos:manage',
    ],
    FINANCE: [
      'dashboard:view',
      'sales:view',
      'parties:view',
      'customers:view',
      'vendors:view',
      'vendors:manage',
      'finance:view',
      'finance:manage',
      'expenses:view',
      'expenses:manage',
      'reports:view',
      'cash_close:manage',
      'counter:manage',
      'todos:view',
      'todos:manage',
      'my_attendance:view',
      'my_attendance:punch',
    ],
  };

  const hasPermission = (permissionKey: string): boolean => {
    if (activeRole === 'ADMIN') return true;
    const allowed = ROLE_PERMISSIONS[activeRole] || [];
    if (allowed.includes('*')) return true;
    return allowed.includes(permissionKey);
  };

  // ============================================================================
  // Customers
  // ============================================================================

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const initialBalance = customerData.opening_balance || 0;

    const newCustomer = await customersService.create({
      ...customerData,
      opening_balance: initialBalance,
      current_balance: initialBalance,
      total_purchases_count: 0,
      total_spent: 0,
    });

    setCustomers((prev) => [newCustomer, ...prev]);

    // Create opening balance ledger entry if non-zero
    if (initialBalance !== 0) {
      const entry = await customerLedgerService.addEntry({
        organization_id: ORG_ID,
        customer_id: newCustomer.id,
        transaction_type: 'OPENING_BALANCE',
        reference_number: 'OPEN-BAL',
        business_date: todayStr,
        debit: initialBalance > 0 ? initialBalance : 0,
        credit: initialBalance < 0 ? Math.abs(initialBalance) : 0,
        running_balance: initialBalance,
        description: 'Opening Balance Recorded',
      });
      setCustomerLedgers((prev) => ({ ...prev, [newCustomer.id]: [entry] }));
    }

    return newCustomer;
  };

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>): Promise<void> => {
    await customersService.update(customerId, customerData);
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, ...customerData, updated_at: new Date().toISOString() } : c)));
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    await customersService.remove(customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setCustomerLedgers((prev) => {
      const copy = { ...prev };
      delete copy[customerId];
      return copy;
    });
  };

  const recordCustomerPayment = async (paymentData: {
    customer_id: string;
    amount: number;
    payment_account_id?: string;
    payment_method: 'cash' | 'upi' | 'card' | 'bank';
    notes?: string;
  }): Promise<CustomerLedgerEntry> => {
    const customer = customers.find((c) => c.id === paymentData.customer_id);
    if (!customer) throw new Error('Customer not found');

    const newBalance = (customer.current_balance || 0) - paymentData.amount;
    const refNum = `PAY-${Date.now().toString().slice(-6)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const entry = await customerLedgerService.addEntry({
      organization_id: ORG_ID,
      customer_id: customer.id,
      transaction_type: 'PAYMENT',
      reference_number: refNum,
      business_date: todayStr,
      debit: 0,
      credit: paymentData.amount,
      running_balance: newBalance,
      description: paymentData.notes || `Payment Received via ${paymentData.payment_method.toUpperCase()}`,
    });

    await customersService.update(customer.id, { current_balance: newBalance });
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, current_balance: newBalance } : c)));
    setCustomerLedgers((prev) => ({ ...prev, [customer.id]: [...(prev[customer.id] || []), entry] }));

    return entry;
  };

  // ============================================================================
  // Sales
  // ============================================================================

  const recordSale = async (saleData: Omit<SaleRecord, 'id' | 'created_at'>): Promise<SaleRecord> => {
    const newSale = await salesService.create({
      ...saleData,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
    });

    setSales((prev) => [newSale, ...prev]);

    // Update customer if attached
    if (newSale.customer_id) {
      const cust = customers.find((c) => c.id === newSale.customer_id);
      const dueAmount = newSale.due_amount || 0;
      const newBalance = (cust?.current_balance || 0) + dueAmount;

      await customersService.update(newSale.customer_id, {
        current_balance: newBalance,
        total_purchases_count: (cust?.total_purchases_count || 0) + 1,
        total_spent: (cust?.total_spent || 0) + newSale.total,
        last_purchase_date: new Date().toISOString(),
      });

      setCustomers((prev) =>
        prev.map((c) => c.id === newSale.customer_id
          ? { ...c, current_balance: newBalance, total_purchases_count: (c.total_purchases_count || 0) + 1, total_spent: (c.total_spent || 0) + newSale.total }
          : c)
      );

      if (dueAmount > 0 || newSale.total > 0) {
        const entry = await customerLedgerService.addEntry({
          organization_id: ORG_ID,
          customer_id: newSale.customer_id,
          transaction_type: 'SALE',
          reference_number: newSale.receipt_number,
          business_date: new Date().toISOString().split('T')[0],
          debit: newSale.total,
          credit: newSale.total - dueAmount,
          running_balance: newBalance,
          description: `Sale #${newSale.receipt_number}${dueAmount > 0 ? ` (Due: ₹${dueAmount})` : ' (Fully Paid)'}`,
        });
        setCustomerLedgers((prev) => ({ ...prev, [newSale.customer_id!]: [...(prev[newSale.customer_id!] || []), entry] }));
      }
    }

    return newSale;
  };

  // ============================================================================
  // Vendors / Parties
  // ============================================================================

  const addVendor = async (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>): Promise<Vendor> => {
    const newVendor = await vendorsService.create(vendorData);
    setVendors((prev) => [...prev, newVendor]);

    // Opening balance ledger entry
    if (newVendor.opening_balance && newVendor.opening_balance > 0) {
      const entry = await vendorLedgerService.addEntry({
        organization_id: ORG_ID,
        vendor_id: newVendor.id,
        transaction_type: 'OPENING_BALANCE',
        reference_number: 'OPEN-BAL',
        business_date: new Date().toISOString().split('T')[0],
        debit: 0,
        credit: newVendor.opening_balance,
        running_balance: newVendor.opening_balance,
        description: 'Opening Balance Recorded',
      });
      setVendorLedgers((prev) => ({ ...prev, [newVendor.id]: [entry] }));
    }

    return newVendor;
  };

  const updateVendor = async (vendorId: string, data: Partial<Vendor>): Promise<void> => {
    await vendorsService.update(vendorId, data);
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, ...data, updated_at: new Date().toISOString() } : v)));
  };

  const deleteVendor = async (vendorId: string): Promise<void> => {
    await vendorsService.remove(vendorId);
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    setVendorLedgers((prev) => {
      const copy = { ...prev };
      delete copy[vendorId];
      return copy;
    });
  };

  // ============================================================================
  // Purchases
  // ============================================================================

  const recordPurchase = async (purchaseData: {
    vendor_id: string;
    bill_number: string;
    business_date: string;
    total: number;
    amount_paid: number;
    payment_account_id?: string;
    invoice_attachment_path?: string;
    notes?: string;
  }): Promise<Purchase> => {
    const vendor = vendors.find((v) => v.id === purchaseData.vendor_id);
    const balanceDue = purchaseData.total - purchaseData.amount_paid;
    const recDate = purchaseData.business_date || new Date().toISOString().split('T')[0];

    const newPurchase = await purchasesService.create({
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      vendor_id: purchaseData.vendor_id,
      vendor_name: vendor?.name || '',
      bill_number: purchaseData.bill_number,
      business_date: recDate,
      due_date: recDate,
      entry_type: 'amount_only',
      subtotal: purchaseData.total,
      transport_charges: 0,
      tax: 0,
      other_charges: 0,
      total: purchaseData.total,
      amount_paid: purchaseData.amount_paid,
      balance_due: balanceDue,
      payment_status: balanceDue === 0 ? 'PAID' : purchaseData.amount_paid > 0 ? 'PARTIAL' : 'PENDING',
      status: 'COMPLETED',
      notes: purchaseData.notes,
      invoice_attachment_path: purchaseData.invoice_attachment_path,
      is_immutable: false,
      is_voided: false,
    });

    setPurchases((prev) => [newPurchase, ...prev]);

    if (vendor) {
      const newCurrentBal = vendor.current_balance + balanceDue;
      await vendorsService.update(vendor.id, { current_balance: newCurrentBal });
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, current_balance: newCurrentBal, updated_at: new Date().toISOString() } : v)));

      const entry = await vendorLedgerService.addEntry({
        organization_id: ORG_ID,
        vendor_id: vendor.id,
        transaction_type: 'PURCHASE',
        reference_number: purchaseData.bill_number,
        business_date: recDate,
        debit: 0,
        credit: purchaseData.total,
        running_balance: newCurrentBal,
        description: `Purchase Bill #${purchaseData.bill_number}${purchaseData.notes ? ` - ${purchaseData.notes}` : ''}`,
      });

      setVendorLedgers((prev) => ({
        ...prev,
        [vendor.id]: [...(prev[vendor.id] || []), entry],
      }));
    }

    return newPurchase;
  };

  const recordVendorPayment = async (paymentData: {
    vendor_id: string;
    amount_paid: number;
    payment_account_id: string;
    payment_method: string;
    reference_notes?: string;
  }): Promise<VendorPayment> => {
    const vendor = vendors.find((v) => v.id === paymentData.vendor_id);
    const todayStr = new Date().toISOString().split('T')[0];
    const account = paymentAccounts.find((a) => a.id === paymentData.payment_account_id);
    const previousOutstanding = vendor?.current_balance || 0;
    const remainingOutstanding = previousOutstanding - paymentData.amount_paid;

    const newPayment = await vendorPaymentsService.create({
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      vendor_id: paymentData.vendor_id,
      vendor_name: vendor?.name || '',
      payment_date: todayStr,
      previous_outstanding: previousOutstanding,
      amount_paid: paymentData.amount_paid,
      remaining_outstanding: remainingOutstanding,
      payment_account_id: paymentData.payment_account_id,
      payment_account_name: account?.name || '',
      payment_method: paymentData.payment_method,
      reference_notes: paymentData.reference_notes,
    });

    setVendorPayments((prev) => [newPayment, ...prev]);

    if (vendor) {
      await vendorsService.update(vendor.id, { current_balance: remainingOutstanding });
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, current_balance: remainingOutstanding, updated_at: new Date().toISOString() } : v)));

      const entry = await vendorLedgerService.addEntry({
        organization_id: ORG_ID,
        vendor_id: vendor.id,
        transaction_type: 'PAYMENT',
        reference_number: `VPAY-${Date.now().toString().slice(-6)}`,
        business_date: todayStr,
        debit: paymentData.amount_paid,
        credit: 0,
        running_balance: remainingOutstanding,
        description: `Payment via ${paymentData.payment_method}${paymentData.reference_notes ? ` (${paymentData.reference_notes})` : ''}`,
      });

      setVendorLedgers((prev) => ({
        ...prev,
        [vendor.id]: [...(prev[vendor.id] || []), entry],
      }));
    }

    return newPayment;
  };

  // ============================================================================
  // Expenses
  // ============================================================================

  const recordExpense = async (
    expenseData: Omit<Expense, 'id' | 'created_at' | 'organization_id' | 'shop_id' | 'expense_date'>
  ): Promise<Expense> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newExp = await expensesService.create({
      ...expenseData,
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      business_date: expenseData.business_date || todayStr,
      expense_date: new Date().toISOString(),
    });
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const updateExpense = async (expenseId: string, data: Partial<Expense>): Promise<void> => {
    await expensesService.update(expenseId, data);
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, ...data } : e)));
  };

  const deleteExpense = async (expenseId: string): Promise<void> => {
    await expensesService.remove(expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // ============================================================================
  // Employees
  // ============================================================================

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> => {
    const newEmp = await employeesService.create(employeeData);
    setEmployees((prev) => [...prev, newEmp]);
    return newEmp;
  };

  const updateEmployee = async (employeeId: string, data: Partial<Employee>): Promise<void> => {
    await employeesService.update(employeeId, data);
    setEmployees((prev) => prev.map((e) => (e.id === employeeId ? { ...e, ...data } : e)));
  };

  const deleteEmployee = async (employeeId: string): Promise<void> => {
    await employeesService.remove(employeeId);
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  };

  // ============================================================================
  // Attendance
  // ============================================================================

  const markAttendance = async (
    employeeId: string,
    status: 'present' | 'absent' | 'half_day' | 'leave',
    notes?: string
  ): Promise<AttendanceRecord> => {
    const emp = employees.find((e) => e.id === employeeId);
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const record = await attendanceService.upsert({
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      employee_id: employeeId,
      employee_name: emp?.full_name || 'Staff',
      attendance_date: todayStr,
      status,
      check_in_time: status === 'present' || status === 'half_day' ? new Date().toTimeString().slice(0, 8) : undefined,
      manager_notes: notes,
    });

    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.employee_id === employeeId && a.attendance_date === todayStr));
      return [record, ...filtered];
    });

    return record;
  };

  const punchAttendance = async (
    employeeIdOrName?: string,
    status: 'present' | 'absent' | 'half_day' | 'leave' = 'present',
    notes?: string
  ): Promise<AttendanceRecord> => {
    const targetId = employeeIdOrName || userProfile?.id || `emp_${Date.now()}`;
    const targetName = userProfile?.full_name || 'Saif';
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const record = await attendanceService.upsert({
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      employee_id: targetId,
      employee_name: targetName,
      attendance_date: now.toISOString().split('T')[0],
      status,
      check_in_time: timeFormatted,
      manager_notes: notes || `Punched via POS terminal by ${userProfile?.username || 'Saif'}`,
    });

    setAttendance((prev) => [record, ...prev.filter((a) => a.employee_id !== targetId || a.attendance_date !== record.attendance_date)]);
    return record;
  };

  // ============================================================================
  // Salary
  // ============================================================================

  const recordSalaryPayment = async (salaryData: {
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }): Promise<SalaryPayment> => {
    const emp = employees.find((e) => e.id === salaryData.employee_id);
    const netSalary = salaryData.gross_salary - salaryData.deductions - salaryData.advances;
    const nowIso = new Date().toISOString();

    const newSalary = await salaryService.create({
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      employee_id: salaryData.employee_id,
      employee_name: emp?.full_name || '',
      month_year: nowIso.slice(0, 7),
      payment_date: nowIso.split('T')[0],
      gross_salary: salaryData.gross_salary,
      deductions: salaryData.deductions,
      advances: salaryData.advances,
      net_salary: netSalary,
      net_salary_paid: netSalary,
      payment_account_id: salaryData.payment_account_id,
      payment_reference: salaryData.payment_reference || '',
      status: 'PAID',
    });

    setSalaryPayments((prev) => [newSalary, ...prev]);
    return newSalary;
  };

  // ============================================================================
  // Todos
  // ============================================================================

  const addTodo = async (todoData: Omit<TodoItem, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Promise<TodoItem> => {
    const newTodo = await todosService.create({
      ...todoData,
      created_by_user_id: userProfile?.id,
      created_by_name: userProfile?.full_name,
    });
    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  };

  const toggleTodo = async (todoId: string): Promise<void> => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    const nowIso = new Date().toISOString();
    const updates = {
      is_completed: !todo.is_completed,
      completed_at: !todo.is_completed ? nowIso : undefined,
      updated_at: nowIso,
    };
    await todosService.update(todoId, updates);
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t)));
  };

  const deleteTodo = async (todoId: string): Promise<void> => {
    await todosService.remove(todoId);
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  // ============================================================================
  // Cash Sessions
  // ============================================================================

  const openCashCounter = async (openingCash: number): Promise<CashSession> => {
    const nowIso = new Date().toISOString();
    const newSession = await cashSessionService.create({
      organization_id: ORG_ID,
      shop_id: SHOP_ID,
      cashier_id: userProfile?.id,
      business_date: nowIso.split('T')[0],
      opened_at: nowIso,
      opening_cash: openingCash,
      expected_cash: openingCash,
      requires_approval: false,
      status: 'OPEN',
    });
    setActiveCashSession(newSession);
    return newSession;
  };

  const closeCashCounter = async (countedCash: number, reason?: string): Promise<{ expectedCash: number; variance: number }> => {
    const opening = activeCashSession?.opening_cash || 0;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const cashSalesToday = sales
      .filter((s) => s.created_at.split('T')[0] === todayStr)
      .reduce((sum, s) => sum + (s.cash_amount || 0), 0);

    const expectedCash = opening + cashSalesToday;
    const variance = countedCash - expectedCash;

    if (activeCashSession) {
      const updates: Partial<CashSession> = {
        closed_at: nowIso,
        counted_cash: countedCash,
        expected_cash: expectedCash,
        variance,
        variance_reason: reason,
        status: 'CLOSED',
      };
      await cashSessionService.close(activeCashSession.id, updates);
      setActiveCashSession((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return { expectedCash, variance };
  };

  // ============================================================================
  // Misc
  // ============================================================================

  const clearAllDummyData = () => {
    // No-op in Supabase mode — data lives in the cloud
    console.warn('clearAllDummyData is not applicable in Supabase mode.');
  };

  // ============================================================================
  // Context Value
  // ============================================================================

  return (
    <ShopContext.Provider
      value={{
        organization,
        shops,
        activeShop,
        setActiveShop,
        users,
        userProfile,
        activeRole,
        setActiveRole,
        hasPermission,
        isLoading,
        dbError,

        loginUser,
        loginAsUserProfile,
        logoutUser,
        addUser,
        updateUser,
        deleteUser,
        addShop,
        updateShop,

        sales,
        customers,
        customerLedgers,
        vendors,
        purchases,
        vendorLedgers,
        vendorPayments,
        expenses,
        paymentAccounts,
        employees,
        attendance,
        salaryPayments,
        todos,
        activeCashSession,

        recordSale,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,

        recordPurchase,
        recordVendorPayment,
        recordExpense,
        updateExpense,
        deleteExpense,
        recordSalaryPayment,
        markAttendance,
        punchAttendance,
        addVendor,
        updateVendor,
        deleteVendor,
        addTodo,
        toggleTodo,
        deleteTodo,
        openCashCounter,
        closeCashCounter,
        clearAllDummyData,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        refreshData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};

export default ShopProvider;
