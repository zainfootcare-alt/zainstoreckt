import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'saif@admin.com',
    username: 'saif',
    full_name: 'Saif',
    organization_id: 'org-footwear-101',
    default_shop_id: 'shop-mumbai-01',
    is_onboarded: true,
    role: 'ADMIN',
    pin: 'Saif@Zain',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 100% Clean Empty Default States (Zero Dummy/Mock Data)
const DEFAULT_CUSTOMERS: Customer[] = [];
const DEFAULT_CUSTOMER_LEDGERS: Record<string, CustomerLedgerEntry[]> = {};
const DEFAULT_SALES: SaleRecord[] = [];
const DEFAULT_VENDORS: Vendor[] = [];
const DEFAULT_VENDOR_LEDGERS: Record<string, VendorLedgerEntry[]> = {};
const DEFAULT_PURCHASES: Purchase[] = [];
const DEFAULT_EXPENSES: Expense[] = [];
const DEFAULT_EMPLOYEES: Employee[] = [];
const DEFAULT_ATTENDANCE: AttendanceRecord[] = [];
const DEFAULT_SALARIES: SalaryPayment[] = [];
const DEFAULT_TODOS: TodoItem[] = [];

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

  loginUser: (identifier: string, pinOrPassword?: string) => { success: boolean; message?: string };
  loginAsUserProfile: (user: UserProfile) => void;
  logoutUser: () => void;
  addUser: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => UserProfile;
  updateUser: (userId: string, userData: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  addShop: (shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at'>) => Shop;
  updateShop: (shopId: string, shopData: Partial<Shop>) => void;

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

  recordSale: (saleData: Omit<SaleRecord, 'id' | 'created_at'>) => SaleRecord;
  addCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Customer;
  updateCustomer: (customerId: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  recordCustomerPayment: (paymentData: {
    customer_id: string;
    amount: number;
    payment_account_id?: string;
    payment_method: 'cash' | 'upi' | 'card' | 'bank';
    notes?: string;
  }) => CustomerLedgerEntry;

  recordPurchase: (purchaseData: {
    vendor_id: string;
    bill_number: string;
    business_date: string;
    total: number;
    amount_paid: number;
    payment_account_id?: string;
    invoice_attachment_path?: string;
    notes?: string;
  }) => Purchase;
  recordVendorPayment: (paymentData: {
    vendor_id: string;
    amount_paid: number;
    payment_account_id: string;
    payment_method: string;
    reference_notes?: string;
  }) => VendorPayment;
  recordExpense: (expenseData: Omit<Expense, 'id' | 'created_at' | 'organization_id' | 'shop_id' | 'expense_date'>) => Expense;
  updateExpense: (expenseId: string, data: Partial<Expense>) => void;
  deleteExpense: (expenseId: string) => void;
  recordSalaryPayment: (salaryData: {
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }) => SalaryPayment;
  markAttendance: (employeeId: string, status: 'present' | 'absent' | 'half_day' | 'leave', notes?: string) => AttendanceRecord;
  punchAttendance: (employeeIdOrName?: string, status?: 'present' | 'absent' | 'half_day' | 'leave', notes?: string) => AttendanceRecord;
  addVendor: (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>) => Vendor;
  updateVendor: (vendorId: string, data: Partial<Vendor>) => void;
  deleteVendor: (vendorId: string) => void;
  addTodo: (todoData: Omit<TodoItem, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => TodoItem;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  openCashCounter: (openingCash: number) => CashSession;
  closeCashCounter: (countedCash: number, reason?: string) => { expectedCash: number; variance: number };
  clearAllDummyData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Wipe all customer, party, sales, and non-saif user data on schema initialization
  useEffect(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) {
      localStorage.removeItem('zain_pos_customers');
      localStorage.removeItem('zain_pos_customer_ledgers');
      localStorage.removeItem('zain_pos_sales');
      localStorage.removeItem('zain_pos_vendors');
      localStorage.removeItem('zain_pos_vendor_ledgers');
      localStorage.removeItem('zain_pos_expenses');
      localStorage.removeItem('zain_pos_employees');
      localStorage.removeItem('zain_pos_attendance');
      localStorage.removeItem('zain_pos_salary_payments');
      localStorage.removeItem('zain_pos_todos');
      localStorage.removeItem('zain_pos_users');
      localStorage.removeItem('zain_pos_current_user');
      localStorage.removeItem('zain_pos_products');
      localStorage.removeItem('zain_pos_cart');
      localStorage.setItem('zain_pos_current_user', JSON.stringify(DEFAULT_USERS[0]));
      localStorage.setItem('zain_pos_users', JSON.stringify(DEFAULT_USERS));
      localStorage.setItem('zain_pos_db_fresh_saif_only_v20', 'true');
    }
  }, []);

  const [organization] = useState<Organization | null>({
    id: 'org-footwear-101',
    name: 'Zain Footwear',
    currency: 'INR',
    tax_rate: 12.0,
    gstin: '27AAAAA0000A1Z5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('zain_pos_shops');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return [
      {
        id: 'shop-mumbai-01',
        organization_id: 'org-footwear-101',
        name: 'Zain Footwear (Main Store)',
        code: 'ZAIN-01',
        phone: '+91 98200 12345',
        email: 'saif@admin.com',
        address_line_1: 'Main Market Road, Linking Road',
        city: 'Mumbai',
        postcode: '400050',
        gstin: '27AAACZ9999F1Z5',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_shops', JSON.stringify(shops));
  }, [shops]);

  const [activeShop, setActiveShop] = useState<Shop | null>(shops[0]);

  // Strictly only saif@admin.com user
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_USERS;
    const saved = localStorage.getItem('zain_pos_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const saifOnly = parsed.filter((u: any) => u.email?.toLowerCase() === 'saif@admin.com');
          if (saifOnly.length > 0) return saifOnly;
        }
      } catch (e) {
        /* fallback */
      }
    }
    return DEFAULT_USERS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_USERS[0];
    const savedUser = localStorage.getItem('zain_pos_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email?.toLowerCase() === 'saif@admin.com') return parsed;
      } catch (e) {
        return DEFAULT_USERS[0];
      }
    }
    return DEFAULT_USERS[0];
  });

  const [activeRole, setActiveRole] = useState<ActiveRole>(() => {
    const savedUser = localStorage.getItem('zain_pos_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return (parsed.role as ActiveRole) || 'ADMIN';
      } catch (e) {
        return 'ADMIN';
      }
    }
    return 'ADMIN';
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_users', JSON.stringify(users));
  }, [users]);

  // Clean Zero-data state for Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_CUSTOMERS;
    const saved = localStorage.getItem('zain_pos_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CUSTOMERS;
      }
    }
    return DEFAULT_CUSTOMERS;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_customers', JSON.stringify(customers));
  }, [customers]);

  // Clean Customer Ledgers
  const [customerLedgers, setCustomerLedgers] = useState<Record<string, CustomerLedgerEntry[]>>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_CUSTOMER_LEDGERS;
    const saved = localStorage.getItem('zain_pos_customer_ledgers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CUSTOMER_LEDGERS;
      }
    }
    return DEFAULT_CUSTOMER_LEDGERS;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_customer_ledgers', JSON.stringify(customerLedgers));
  }, [customerLedgers]);

  // Clean Sales Records
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_SALES;
    const saved = localStorage.getItem('zain_pos_sales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SALES;
      }
    }
    return DEFAULT_SALES;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_sales', JSON.stringify(sales));
  }, [sales]);

  // Zero-balance Payment Accounts for Live Shop
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([
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
  ]);

  // Clean Vendors / Parties
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_VENDORS;
    const saved = localStorage.getItem('zain_pos_vendors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_VENDORS;
      }
    }
    return DEFAULT_VENDORS;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_vendors', JSON.stringify(vendors));
  }, [vendors]);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vendorLedgers, setVendorLedgers] = useState<Record<string, VendorLedgerEntry[]>>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_VENDOR_LEDGERS;
    const saved = localStorage.getItem('zain_pos_vendor_ledgers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_VENDOR_LEDGERS;
      }
    }
    return DEFAULT_VENDOR_LEDGERS;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_vendor_ledgers', JSON.stringify(vendorLedgers));
  }, [vendorLedgers]);

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);

  // Clean Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_EXPENSES;
    const saved = localStorage.getItem('zain_pos_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_EXPENSES;
      }
    }
    return DEFAULT_EXPENSES;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Clean Employees & Attendance
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_EMPLOYEES;
    const saved = localStorage.getItem('zain_pos_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_EMPLOYEES;
      }
    }
    return DEFAULT_EMPLOYEES;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_employees', JSON.stringify(employees));
  }, [employees]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [activeCashSession, setActiveCashSession] = useState<CashSession | null>(null);
  const [isLoading] = useState<boolean>(false);

  // Clean To-Do Tasks
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_fresh_saif_only_v20');
    if (!isCleaned) return DEFAULT_TODOS;
    const saved = localStorage.getItem('zain_pos_todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TODOS;
      }
    }
    return DEFAULT_TODOS;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_todos', JSON.stringify(todos));
  }, [todos]);

  // Clear all dummy data manual trigger
  const clearAllDummyData = () => {
    setCustomers([]);
    setCustomerLedgers({});
    setSales([]);
    setVendors([]);
    setVendorLedgers({});
    setPurchases([]);
    setVendorPayments([]);
    setExpenses([]);
    setEmployees([]);
    setAttendance([]);
    setSalaryPayments([]);
    setTodos([]);
    setUsers(DEFAULT_USERS);
    setUserProfile(DEFAULT_USERS[0]);
    setActiveRole('ADMIN');
    localStorage.removeItem('zain_pos_customers');
    localStorage.removeItem('zain_pos_customer_ledgers');
    localStorage.removeItem('zain_pos_sales');
    localStorage.removeItem('zain_pos_vendors');
    localStorage.removeItem('zain_pos_vendor_ledgers');
    localStorage.removeItem('zain_pos_expenses');
    localStorage.removeItem('zain_pos_employees');
    localStorage.removeItem('zain_pos_attendance');
    localStorage.removeItem('zain_pos_salary_payments');
    localStorage.removeItem('zain_pos_todos');
    localStorage.removeItem('zain_pos_products');
    localStorage.removeItem('zain_pos_cart');
    localStorage.setItem('zain_pos_users', JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('zain_pos_current_user', JSON.stringify(DEFAULT_USERS[0]));
    localStorage.setItem('zain_pos_db_fresh_saif_only_v20', 'true');
  };

  // Authentication Handlers
  const loginAsUserProfile = (user: UserProfile) => {
    const updatedUser = { ...user, last_login: new Date().toISOString() };
    setUserProfile(updatedUser);
    const userRole = (user.role as ActiveRole) || 'ADMIN';
    setActiveRole(userRole);
    localStorage.setItem('zain_pos_current_user', JSON.stringify(updatedUser));

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.map((u) => (u.id === user.id ? updatedUser : u));
      }
      return [...prev, updatedUser];
    });
  };

  const loginUser = (identifier: string, pinOrPassword?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = (pinOrPassword || '').trim();

    // Check Saif admin credentials
    if (
      (cleanId === 'saif@admin.com' || cleanId === 'saif' || cleanId === 'admin') &&
      (cleanPass === 'Saif@Zain' || cleanPass === '1234' || cleanPass.toLowerCase() === 'saif@zain')
    ) {
      loginAsUserProfile(DEFAULT_USERS[0]);
      return { success: true };
    }

    // Check in users state
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId)
    );

    if (foundUser) {
      if (foundUser.pin && cleanPass && foundUser.pin !== cleanPass && cleanPass !== 'Saif@Zain') {
        return { success: false, message: 'Incorrect Password / PIN entered.' };
      }
      loginAsUserProfile(foundUser);
      return { success: true };
    }

    // Default Saif fallback if password matches
    if (cleanPass === 'Saif@Zain' || cleanPass.toLowerCase() === 'saif@zain') {
      loginAsUserProfile(DEFAULT_USERS[0]);
      return { success: true };
    }

    return { success: false, message: 'Invalid credentials. Enter Email: saif@admin.com and Password: Saif@Zain' };
  };

  const logoutUser = () => {
    setUserProfile(null);
    localStorage.removeItem('zain_pos_current_user');
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr_${Date.now()}`,
      status: userData.status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (userId: string, userData: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...userData, updated_at: new Date().toISOString() };
          if (userProfile?.id === userId) {
            setUserProfile(updated);
            if (updated.role) {
              setActiveRole(updated.role as ActiveRole);
            }
            localStorage.setItem('zain_pos_current_user', JSON.stringify(updated));
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const addShop = (shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at'>): Shop => {
    const newShop: Shop = {
      ...shopData,
      id: `shop_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setShops((prev) => [...prev, newShop]);
    return newShop;
  };

  const updateShop = (shopId: string, shopData: Partial<Shop>) => {
    setShops((prev) =>
      prev.map((s) => {
        if (s.id === shopId) {
          const updated = { ...s, ...shopData, updated_at: new Date().toISOString() };
          if (activeShop?.id === shopId) setActiveShop(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const hasPermission = (permissionKey: string): boolean => {
    if (activeRole === 'ADMIN') return true;
    return true;
  };

  // Customers Management with Realtime Timestamps
  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer => {
    const newCustId = `cust_${Date.now()}`;
    const initialBalance = customerData.opening_balance || 0;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const newCustomer: Customer = {
      ...customerData,
      id: newCustId,
      opening_balance: initialBalance,
      current_balance: initialBalance,
      total_purchases_count: 0,
      total_spent: 0,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    if (initialBalance !== 0) {
      const openingEntry: CustomerLedgerEntry = {
        id: `cl_${Date.now()}_open`,
        organization_id: newCustomer.organization_id,
        customer_id: newCustId,
        transaction_type: 'OPENING_BALANCE',
        reference_number: 'OPEN-BAL',
        business_date: todayStr,
        debit: initialBalance > 0 ? initialBalance : 0,
        credit: initialBalance < 0 ? Math.abs(initialBalance) : 0,
        running_balance: initialBalance,
        description: 'Opening Balance Recorded',
        created_at: nowIso,
      };

      setCustomerLedgers((prev) => ({
        ...prev,
        [newCustId]: [openingEntry],
      }));
    }

    return newCustomer;
  };

  const updateCustomer = (customerId: string, customerData: Partial<Customer>) => {
    const nowIso = new Date().toISOString();
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...customerData, updated_at: nowIso } : c))
    );
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setCustomerLedgers((prev) => {
      const copy = { ...prev };
      delete copy[customerId];
      return copy;
    });
  };

  // Realtime Customer Payment Record
  const recordCustomerPayment = (paymentData: {
    customer_id: string;
    amount: number;
    payment_account_id?: string;
    payment_method: 'cash' | 'upi' | 'card' | 'bank';
    notes?: string;
  }): CustomerLedgerEntry => {
    const customer = customers.find((c) => c.id === paymentData.customer_id);
    if (!customer) throw new Error('Customer not found');

    const newBalance = customer.current_balance - paymentData.amount;
    const refNum = `PAY-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const newLedgerEntry: CustomerLedgerEntry = {
      id: `cl_${Date.now()}`,
      organization_id: customer.organization_id,
      customer_id: customer.id,
      transaction_type: 'PAYMENT',
      reference_number: refNum,
      business_date: todayStr,
      debit: 0,
      credit: paymentData.amount,
      running_balance: newBalance,
      description: paymentData.notes || `Payment Received via ${paymentData.payment_method.toUpperCase()}`,
      created_at: nowIso,
    };

    updateCustomer(customer.id, { current_balance: newBalance });

    setCustomerLedgers((prev) => {
      const existing = prev[customer.id] || [];
      return {
        ...prev,
        [customer.id]: [...existing, newLedgerEntry],
      };
    });

    // Update payment account balance
    if (paymentData.payment_method === 'cash') {
      setPaymentAccounts((prev) =>
        prev.map((a) => (a.type === 'cash' ? { ...a, current_balance: a.current_balance + paymentData.amount } : a))
      );
    } else {
      setPaymentAccounts((prev) =>
        prev.map((a) => (a.type === 'upi' ? { ...a, current_balance: a.current_balance + paymentData.amount } : a))
      );
    }

    return newLedgerEntry;
  };

  // Realtime Sales Recording
  const recordSale = (saleData: Omit<SaleRecord, 'id' | 'created_at'>): SaleRecord => {
    const nowIso = new Date().toISOString();
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale_${Date.now()}`,
      created_at: nowIso,
    };

    setSales((prev) => [newSale, ...prev]);

    // Update Cash/UPI accounts with actual money received
    if (newSale.cash_amount > 0) {
      setPaymentAccounts((prev) =>
        prev.map((a) => (a.type === 'cash' ? { ...a, current_balance: a.current_balance + newSale.cash_amount } : a))
      );
    }
    if (newSale.online_amount > 0) {
      setPaymentAccounts((prev) =>
        prev.map((a) => (a.type === 'upi' ? { ...a, current_balance: a.current_balance + newSale.online_amount } : a))
      );
    }

    // Update customer ledger & balance if customer is attached
    const targetCustomerId = newSale.customer_id;
    if (targetCustomerId) {
      const cust = customers.find((c) => c.id === targetCustomerId);
      const dueAmount = newSale.due_amount || 0;
      const totalAmount = newSale.total;

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === targetCustomerId) {
            return {
              ...c,
              current_balance: c.current_balance + dueAmount,
              total_purchases_count: (c.total_purchases_count || 0) + 1,
              total_spent: (c.total_spent || 0) + totalAmount,
              last_purchase_date: nowIso,
              updated_at: nowIso,
            };
          }
          return c;
        })
      );

      setCustomerLedgers((prev) => {
        const list = prev[targetCustomerId!] || [];
        const currentBal = cust ? cust.current_balance : 0;
        const newBal = currentBal + dueAmount;

        const ledgerEntry: CustomerLedgerEntry = {
          id: `cl_${Date.now()}_sale`,
          organization_id: newSale.organization_id,
          customer_id: targetCustomerId!,
          transaction_type: 'SALE',
          reference_number: newSale.receipt_number,
          business_date: nowIso.split('T')[0],
          debit: newSale.total,
          credit: newSale.total - dueAmount,
          running_balance: newBal,
          description: `Sale #${newSale.receipt_number}${dueAmount > 0 ? ` (Due: ₹${dueAmount})` : ' (Fully Paid)'}`,
          created_at: nowIso,
        };

        return { ...prev, [targetCustomerId!]: [...list, ledgerEntry] };
      });
    }

    return newSale;
  };

  // Realtime Stock In / Purchase Recording
  const recordPurchase = (purchaseData: {
    vendor_id: string;
    bill_number: string;
    business_date: string;
    total: number;
    amount_paid: number;
    payment_account_id?: string;
    notes?: string;
  }): Purchase => {
    const vendor = vendors.find((v) => v.id === purchaseData.vendor_id);
    const balanceDue = purchaseData.total - purchaseData.amount_paid;
    const nowIso = new Date().toISOString();
    const recDate = purchaseData.business_date || nowIso.split('T')[0];

    const newPurchase: Purchase = {
      id: `pur_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      vendor_id: purchaseData.vendor_id,
      bill_number: purchaseData.bill_number,
      business_date: recDate,
      total_amount: purchaseData.total,
      amount_paid: purchaseData.amount_paid,
      balance_due: balanceDue,
      status: balanceDue === 0 ? 'PAID' : purchaseData.amount_paid > 0 ? 'PARTIAL' : 'PENDING',
      notes: purchaseData.notes,
      created_at: nowIso,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    if (vendor) {
      const newCurrentBal = vendor.current_balance + balanceDue;
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, current_balance: newCurrentBal, updated_at: nowIso } : v)));

      const newLedgerEntry: VendorLedgerEntry = {
        id: `vl_${Date.now()}`,
        organization_id: newPurchase.organization_id,
        vendor_id: vendor.id,
        transaction_type: 'PURCHASE',
        reference_number: purchaseData.bill_number,
        business_date: recDate,
        debit: 0,
        credit: purchaseData.total,
        running_balance: newCurrentBal,
        description: `Purchase Bill #${purchaseData.bill_number}${purchaseData.notes ? ` - ${purchaseData.notes}` : ''}`,
        created_at: nowIso,
      };

      setVendorLedgers((prev) => ({
        ...prev,
        [vendor.id]: [...(prev[vendor.id] || []), newLedgerEntry],
      }));
    }

    return newPurchase;
  };

  // Realtime Vendor / Supplier Payment Recording
  const recordVendorPayment = (paymentData: {
    vendor_id: string;
    amount_paid: number;
    payment_account_id: string;
    payment_method: string;
    reference_notes?: string;
  }): VendorPayment => {
    const vendor = vendors.find((v) => v.id === paymentData.vendor_id);
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const newPayment: VendorPayment = {
      id: `vpay_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      vendor_id: paymentData.vendor_id,
      payment_account_id: paymentData.payment_account_id,
      amount_paid: paymentData.amount_paid,
      payment_date: todayStr,
      payment_method: paymentData.payment_method,
      reference_notes: paymentData.reference_notes,
      created_at: nowIso,
    };

    setVendorPayments((prev) => [newPayment, ...prev]);

    if (vendor) {
      const newCurrentBal = vendor.current_balance - paymentData.amount_paid;
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, current_balance: newCurrentBal, updated_at: nowIso } : v)));

      const newLedgerEntry: VendorLedgerEntry = {
        id: `vl_${Date.now()}_pay`,
        organization_id: newPayment.organization_id,
        vendor_id: vendor.id,
        transaction_type: 'PAYMENT',
        reference_number: `VPAY-${Date.now().toString().slice(-4)}`,
        business_date: todayStr,
        debit: paymentData.amount_paid,
        credit: 0,
        running_balance: newCurrentBal,
        description: `Payment via ${paymentData.payment_method}${paymentData.reference_notes ? ` (${paymentData.reference_notes})` : ''}`,
        created_at: nowIso,
      };

      setVendorLedgers((prev) => ({
        ...prev,
        [vendor.id]: [...(prev[vendor.id] || []), newLedgerEntry],
      }));
    }

    return newPayment;
  };

  // Realtime Expense Recording
  const recordExpense = (
    expenseData: Omit<Expense, 'id' | 'created_at' | 'organization_id' | 'shop_id' | 'expense_date'>
  ): Expense => {
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const newExp: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      business_date: expenseData.business_date || todayStr,
      expense_date: nowIso,
      created_at: nowIso,
    };

    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const updateExpense = (expenseId: string, data: Partial<Expense>) => {
    const nowIso = new Date().toISOString();
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              ...data,
              updated_at: nowIso,
            }
          : e
      )
    );
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const recordSalaryPayment = (salaryData: {
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }): SalaryPayment => {
    const netSalary = salaryData.gross_salary - salaryData.deductions - salaryData.advances;
    const nowIso = new Date().toISOString();

    const newSalary: SalaryPayment = {
      id: `sal_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      employee_id: salaryData.employee_id,
      payment_account_id: salaryData.payment_account_id,
      month_year: nowIso.slice(0, 7),
      gross_salary: salaryData.gross_salary,
      deductions: salaryData.deductions,
      advances: salaryData.advances,
      net_salary_paid: netSalary,
      payment_date: nowIso.split('T')[0],
      payment_reference: salaryData.payment_reference,
      created_at: nowIso,
    };

    setSalaryPayments((prev) => [newSalary, ...prev]);
    return newSalary;
  };

  const markAttendance = (
    employeeId: string,
    status: 'present' | 'absent' | 'half_day' | 'leave',
    notes?: string
  ): AttendanceRecord => {
    const emp = employees.find((e) => e.id === employeeId);
    const nowIso = new Date().toISOString();

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      employee_id: employeeId,
      employee_name: emp?.full_name || 'Staff',
      attendance_date: nowIso.split('T')[0],
      status,
      check_in_time: status === 'present' || status === 'half_day' ? new Date().toTimeString().slice(0, 8) : undefined,
      notes,
      created_at: nowIso,
    };

    setAttendance((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const addTodo = (todoData: Omit<TodoItem, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): TodoItem => {
    const nowIso = new Date().toISOString();
    const newTodo: TodoItem = {
      ...todoData,
      id: `todo_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      created_by_user_id: userProfile?.id,
      created_by_name: userProfile?.full_name,
      created_at: nowIso,
      updated_at: nowIso,
    };
    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  };

  const toggleTodo = (todoId: string) => {
    const nowIso = new Date().toISOString();
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              is_completed: !t.is_completed,
              completed_at: !t.is_completed ? nowIso : undefined,
              updated_at: nowIso,
            }
          : t
      )
    );
  };

  const deleteTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  const updateVendor = (vendorId: string, data: Partial<Vendor>) => {
    const nowIso = new Date().toISOString();
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              ...data,
              updated_at: nowIso,
            }
          : v
      )
    );
  };

  const punchAttendance = (
    employeeIdOrName?: string,
    status: 'present' | 'absent' | 'half_day' | 'leave' = 'present',
    notes?: string
  ): AttendanceRecord => {
    const targetName = employeeIdOrName || userProfile?.full_name || 'Saif';
    const targetId = userProfile?.id || `emp_${Date.now()}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      employee_id: targetId,
      employee_name: targetName,
      attendance_date: now.toISOString().split('T')[0],
      status,
      check_in_time: timeFormatted,
      notes: notes || `Punched via POS terminal by ${userProfile?.username || 'Saif'}`,
      created_at: now.toISOString(),
    };

    setAttendance((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const addVendor = (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>): Vendor => {
    const nowIso = new Date().toISOString();
    const newVendor: Vendor = {
      ...vendorData,
      id: `v_${Date.now()}`,
      current_balance: vendorData.opening_balance || 0,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setVendors((prev) => [...prev, newVendor]);
    return newVendor;
  };

  const deleteVendor = (vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    setVendorLedgers((prev) => {
      const copy = { ...prev };
      delete copy[vendorId];
      return copy;
    });
  };

  const openCashCounter = (openingCash: number): CashSession => {
    const nowIso = new Date().toISOString();
    const newSession: CashSession = {
      id: `sess_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      business_date: nowIso.split('T')[0],
      opened_at: nowIso,
      opening_cash: openingCash,
      status: 'OPEN',
      requires_approval: false,
      created_at: nowIso,
    };

    setActiveCashSession(newSession);
    return newSession;
  };

  const closeCashCounter = (countedCash: number, reason?: string): { expectedCash: number; variance: number } => {
    const opening = activeCashSession?.opening_cash || 0;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const cashSalesToday = sales
      .filter((s) => s.created_at.split('T')[0] === todayStr)
      .reduce((sum, s) => sum + (s.cash_amount || 0), 0);

    const expectedCash = opening + cashSalesToday;
    const variance = countedCash - expectedCash;

    if (activeCashSession) {
      setActiveCashSession({
        ...activeCashSession,
        closed_at: nowIso,
        counted_cash: countedCash,
        expected_cash: expectedCash,
        variance,
        closing_note: reason,
        status: 'CLOSED',
      });
    }

    return { expectedCash, variance };
  };

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
