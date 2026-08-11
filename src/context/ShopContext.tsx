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
} from '../types/database.types';

export type ActiveRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'FINANCE';

const DEFAULT_USERS: UserProfile[] = [
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
    last_login: '2026-08-10T14:30:00Z',
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
    last_login: '2026-08-11T09:15:00Z',
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
    last_login: '2026-08-09T16:45:00Z',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-101',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Aarav Mehta',
    phone: '+91 98201 99887',
    email: 'aarav@gmail.com',
    total_purchases_count: 3,
    total_spent: 8850.0,
    last_purchase_date: '2026-08-09T16:20:00Z',
    city: 'Mumbai',
    created_at: '2026-06-10T10:00:00Z',
    updated_at: '2026-08-09T16:20:00Z',
  },
  {
    id: 'cust-102',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Priya Sharma',
    phone: '+91 98334 11223',
    email: 'priya.s@yahoo.com',
    total_purchases_count: 2,
    total_spent: 4998.0,
    last_purchase_date: '2026-08-08T14:15:00Z',
    city: 'Mumbai',
    created_at: '2026-07-01T11:30:00Z',
    updated_at: '2026-08-08T14:15:00Z',
  },
  {
    id: 'cust-103',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Rohan Kapoor',
    phone: '+91 98112 55667',
    email: 'rohan.k@gmail.com',
    total_purchases_count: 1,
    total_spent: 1899.0,
    last_purchase_date: '2026-08-05T18:45:00Z',
    city: 'Mumbai',
    created_at: '2026-08-05T18:45:00Z',
    updated_at: '2026-08-05T18:45:00Z',
  },
];

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

  // Authentication & User Management Actions
  loginUser: (identifier: string, pinOrPassword?: string) => { success: boolean; message?: string };
  loginAsUserProfile: (user: UserProfile) => void;
  logoutUser: () => void;
  addUser: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => UserProfile;
  updateUser: (userId: string, userData: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  addShop: (shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at'>) => Shop;
  updateShop: (shopId: string, shopData: Partial<Shop>) => void;

  // Real-time State Arrays
  sales: SaleRecord[];
  customers: Customer[];
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

  // Actions
  recordSale: (saleData: Omit<SaleRecord, 'id' | 'created_at'>) => SaleRecord;
  addCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Customer;
  updateCustomer: (customerId: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
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
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USERS;
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

  const addCustomer = (
    customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (customerId: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...customerData, updated_at: new Date().toISOString() } : c))
    );
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const loginAsUserProfile = (user: UserProfile) => {
    const updatedUser = { ...user, last_login: new Date().toISOString() };
    setUserProfile(updatedUser);
    const userRole = (user.role as ActiveRole) || 'ADMIN';
    setActiveRole(userRole);
    localStorage.setItem('zain_pos_current_user', JSON.stringify(updatedUser));

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? updatedUser : u))
    );
  };

  const loginUser = (identifier: string, pinOrPassword?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId)
    );

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
      is_active: true,
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
          if (activeShop?.id === shopId) {
            setActiveShop(updated);
          }
          return updated;
        }
        return s;
      })
    );
  };

  const [isLoading] = useState<boolean>(false);

  // Core Data State
  const [sales, setSales] = useState<SaleRecord[]>([
    {
      id: 'sale-001',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      receipt_number: 'REC-IN-100291',
      created_by_user_id: 'emp-03',
      created_by_name: 'Pooja Verma',
      subtotal: 1850.0,
      discount: 0,
      tax: 222.0,
      total: 1850.0,
      cash_amount: 1000.0,
      online_amount: 850.0,
      created_at: new Date().toISOString(),
      items: [
        { item_name: 'Formal Leather Shoes', size: 'UK 8', quantity: 1, unit_price: 1200.0, total_price: 1200.0 },
        { item_name: 'Shoe Polish & Care Kit', size: 'N/A', quantity: 1, unit_price: 650.0, total_price: 650.0 },
      ],
      payments: [
        { payment_type: 'cash', amount: 1000.0 },
        { payment_type: 'upi', amount: 850.0 },
      ],
    },
  ]);

  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([
    {
      id: 'acc-cash-01',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      name: 'Cash Counter Register',
      type: 'cash',
      current_balance: 15450.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'acc-upi-02',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      name: 'UPI / QR Payment (PhonePe/GPay)',
      type: 'upi',
      current_balance: 38500.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'acc-card-03',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      name: 'Card POS Machine',
      type: 'card',
      current_balance: 62000.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'acc-bank-04',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      name: 'Main Bank Account (HDFC)',
      type: 'bank',
      current_balance: 245000.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]);

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'v-kanpur-01',
      organization_id: 'org-footwear-101',
      name: 'ABC Wholesale Footwear',
      business_name: 'ABC Tannery & Footwear Works',
      category: 'Leather Footwear',
      contact_person: 'Ramesh Agarwal',
      phone: '+91 98390 11223',
      whatsapp_phone: '+91 98390 11223',
      email: 'orders@abcwholesale.in',
      city: 'Kanpur',
      address: 'Jajmau Leather Zone, Kanpur',
      gstin: '09AAACK1234F1Z2',
      credit_limit: 500000.0,
      payment_terms: 30,
      weekly_payment_day: 'Monday',
      opening_balance: 10000.0,
      current_balance: 50000.0,
      status: 'Active',
      notes: 'Primary supplier for formal leather shoes.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'v-agra-02',
      organization_id: 'org-footwear-101',
      name: 'XYZ Wholesale Hub',
      business_name: 'XYZ Shoe Manufacturing Syndicate',
      category: 'Casual & Sports Shoes',
      contact_person: 'Suresh Verma',
      phone: '+91 98370 44556',
      whatsapp_phone: '+91 98370 44556',
      email: 'supply@xyzwholesale.in',
      city: 'Agra',
      address: 'Shoe Market, Hing Ki Mandi, Agra',
      gstin: '09AAACA9988G1Z9',
      credit_limit: 350000.0,
      payment_terms: 15,
      weekly_payment_day: 'Friday',
      opening_balance: 0.0,
      current_balance: 25000.0,
      status: 'Active',
      notes: 'Manufacturer for casual loafers and sneakers.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: 'pur-101',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      vendor_id: 'v-kanpur-01',
      bill_number: 'INV-2026-8801',
      business_date: '2026-08-01',
      due_date: '2026-08-31',
      entry_type: 'amount_only',
      subtotal: 50000.0,
      transport_charges: 0,
      tax: 0,
      other_charges: 0,
      total: 50000.0,
      amount_paid: 10000.0,
      balance_due: 40000.0,
      payment_status: 'Partially Paid',
      status: 'Active',
      is_immutable: true,
      is_voided: false,
      notes: 'Bulk stock purchase of Oxford leather formal shoes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendor_name: 'ABC Wholesale Footwear',
    },
  ]);

  const [vendorLedgers, setVendorLedgers] = useState<Record<string, VendorLedgerEntry[]>>({
    'v-kanpur-01': [
      {
        id: 'l_v-kanpur-01_1',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-kanpur-01',
        transaction_type: 'OPENING_BALANCE',
        business_date: '2026-04-01',
        debit: 0.0,
        credit: 10000.0,
        running_balance: 10000.0,
        description: 'Opening Due Balance',
        created_at: '2026-04-01T00:00:00Z',
      },
      {
        id: 'l_v-kanpur-01_2',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-kanpur-01',
        transaction_type: 'PURCHASE',
        reference_number: 'INV-2026-8801',
        business_date: '2026-08-01',
        debit: 0.0,
        credit: 50000.0,
        running_balance: 60000.0,
        description: 'Purchase Bill #INV-2026-8801',
        created_at: '2026-08-01T10:00:00Z',
      },
      {
        id: 'l_v-kanpur-01_3',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-kanpur-01',
        transaction_type: 'PAYMENT',
        reference_number: 'PAY-INIT-01',
        business_date: '2026-08-01',
        debit: 10000.0,
        credit: 0.0,
        running_balance: 50000.0,
        description: 'Advance Paid Now',
        created_at: '2026-08-01T10:05:00Z',
      },
    ],
    'v-agra-02': [
      {
        id: 'l_v-agra-02_1',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-agra-02',
        transaction_type: 'PURCHASE',
        reference_number: 'INV-AG-99',
        business_date: '2026-08-05',
        debit: 0.0,
        credit: 25000.0,
        running_balance: 25000.0,
        description: 'Sneakers Purchase Bill',
        created_at: '2026-08-05T11:00:00Z',
      },
    ],
  });

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp-201',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      category_name: 'Rent',
      title: 'Shop Storefront Rent',
      amount: 20000.0,
      business_date: new Date().toISOString().split('T')[0],
      expense_date: new Date().toISOString(),
      status: 'PAID',
      payment_account_id: 'acc-cash-01',
      payment_method: 'Cash',
      created_at: new Date().toISOString(),
    },
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'emp-01',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_code: 'EMP-001',
      full_name: 'Vikram Singh',
      designation: 'Store Manager',
      phone: '+91 98200 99887',
      email: 'vikram@zainfootwear.com',
      base_salary: 24000.0, // ₹800 per day
      joining_date: '2024-04-15',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-02',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_code: 'EMP-002',
      full_name: 'Ahmed',
      designation: 'Sales Staff / Cashier',
      phone: '+91 98211 44332',
      email: 'ahmed@zainfootwear.com',
      base_salary: 18000.0, // ₹600 per day
      joining_date: '2024-11-01',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-03',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_code: 'EMP-003',
      full_name: 'Pooja Verma',
      designation: 'Cashier & POS Sales',
      phone: '+91 98334 55667',
      email: 'pooja@zainfootwear.com',
      base_salary: 15000.0, // ₹500 per day
      joining_date: '2025-01-10',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    {
      id: 'att-1',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: 'emp-01',
      employee_name: 'Vikram Singh',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      check_in_time: '09:30:00',
      created_at: new Date().toISOString(),
    },
    {
      id: 'att-2',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: 'emp-02',
      employee_name: 'Ahmed',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      check_in_time: '09:45:00',
      created_at: new Date().toISOString(),
    },
    {
      id: 'att-3',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: 'emp-03',
      employee_name: 'Pooja Verma',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      check_in_time: '10:00:00',
      created_at: new Date().toISOString(),
    },
  ]);

  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);

  const [activeCashSession, setActiveCashSession] = useState<CashSession | null>({
    id: `sess-${Date.now()}`,
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    business_date: new Date().toISOString().split('T')[0],
    opened_at: new Date().toISOString(),
    opening_cash: 5000.0,
    expected_cash: 5000.0,
    requires_approval: false,
    status: 'OPEN',
    created_at: new Date().toISOString(),
  });

  // Strict RBAC Enforcement
  const hasPermission = (permissionKey: string): boolean => {
    switch (activeRole) {
      case 'ADMIN':
        return true;
      case 'MANAGER':
        return [
          'dashboard:view',
          'sales:view',
          'sales:create',
          'purchases:view',
          'purchases:manage',
          'vendors:view',
          'vendors:manage',
          'staff:view',
          'attendance:manage',
          'reports:view',
          'cash_close:manage',
        ].includes(permissionKey);
      case 'CASHIER':
        return [
          'dashboard:view',
          'sales:view',
          'sales:create',
          'attendance:own',
          'vendors:view',
          'vendors:manage',
          'purchases:view',
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
        ].includes(permissionKey);
      default:
        return false;
    }
  };

  // Central Operational State Handlers
  const recordSale = (saleData: Omit<SaleRecord, 'id' | 'created_at'>): SaleRecord => {
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Update payment accounts based on payment types
    setPaymentAccounts((prevAccs) =>
      prevAccs.map((acc) => {
        let added = 0;
        newSale.payments.forEach((p) => {
          if (
            (p.payment_type === 'cash' && acc.type === 'cash') ||
            (p.payment_type === 'upi' && acc.type === 'upi') ||
            (p.payment_type === 'card' && acc.type === 'card') ||
            (p.payment_type === 'bank' && acc.type === 'bank')
          ) {
            added += p.amount;
          }
        });
        return added > 0 ? { ...acc, current_balance: acc.current_balance + added } : acc;
      })
    );

    // Update session expected cash if cash sale
    if (activeCashSession && newSale.cash_amount > 0) {
      setActiveCashSession({
        ...activeCashSession,
        expected_cash: activeCashSession.expected_cash + newSale.cash_amount,
      });
    }

    // Automatically save or update customer CRM profile
    if (saleData.customer_phone || saleData.customer_name) {
      const cleanPhone = (saleData.customer_phone || '').trim();
      const cleanName = (saleData.customer_name || 'Walk-in Customer').trim();

      setCustomers((prev) => {
        const existingIdx = prev.findIndex(
          (c) =>
            (cleanPhone && cleanPhone !== 'N/A' && c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')) ||
            (cleanName && cleanName !== 'Walk-in Customer' && c.name.toLowerCase() === cleanName.toLowerCase())
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          const existing = updated[existingIdx];
          updated[existingIdx] = {
            ...existing,
            name: cleanName !== 'Walk-in Customer' ? cleanName : existing.name,
            phone: cleanPhone || existing.phone,
            total_purchases_count: existing.total_purchases_count + 1,
            total_spent: existing.total_spent + newSale.total,
            last_purchase_date: newSale.created_at,
            updated_at: new Date().toISOString(),
          };
          return updated;
        }

        const newCustomer: Customer = {
          id: `cust_${Date.now()}`,
          organization_id: saleData.organization_id || 'org-footwear-101',
          shop_id: saleData.shop_id,
          name: cleanName,
          phone: cleanPhone || 'N/A',
          total_purchases_count: 1,
          total_spent: newSale.total,
          last_purchase_date: newSale.created_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return [newCustomer, ...prev];
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
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      vendor_id: purchaseData.vendor_id,
      vendor_name: vendor?.name || 'Party Supplier',
      bill_number: purchaseData.bill_number,
      business_date: purchaseData.business_date,
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      entry_type: 'amount_only',
      subtotal: purchaseData.total,
      transport_charges: 0,
      tax: 0,
      other_charges: 0,
      total: purchaseData.total,
      amount_paid: purchaseData.amount_paid,
      balance_due: balanceDue,
      payment_status: balanceDue <= 0 ? 'Paid' : purchaseData.amount_paid > 0 ? 'Partially Paid' : 'Due',
      status: 'Active',
      is_immutable: true,
      is_voided: false,
      notes: purchaseData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Update Vendor Outstanding
    setVendors((prev) =>
      prev.map((v) =>
        v.id === purchaseData.vendor_id
          ? { ...v, current_balance: v.current_balance + balanceDue }
          : v
      )
    );

    // Ledger entries: + Total Purchase, - Paid Now
    setVendorLedgers((prev) => {
      const partyLedger = prev[purchaseData.vendor_id] || [];
      const prevBal = partyLedger.length > 0 ? partyLedger[partyLedger.length - 1].running_balance : vendor?.opening_balance || 0;
      
      const purchaseLedgerEntry: VendorLedgerEntry = {
        id: `l_pur_${Date.now()}_1`,
        organization_id: 'org-footwear-101',
        vendor_id: purchaseData.vendor_id,
        transaction_type: 'PURCHASE',
        reference_number: purchaseData.bill_number,
        business_date: purchaseData.business_date,
        debit: 0,
        credit: purchaseData.total,
        running_balance: prevBal + purchaseData.total,
        description: `Purchase Bill #${purchaseData.bill_number}`,
        created_at: new Date().toISOString(),
      };

      const updatedList = [...partyLedger, purchaseLedgerEntry];

      if (purchaseData.amount_paid > 0) {
        const paymentLedgerEntry: VendorLedgerEntry = {
          id: `l_pur_${Date.now()}_2`,
          organization_id: 'org-footwear-101',
          vendor_id: purchaseData.vendor_id,
          transaction_type: 'PAYMENT',
          reference_number: purchaseData.bill_number,
          business_date: purchaseData.business_date,
          debit: purchaseData.amount_paid,
          credit: 0,
          running_balance: prevBal + purchaseData.total - purchaseData.amount_paid,
          description: `Paid Now on Bill #${purchaseData.bill_number}`,
          created_at: new Date().toISOString(),
        };
        updatedList.push(paymentLedgerEntry);

        // Deduct from selected payment account
        if (purchaseData.payment_account_id) {
          setPaymentAccounts((prevAccs) =>
            prevAccs.map((acc) =>
              acc.id === purchaseData.payment_account_id
                ? { ...acc, current_balance: acc.current_balance - purchaseData.amount_paid }
                : acc
            )
          );
        }
      }

      return { ...prev, [purchaseData.vendor_id]: updatedList };
    });

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
    const account = paymentAccounts.find((a) => a.id === paymentData.payment_account_id);
    const prevOutstanding = vendor?.current_balance || 0;
    const remainingOutstanding = Math.max(0, prevOutstanding - paymentData.amount_paid);

    const newPayment: VendorPayment = {
      id: `pay_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      vendor_id: paymentData.vendor_id,
      vendor_name: vendor?.name || 'Party',
      payment_date: new Date().toISOString().split('T')[0],
      previous_outstanding: prevOutstanding,
      amount_paid: paymentData.amount_paid,
      remaining_outstanding: remainingOutstanding,
      payment_account_id: paymentData.payment_account_id,
      payment_account_name: account?.name || 'Account',
      payment_method: paymentData.payment_method,
      reference_notes: paymentData.reference_notes,
      created_at: new Date().toISOString(),
    };

    setVendorPayments((prev) => [newPayment, ...prev]);

    // Reduce Party Outstanding
    setVendors((prev) =>
      prev.map((v) =>
        v.id === paymentData.vendor_id ? { ...v, current_balance: remainingOutstanding } : v
      )
    );

    // Reduce Payment Account Balance
    setPaymentAccounts((prevAccs) =>
      prevAccs.map((acc) =>
        acc.id === paymentData.payment_account_id
          ? { ...acc, current_balance: acc.current_balance - paymentData.amount_paid }
          : acc
      )
    );

    // Add Payment to Party Ledger
    setVendorLedgers((prev) => {
      const partyLedger = prev[paymentData.vendor_id] || [];
      const ledgerEntry: VendorLedgerEntry = {
        id: `l_pay_${Date.now()}`,
        organization_id: 'org-footwear-101',
        vendor_id: paymentData.vendor_id,
        transaction_type: 'PAYMENT',
        reference_number: newPayment.id,
        business_date: newPayment.payment_date,
        debit: paymentData.amount_paid,
        credit: 0,
        running_balance: remainingOutstanding,
        description: `Party Payment via ${account?.name || paymentData.payment_method}`,
        created_at: new Date().toISOString(),
      };

      return { ...prev, [paymentData.vendor_id]: [...partyLedger, ledgerEntry] };
    });

    return newPayment;
  };

  const recordExpense = (
    expenseData: Omit<Expense, 'id' | 'created_at' | 'organization_id' | 'shop_id' | 'expense_date'>
  ): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      expense_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Deduct from Payment Account if status === PAID
    if (newExpense.status === 'PAID' && newExpense.payment_account_id) {
      setPaymentAccounts((prevAccs) =>
        prevAccs.map((acc) =>
          acc.id === newExpense.payment_account_id
            ? { ...acc, current_balance: acc.current_balance - newExpense.amount }
            : acc
        )
      );
    }

    return newExpense;
  };

  const recordSalaryPayment = (salaryData: {
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }): SalaryPayment => {
    const emp = employees.find((e) => e.id === salaryData.employee_id);
    const netSalary = salaryData.gross_salary - salaryData.deductions - salaryData.advances;

    const newSalaryPayment: SalaryPayment = {
      id: `sal_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      employee_id: salaryData.employee_id,
      employee_name: emp?.full_name || 'Staff Member',
      payment_date: new Date().toISOString().split('T')[0],
      gross_salary: salaryData.gross_salary,
      deductions: salaryData.deductions,
      advances: salaryData.advances,
      net_salary: netSalary,
      payment_account_id: salaryData.payment_account_id,
      payment_reference: salaryData.payment_reference || `SAL-${Date.now()}`,
      status: 'PAID',
      created_at: new Date().toISOString(),
    };

    setSalaryPayments((prev) => [newSalaryPayment, ...prev]);

    // Deduct from Payment Account
    setPaymentAccounts((prevAccs) =>
      prevAccs.map((acc) =>
        acc.id === salaryData.payment_account_id
          ? { ...acc, current_balance: acc.current_balance - netSalary }
          : acc
      )
    );

    // Record as Expense automatically
    recordExpense({
      category_name: 'Salary',
      title: `Salary Disbursed to ${emp?.full_name || 'Staff'}`,
      amount: netSalary,
      business_date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      payment_account_id: salaryData.payment_account_id,
      payment_method: 'Bank Transfer / Cash',
      notes: salaryData.payment_reference,
    });

    return newSalaryPayment;
  };

  const markAttendance = (
    employeeId: string,
    status: 'present' | 'absent' | 'half_day' | 'leave',
    notes?: string
  ): AttendanceRecord => {
    const emp = employees.find((e) => e.id === employeeId);
    const today = new Date().toISOString().split('T')[0];

    const existing = attendance.find((a) => a.employee_id === employeeId && a.attendance_date === today);

    if (existing) {
      const updated = attendance.map((a) =>
        a.id === existing.id ? { ...a, status, manager_notes: notes } : a
      );
      setAttendance(updated);
      return { ...existing, status, manager_notes: notes };
    }

    const newAtt: AttendanceRecord = {
      id: `att_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      employee_id: employeeId,
      employee_name: emp?.full_name || 'Staff',
      attendance_date: today,
      status,
      check_in_time: new Date().toTimeString().split(' ')[0],
      manager_notes: notes,
      created_at: new Date().toISOString(),
    };

    setAttendance((prev) => [newAtt, ...prev]);
    return newAtt;
  };

  const openCashCounter = (openingCash: number): CashSession => {
    const newSession: CashSession = {
      id: `sess_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: activeShop?.id || 'shop-mumbai-01',
      business_date: new Date().toISOString().split('T')[0],
      opened_at: new Date().toISOString(),
      opening_cash: openingCash,
      expected_cash: openingCash,
      requires_approval: false,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };

    setActiveCashSession(newSession);

    // Set initial cash register balance to opening float if 0
    setPaymentAccounts((prev) =>
      prev.map((a) => (a.type === 'cash' ? { ...a, current_balance: openingCash } : a))
    );

    return newSession;
  };

  const closeCashCounter = (countedCash: number, reason?: string) => {
    if (!activeCashSession) return { expectedCash: 0, variance: 0 };

    const todayStr = new Date().toISOString().split('T')[0];
    const cashSalesToday = sales
      .filter((s) => s.created_at.startsWith(todayStr))
      .reduce((sum, s) => sum + s.cash_amount, 0);

    const cashExpensesToday = expenses
      .filter((e) => e.business_date === todayStr && e.status === 'PAID' && e.payment_account_id === 'acc-cash-01')
      .reduce((sum, e) => sum + e.amount, 0);

    const cashPartyPaymentsToday = vendorPayments
      .filter((p) => p.payment_date === todayStr && p.payment_account_id === 'acc-cash-01')
      .reduce((sum, p) => sum + p.amount_paid, 0);

    const expectedCash = activeCashSession.opening_cash + cashSalesToday - cashExpensesToday - cashPartyPaymentsToday;
    const variance = countedCash - expectedCash;

    setActiveCashSession({
      ...activeCashSession,
      closed_at: new Date().toISOString(),
      expected_cash: expectedCash,
      counted_cash: countedCash,
      variance,
      variance_reason: reason,
      status: 'CLOSED',
    });

    return { expectedCash, variance };
  };

  const addVendor = (
    vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>
  ): Vendor => {
    const newVendorId = `v_${Date.now()}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: newVendorId,
      current_balance: vendorData.opening_balance || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setVendors((prev) => [newVendor, ...prev]);

    // Initialize vendor ledger entry if opening balance > 0
    if (vendorData.opening_balance > 0) {
      setVendorLedgers((prev) => ({
        ...prev,
        [newVendorId]: [
          {
            id: `l_${newVendorId}_init`,
            organization_id: vendorData.organization_id || 'org-footwear-101',
            vendor_id: newVendorId,
            transaction_type: 'OPENING_BALANCE',
            business_date: new Date().toISOString().split('T')[0],
            debit: 0,
            credit: vendorData.opening_balance,
            running_balance: vendorData.opening_balance,
            description: 'Opening Balance Entry',
            created_at: new Date().toISOString(),
          },
        ],
      }));
    }

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
        addCustomer,
        updateCustomer,
        deleteCustomer,
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
        recordPurchase,
        recordVendorPayment,
        recordExpense,
        recordSalaryPayment,
        markAttendance,
        addVendor,
        deleteVendor,
        openCashCounter,
        closeCashCounter,
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
