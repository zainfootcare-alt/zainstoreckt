import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Organization,
  Shop,
  UserProfile,
  UserShopRole,
  SystemRole,
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
} from '../types/database.types';

export type ActiveRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'FINANCE';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@zainfootwear.com',
    username: 'admin',
    full_name: 'Ahmed Khan (Admin)',
    organization_id: 'org-footwear-101',
    default_shop_id: 'shop-mumbai-01',
    is_onboarded: true,
    role: 'ADMIN',
    pin: '1234',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-manager-02',
    email: 'manager@zainfootwear.com',
    username: 'manager',
    full_name: 'Vikram Singh (Manager)',
    organization_id: 'org-footwear-101',
    default_shop_id: 'shop-mumbai-01',
    is_onboarded: true,
    role: 'MANAGER',
    pin: '5678',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-cashier-03',
    email: 'cashier@zainfootwear.com',
    username: 'cashier',
    full_name: 'Pooja Verma (Cashier)',
    organization_id: 'org-footwear-101',
    default_shop_id: 'shop-mumbai-01',
    is_onboarded: true,
    role: 'CASHIER',
    pin: '1111',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-finance-04',
    email: 'finance@zainfootwear.com',
    username: 'finance',
    full_name: 'Rahul Mehta (Finance)',
    organization_id: 'org-footwear-101',
    default_shop_id: 'shop-mumbai-01',
    is_onboarded: true,
    role: 'FINANCE',
    pin: '2222',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Clean Empty Default States (No Mock/Dummy Data)
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
  recordSalaryPayment: (salaryData: {
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }) => SalaryPayment;
  markAttendance: (employeeId: string, status: 'present' | 'absent' | 'half_day' | 'leave', notes?: string) => AttendanceRecord;
  addVendor: (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>) => Vendor;
  deleteVendor: (vendorId: string) => void;
  openCashCounter: (openingCash: number) => CashSession;
  closeCashCounter: (countedCash: number, reason?: string) => { expectedCash: number; variance: number };
  clearAllDummyData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Wipe legacy mock local storage if on older schema
  useEffect(() => {
    const isCleaned = localStorage.getItem('zain_pos_db_cleaned_v3');
    if (!isCleaned) {
      localStorage.removeItem('zain_pos_customers');
      localStorage.removeItem('zain_pos_customer_ledgers');
      localStorage.removeItem('zain_pos_estimates');
      localStorage.removeItem('zain_pos_sales');
      localStorage.removeItem('zain_pos_vendors');
      localStorage.removeItem('zain_pos_vendor_ledgers');
      localStorage.removeItem('zain_pos_expenses');
      localStorage.removeItem('zain_pos_employees');
      localStorage.removeItem('zain_pos_attendance');
      localStorage.removeItem('zain_pos_salary_payments');
      localStorage.setItem('zain_pos_db_cleaned_v3', 'true');
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
        email: 'store@zainfootwear.com',
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

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('zain_pos_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      } catch (e) {
        /* fallback */
      }
    }
    return DEFAULT_USERS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('zain_pos_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
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

  // Customers State (Starts clean and empty)
  const [customers, setCustomers] = useState<Customer[]>(() => {
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

  // Customer Ledgers State
  const [customerLedgers, setCustomerLedgers] = useState<Record<string, CustomerLedgerEntry[]>>(() => {
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

  // Sales State
  const [sales, setSales] = useState<SaleRecord[]>(() => {
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

  // Payment Accounts State (Clean Zero Balances for fresh transactions)
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

  const [vendors, setVendors] = useState<Vendor[]>(() => {
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
  const [expenses, setExpenses] = useState<Expense[]>(() => {
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

  const [employees, setEmployees] = useState<Employee[]>(() => {
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

  // Clear all data manual trigger
  const clearAllDummyData = () => {
    setCustomers([]);
    setCustomerLedgers({});
    setSales([]);
    setVendors([]);
    setVendorLedgers({});
    setPurchases([]);
    setExpenses([]);
    setEmployees([]);
    setAttendance([]);
    setSalaryPayments([]);
    localStorage.removeItem('zain_pos_customers');
    localStorage.removeItem('zain_pos_customer_ledgers');
    localStorage.removeItem('zain_pos_sales');
    localStorage.removeItem('zain_pos_vendors');
    localStorage.removeItem('zain_pos_vendor_ledgers');
    localStorage.removeItem('zain_pos_expenses');
    localStorage.removeItem('zain_pos_employees');
    localStorage.removeItem('zain_pos_attendance');
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
    
    // Check in both state users and DEFAULT_USERS fallback
    let foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.role && u.role.toLowerCase() === cleanId)
    );

    if (!foundUser) {
      foundUser = DEFAULT_USERS.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.role && u.role.toLowerCase() === cleanId) ||
          (cleanId === 'admin' && u.role === 'ADMIN') ||
          (cleanId === 'manager' && u.role === 'MANAGER') ||
          (cleanId === 'cashier' && u.role === 'CASHIER') ||
          (cleanId === 'finance' && u.role === 'FINANCE')
      );
    }

    if (!foundUser) {
      if (cleanId.includes('admin')) foundUser = DEFAULT_USERS[0];
      else if (cleanId.includes('manager')) foundUser = DEFAULT_USERS[1];
      else if (cleanId.includes('cashier')) foundUser = DEFAULT_USERS[2];
      else if (cleanId.includes('finance')) foundUser = DEFAULT_USERS[3];
    }

    if (!foundUser) {
      return { success: false, message: 'No user account found with this email/username.' };
    }

    if (foundUser.status === 'Inactive') {
      return { success: false, message: 'This account is deactivated. Please contact administrator.' };
    }

    if (pinOrPassword && foundUser.pin && foundUser.pin !== pinOrPassword.trim()) {
      return { success: false, message: 'Incorrect PIN or Password entered.' };
    }

    loginAsUserProfile(foundUser);
    return { success: true };
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

    switch (activeRole) {
      case 'MANAGER':
        return [
          'dashboard:view',
          'sales:view',
          'sales:create',
          'sales:delete',
          'pos:use',
          'cash_close:manage',
          'vendors:view',
          'vendors:manage',
          'purchases:view',
          'purchases:create',
          'expenses:view',
          'expenses:create',
          'staff:view',
          'attendance:manage',
          'customers:view',
          'customers:manage',
          'reports:view',
        ].includes(permissionKey);
      case 'CASHIER':
        return [
          'dashboard:view',
          'sales:view',
          'sales:create',
          'pos:use',
          'cash_close:manage',
          'customers:view',
          'customers:manage',
        ].includes(permissionKey);
      case 'FINANCE':
        return [
          'dashboard:view',
          'sales:view',
          'cash_close:manage',
          'vendors:view',
          'vendors:manage',
          'purchases:view',
          'expenses:view',
          'expenses:manage',
          'finance:view',
          'finance:manage',
          'salary:view',
          'salary:manage',
          'reports:view',
          'customers:view',
          'customers:manage',
        ].includes(permissionKey);
      default:
        return false;
    }
  };

  // Customers Management
  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer => {
    const newCustId = `cust_${Date.now()}`;
    const initialBalance = customerData.opening_balance || 0;

    const newCustomer: Customer = {
      ...customerData,
      id: newCustId,
      opening_balance: initialBalance,
      current_balance: initialBalance,
      total_purchases_count: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    if (initialBalance !== 0) {
      const openingEntry: CustomerLedgerEntry = {
        id: `cl_${Date.now()}_open`,
        organization_id: newCustomer.organization_id,
        customer_id: newCustId,
        transaction_type: 'OPENING_BALANCE',
        reference_number: 'OPEN-BAL',
        business_date: new Date().toISOString().split('T')[0],
        debit: initialBalance > 0 ? initialBalance : 0,
        credit: initialBalance < 0 ? Math.abs(initialBalance) : 0,
        running_balance: initialBalance,
        description: 'Opening Balance Recorded',
        created_at: new Date().toISOString(),
      };

      setCustomerLedgers((prev) => ({
        ...prev,
        [newCustId]: [openingEntry],
      }));
    }

    return newCustomer;
  };

  const updateCustomer = (customerId: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...customerData, updated_at: new Date().toISOString() } : c))
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

    const newLedgerEntry: CustomerLedgerEntry = {
      id: `cl_${Date.now()}`,
      organization_id: customer.organization_id,
      customer_id: customer.id,
      transaction_type: 'PAYMENT',
      reference_number: refNum,
      business_date: new Date().toISOString().split('T')[0],
      debit: 0,
      credit: paymentData.amount,
      running_balance: newBalance,
      description: paymentData.notes || `Payment Received via ${paymentData.payment_method.toUpperCase()}`,
      created_at: new Date().toISOString(),
    };

    updateCustomer(customer.id, { current_balance: newBalance });

    setCustomerLedgers((prev) => {
      const existing = prev[customer.id] || [];
      return {
        ...prev,
        [customer.id]: [...existing, newLedgerEntry],
      };
    });

    return newLedgerEntry;
  };

  // Sales Recording
  const recordSale = (saleData: Omit<SaleRecord, 'id' | 'created_at'>): SaleRecord => {
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

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
              last_purchase_date: newSale.created_at,
              updated_at: new Date().toISOString(),
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
          business_date: newSale.created_at.split('T')[0],
          debit: newSale.total,
          credit: newSale.total - dueAmount,
          running_balance: newBal,
          description: `Sale #${newSale.receipt_number}${dueAmount > 0 ? ` (Due: ₹${dueAmount})` : ' (Fully Paid)'}`,
          created_at: new Date().toISOString(),
        };

        return { ...prev, [targetCustomerId!]: [...list, ledgerEntry] };
      });
    }

    return newSale;
  };

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

    const newPurchase: Purchase = {
      id: `pur_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      vendor_id: purchaseData.vendor_id,
      bill_number: purchaseData.bill_number,
      business_date: purchaseData.business_date,
      total_amount: purchaseData.total,
      amount_paid: purchaseData.amount_paid,
      balance_due: balanceDue,
      status: balanceDue === 0 ? 'PAID' : purchaseData.amount_paid > 0 ? 'PARTIAL' : 'PENDING',
      notes: purchaseData.notes,
      created_at: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    if (vendor) {
      const newCurrentBal = vendor.current_balance + balanceDue;
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, current_balance: newCurrentBal } : v)));

      const newLedgerEntry: VendorLedgerEntry = {
        id: `vl_${Date.now()}`,
        organization_id: newPurchase.organization_id,
        vendor_id: vendor.id,
        transaction_type: 'PURCHASE',
        reference_number: purchaseData.bill_number,
        business_date: purchaseData.business_date,
        debit: 0,
        credit: purchaseData.total,
        running_balance: newCurrentBal,
        description: `Purchase Bill #${purchaseData.bill_number}${purchaseData.notes ? ` - ${purchaseData.notes}` : ''}`,
        created_at: new Date().toISOString(),
      };

      setVendorLedgers((prev) => ({
        ...prev,
        [vendor.id]: [...(prev[vendor.id] || []), newLedgerEntry],
      }));
    }

    return newPurchase;
  };

  const recordVendorPayment = (paymentData: {
    vendor_id: string;
    amount_paid: number;
    payment_account_id: string;
    payment_method: string;
    reference_notes?: string;
  }): VendorPayment => {
    const vendor = vendors.find((v) => v.id === paymentData.vendor_id);
    const newPayment: VendorPayment = {
      id: `vpay_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      vendor_id: paymentData.vendor_id,
      payment_account_id: paymentData.payment_account_id,
      amount_paid: paymentData.amount_paid,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentData.payment_method,
      reference_notes: paymentData.reference_notes,
      created_at: new Date().toISOString(),
    };

    setVendorPayments((prev) => [newPayment, ...prev]);

    if (vendor) {
      const newCurrentBal = vendor.current_balance - paymentData.amount_paid;
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, current_balance: newCurrentBal } : v)));

      const newLedgerEntry: VendorLedgerEntry = {
        id: `vl_${Date.now()}_pay`,
        organization_id: newPayment.organization_id,
        vendor_id: vendor.id,
        transaction_type: 'PAYMENT',
        reference_number: `VPAY-${Date.now().toString().slice(-4)}`,
        business_date: newPayment.payment_date,
        debit: paymentData.amount_paid,
        credit: 0,
        running_balance: newCurrentBal,
        description: `Payment via ${paymentData.payment_method}${paymentData.reference_notes ? ` (${paymentData.reference_notes})` : ''}`,
        created_at: new Date().toISOString(),
      };

      setVendorLedgers((prev) => ({
        ...prev,
        [vendor.id]: [...(prev[vendor.id] || []), newLedgerEntry],
      }));
    }

    return newPayment;
  };

  const recordExpense = (
    expenseData: Omit<Expense, 'id' | 'created_at' | 'organization_id' | 'shop_id' | 'expense_date'>
  ): Expense => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      expense_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
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
    const newSalary: SalaryPayment = {
      id: `sal_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      employee_id: salaryData.employee_id,
      payment_account_id: salaryData.payment_account_id,
      month_year: new Date().toISOString().slice(0, 7),
      gross_salary: salaryData.gross_salary,
      deductions: salaryData.deductions,
      advances: salaryData.advances,
      net_salary_paid: netSalary,
      payment_date: new Date().toISOString().split('T')[0],
      payment_reference: salaryData.payment_reference,
      created_at: new Date().toISOString(),
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
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      employee_id: employeeId,
      employee_name: emp?.full_name || 'Staff',
      attendance_date: new Date().toISOString().split('T')[0],
      status,
      check_in_time: status === 'present' || status === 'half_day' ? new Date().toTimeString().slice(0, 8) : undefined,
      notes,
      created_at: new Date().toISOString(),
    };

    setAttendance((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const addVendor = (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>): Vendor => {
    const newVendor: Vendor = {
      ...vendorData,
      id: `v_${Date.now()}`,
      current_balance: vendorData.opening_balance || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    const newSession: CashSession = {
      id: `sess_${Date.now()}`,
      organization_id: activeShop?.organization_id || 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      business_date: new Date().toISOString().split('T')[0],
      opened_at: new Date().toISOString(),
      opening_cash: openingCash,
      status: 'OPEN',
      requires_approval: false,
      created_at: new Date().toISOString(),
    };

    setActiveCashSession(newSession);
    return newSession;
  };

  const closeCashCounter = (countedCash: number, reason?: string): { expectedCash: number; variance: number } => {
    const opening = activeCashSession?.opening_cash || 0;
    const cashSalesToday = sales
      .filter((s) => s.created_at.split('T')[0] === new Date().toISOString().split('T')[0])
      .reduce((sum, s) => sum + (s.cash_amount || 0), 0);

    const expectedCash = opening + cashSalesToday;
    const variance = countedCash - expectedCash;

    if (activeCashSession) {
      setActiveCashSession({
        ...activeCashSession,
        closed_at: new Date().toISOString(),
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
        activeCashSession,

        recordSale,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,

        recordPurchase,
        recordVendorPayment,
        recordExpense,
        recordSalaryPayment,
        markAttendance,
        addVendor,
        deleteVendor,
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
