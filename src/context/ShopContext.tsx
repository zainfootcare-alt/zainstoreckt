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
  Estimate,
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
    id: 'cust-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Rahul Sharma',
    phone: '9820011223',
    opening_balance: 0,
    current_balance: 2000, // You will receive ₹2,000
    total_purchases_count: 3,
    total_spent: 6500,
    last_purchase_date: new Date().toISOString(),
    city: 'Mumbai',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Amit Patel',
    phone: '9820033445',
    opening_balance: 0,
    current_balance: -1500, // You will give ₹1,500 (Advance / Credit)
    total_purchases_count: 2,
    total_spent: 4200,
    last_purchase_date: new Date(Date.now() - 86400000).toISOString(),
    city: 'Mumbai',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Neha Verma',
    phone: '9820055667',
    opening_balance: 0,
    current_balance: 0, // Settled
    total_purchases_count: 5,
    total_spent: 12800,
    last_purchase_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    city: 'Mumbai',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-4',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Suresh Kumar',
    phone: '9820077889',
    opening_balance: 0,
    current_balance: 3500, // You will receive ₹3,500
    total_purchases_count: 1,
    total_spent: 3500,
    last_purchase_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    city: 'Mumbai',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_CUSTOMER_LEDGERS: Record<string, CustomerLedgerEntry[]> = {
  'cust-1': [
    {
      id: 'cl-1-1',
      organization_id: 'org-footwear-101',
      customer_id: 'cust-1',
      transaction_type: 'SALE',
      reference_number: 'REC-1018',
      business_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      debit: 3000,
      credit: 0,
      running_balance: 3000,
      description: 'Sale (Leather Loafers) on Due',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'cl-1-2',
      organization_id: 'org-footwear-101',
      customer_id: 'cust-1',
      transaction_type: 'PAYMENT',
      reference_number: 'PAY-801',
      business_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      debit: 0,
      credit: 1000,
      running_balance: 2000,
      description: 'Cash Payment Received',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  'cust-2': [
    {
      id: 'cl-2-1',
      organization_id: 'org-footwear-101',
      customer_id: 'cust-2',
      transaction_type: 'PAYMENT',
      reference_number: 'ADV-401',
      business_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      debit: 0,
      credit: 1500,
      running_balance: -1500,
      description: 'Advance Deposit Received for Custom Order',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  'cust-3': [
    {
      id: 'cl-3-1',
      organization_id: 'org-footwear-101',
      customer_id: 'cust-3',
      transaction_type: 'SALE',
      reference_number: 'REC-1012',
      business_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      debit: 2500,
      credit: 0,
      running_balance: 2500,
      description: 'Sale on Due',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'cl-3-2',
      organization_id: 'org-footwear-101',
      customer_id: 'cust-3',
      transaction_type: 'PAYMENT',
      reference_number: 'PAY-790',
      business_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      debit: 0,
      credit: 2500,
      running_balance: 0,
      description: 'UPI Payment Received (Settled in full)',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  'cust-4': [
    {
      id: 'cl-4-1',
      organization_id: 'org-footwear-101',
      customer_id: 'cust-4',
      transaction_type: 'SALE',
      reference_number: 'REC-1015',
      business_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      debit: 3500,
      credit: 0,
      running_balance: 3500,
      description: 'Sale (Brogues & Boots) on Due',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

const DEFAULT_ESTIMATES: Estimate[] = [
  {
    id: 'est-101',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    estimate_number: 'EST-101',
    customer_id: 'cust-1',
    customer_name: 'Rahul Sharma',
    customer_phone: '9820011223',
    subtotal: 4500,
    discount: 0,
    tax: 0,
    total: 4500,
    status: 'Sent',
    notes: '2 pairs Italian Leather Loafers (Size 8 & 9)',
    items: [
      { item_name: 'Classic Italian Leather Loafer', size: '8', quantity: 1, unit_price: 2250, total_price: 2250 },
      { item_name: 'Tan Slip-on Formal Shoe', size: '9', quantity: 1, unit_price: 2250, total_price: 2250 },
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'est-102',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    estimate_number: 'EST-102',
    customer_name: 'Vikram Mehta',
    customer_phone: '9811122334',
    subtotal: 3200,
    discount: 200,
    tax: 0,
    total: 3000,
    status: 'Draft',
    notes: 'School Sports Shoes Bulk 4 pairs',
    items: [
      { item_name: 'School Sneaker White', size: '6', quantity: 4, unit_price: 800, total_price: 3200 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_SALES: SaleRecord[] = [
  {
    id: 'sale-1024',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    receipt_number: 'REC-1024',
    created_by_user_id: 'usr-admin-01',
    created_by_name: 'Ahmed Khan (Admin)',
    customer_id: 'cust-1',
    customer_name: 'Rahul',
    customer_phone: '9820011223',
    subtotal: 1500,
    discount: 0,
    tax: 0,
    total: 1500,
    cash_amount: 1500,
    online_amount: 0,
    due_amount: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    items: [{ item_name: 'Men Casual Loafer', size: '8', quantity: 1, unit_price: 1500, total_price: 1500 }],
    payments: [{ payment_type: 'cash', amount: 1500 }],
  },
  {
    id: 'sale-1023',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    receipt_number: 'REC-1023',
    created_by_user_id: 'usr-admin-01',
    created_by_name: 'Ahmed Khan (Admin)',
    customer_id: 'cust-2',
    customer_name: 'Amit',
    customer_phone: '9820033445',
    subtotal: 2300,
    discount: 0,
    tax: 0,
    total: 2300,
    cash_amount: 0,
    online_amount: 2300,
    due_amount: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    items: [{ item_name: 'Running Sport Sneakers', size: '9', quantity: 1, unit_price: 2300, total_price: 2300 }],
    payments: [{ payment_type: 'upi', amount: 2300 }],
  },
  {
    id: 'sale-1022',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    receipt_number: 'REC-1022',
    created_by_user_id: 'usr-admin-01',
    created_by_name: 'Ahmed Khan (Admin)',
    customer_name: 'Karan',
    customer_phone: '9820099887',
    subtotal: 3500,
    discount: 0,
    tax: 0,
    total: 3500,
    cash_amount: 3500,
    online_amount: 0,
    due_amount: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    items: [{ item_name: 'Leather Oxford Formal Shoes', size: '8', quantity: 1, unit_price: 3500, total_price: 3500 }],
    payments: [{ payment_type: 'cash', amount: 3500 }],
  },
  {
    id: 'sale-1021',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    receipt_number: 'REC-1021',
    created_by_user_id: 'usr-admin-01',
    created_by_name: 'Ahmed Khan (Admin)',
    customer_name: 'Priya',
    customer_phone: '9820044556',
    subtotal: 3200,
    discount: 0,
    tax: 0,
    total: 3200,
    cash_amount: 0,
    online_amount: 3200,
    due_amount: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    items: [{ item_name: 'Women Block Heel Sandals', size: '6', quantity: 2, unit_price: 1600, total_price: 3200 }],
    payments: [{ payment_type: 'upi', amount: 3200 }],
  },
  {
    id: 'sale-1020',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    receipt_number: 'REC-1020',
    created_by_user_id: 'usr-admin-01',
    created_by_name: 'Ahmed Khan (Admin)',
    customer_name: 'Suresh',
    customer_phone: '9820066778',
    subtotal: 2000,
    discount: 0,
    tax: 0,
    total: 2000,
    cash_amount: 2000,
    online_amount: 0,
    due_amount: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    items: [{ item_name: 'Comfort Daily Slippers', size: '7', quantity: 2, unit_price: 1000, total_price: 2000 }],
    payments: [{ payment_type: 'cash', amount: 2000 }],
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
  customerLedgers: Record<string, CustomerLedgerEntry[]>;
  estimates: Estimate[];
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
  recordCustomerPayment: (paymentData: {
    customer_id: string;
    amount: number;
    payment_account_id?: string;
    payment_method: 'cash' | 'upi' | 'card' | 'bank';
    notes?: string;
  }) => CustomerLedgerEntry;

  // Estimates
  addEstimate: (estimateData: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'estimate_number'> & { estimate_number?: string }) => Estimate;
  updateEstimate: (estimateId: string, estimateData: Partial<Estimate>) => void;
  deleteEstimate: (estimateId: string) => void;
  convertEstimateToSale: (
    estimateId: string,
    paymentDetails: {
      cash_amount: number;
      online_amount: number;
      due_amount?: number;
      payments: Array<{ payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit'; amount: number }>;
    }
  ) => SaleRecord;

  // Vendors & Purchases
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

  // Customers State
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

  // Estimates State
  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    const saved = localStorage.getItem('zain_pos_estimates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ESTIMATES;
      }
    }
    return DEFAULT_ESTIMATES;
  });

  useEffect(() => {
    localStorage.setItem('zain_pos_estimates', JSON.stringify(estimates));
  }, [estimates]);

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

  // Payment Accounts State
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([
    {
      id: 'acc-cash-01',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      name: 'Cash Counter Register',
      type: 'cash',
      current_balance: 7000.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'acc-upi-02',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      name: 'UPI / QR (PhonePe/GPay)',
      type: 'upi',
      current_balance: 5500.0,
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
      current_balance: 45000.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]);

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'v-101',
      organization_id: 'org-footwear-101',
      name: 'ABC Footwear Mills',
      business_name: 'ABC Footwear Mills Pvt Ltd',
      category: 'Leather Shoes',
      contact_person: 'Ramesh Gupta',
      phone: '9820011111',
      city: 'Agra',
      credit_limit: 100000,
      payment_terms: 30,
      weekly_payment_day: 'Monday',
      opening_balance: 25000,
      current_balance: 25000, // You will give ₹25,000
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'v-102',
      organization_id: 'org-footwear-101',
      name: 'XYZ Traders & Sole',
      business_name: 'XYZ Traders Sole Suppliers',
      category: 'Sports & Soles',
      contact_person: 'Imran Shaikh',
      phone: '9820022222',
      city: 'Kanpur',
      credit_limit: 50000,
      payment_terms: 15,
      weekly_payment_day: 'Thursday',
      opening_balance: 8500,
      current_balance: 8500, // You will give ₹8,500
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vendorLedgers, setVendorLedgers] = useState<Record<string, VendorLedgerEntry[]>>({
    'v-101': [
      {
        id: 'vl-1-1',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-101',
        transaction_type: 'PURCHASE',
        reference_number: 'BILL-4401',
        business_date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
        debit: 0,
        credit: 30000,
        running_balance: 30000,
        description: 'Purchase Shipment #BILL-4401 (Leather Loafers)',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'vl-1-2',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-101',
        transaction_type: 'PAYMENT',
        reference_number: 'VPAY-101',
        business_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        debit: 5000,
        credit: 0,
        running_balance: 25000,
        description: 'Payment via Bank Transfer',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    'v-102': [
      {
        id: 'vl-2-1',
        organization_id: 'org-footwear-101',
        vendor_id: 'v-102',
        transaction_type: 'PURCHASE',
        reference_number: 'BILL-9081',
        business_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        debit: 0,
        credit: 8500,
        running_balance: 8500,
        description: 'Stock Purchase (Sport Soles & Laces)',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  });

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp-1',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      category_name: 'Tea & Refreshments',
      title: 'Staff Afternoon Tea & Snacks',
      amount: 250,
      business_date: new Date().toISOString().split('T')[0],
      expense_date: new Date().toISOString(),
      status: 'PAID',
      payment_account_id: 'acc-cash-01',
      payment_method: 'Cash',
      created_at: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      category_name: 'Transport',
      title: 'Carton Delivery Porter Charges',
      amount: 500,
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
      id: 'emp-101',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_code: 'EMP-01',
      full_name: 'Vikram Singh',
      designation: 'Store Manager',
      phone: '+91 98200 44556',
      email: 'vikram@zainfootwear.com',
      base_salary: 28000,
      joining_date: '2025-01-10',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-102',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_code: 'EMP-02',
      full_name: 'Pooja Verma',
      designation: 'Senior Sales / Cashier',
      phone: '+91 98200 77889',
      email: 'pooja@zainfootwear.com',
      base_salary: 18000,
      joining_date: '2025-03-15',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-103',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_code: 'EMP-03',
      full_name: 'Rohan Deshmukh',
      designation: 'Floor Sales Assistant',
      phone: '+91 98200 99001',
      email: 'rohan@zainfootwear.com',
      base_salary: 15000,
      joining_date: '2025-06-01',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    {
      id: 'att-1',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: 'emp-101',
      employee_name: 'Vikram Singh',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      check_in_time: '09:45:00',
      created_at: new Date().toISOString(),
    },
    {
      id: 'att-2',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: 'emp-102',
      employee_name: 'Pooja Verma',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      check_in_time: '10:00:00',
      created_at: new Date().toISOString(),
    },
    {
      id: 'att-3',
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: 'emp-103',
      employee_name: 'Rohan Deshmukh',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      check_in_time: '10:15:00',
      created_at: new Date().toISOString(),
    },
  ]);

  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [activeCashSession, setActiveCashSession] = useState<CashSession | null>({
    id: 'sess-today',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    business_date: new Date().toISOString().split('T')[0],
    opened_at: new Date().toISOString(),
    opening_cash: 5000,
    expected_cash: 12000,
    requires_approval: false,
    status: 'OPEN',
    created_at: new Date().toISOString(),
  });

  const [isLoading] = useState<boolean>(false);

  // Authentication Handlers
  const loginAsUserProfile = (user: UserProfile) => {
    const updatedUser = { ...user, last_login: new Date().toISOString() };
    setUserProfile(updatedUser);
    const userRole = (user.role as ActiveRole) || 'ADMIN';
    setActiveRole(userRole);
    localStorage.setItem('zain_pos_current_user', JSON.stringify(updatedUser));

    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
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

  const hasPermission = (permissionKey: string): boolean => {
    if (!activeRole) return false;
    if (activeRole === 'ADMIN') return true;

    switch (activeRole) {
      case 'MANAGER':
        return ![
          'settings:manage',
          'users:manage',
          'finance:export_confidential',
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
          'estimates:view',
          'estimates:manage',
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
          'estimates:view',
        ].includes(permissionKey);
      default:
        return false;
    }
  };

  // Customers Management
  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer => {
    const newCustId = `cust_${Date.now()}`;
    const openingBal = customerData.opening_balance || customerData.current_balance || 0;
    const newCust: Customer = {
      ...customerData,
      id: newCustId,
      opening_balance: openingBal,
      current_balance: openingBal,
      total_purchases_count: customerData.total_purchases_count || 0,
      total_spent: customerData.total_spent || 0,
      last_purchase_date: customerData.last_purchase_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCustomers((prev) => [newCust, ...prev]);

    if (openingBal !== 0) {
      setCustomerLedgers((prev) => ({
        ...prev,
        [newCustId]: [
          {
            id: `cl_${newCustId}_init`,
            organization_id: newCust.organization_id || 'org-footwear-101',
            customer_id: newCustId,
            transaction_type: 'OPENING_BALANCE',
            business_date: new Date().toISOString().split('T')[0],
            debit: openingBal > 0 ? openingBal : 0,
            credit: openingBal < 0 ? Math.abs(openingBal) : 0,
            running_balance: openingBal,
            description: 'Opening Balance',
            created_at: new Date().toISOString(),
          },
        ],
      }));
    }

    return newCust;
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

  // Record Customer Payment (Receive Money)
  const recordCustomerPayment = (paymentData: {
    customer_id: string;
    amount: number;
    payment_account_id?: string;
    payment_method: 'cash' | 'upi' | 'card' | 'bank';
    notes?: string;
  }): CustomerLedgerEntry => {
    const cust = customers.find((c) => c.id === paymentData.customer_id);
    const prevBalance = cust?.current_balance || 0;
    const newBalance = prevBalance - paymentData.amount;

    // Update customer balance
    setCustomers((prev) =>
      prev.map((c) => (c.id === paymentData.customer_id ? { ...c, current_balance: newBalance, updated_at: new Date().toISOString() } : c))
    );

    // Update selected payment account balance
    const targetAccountId = paymentData.payment_account_id || (paymentData.payment_method === 'cash' ? 'acc-cash-01' : 'acc-upi-02');
    setPaymentAccounts((prevAccs) =>
      prevAccs.map((acc) =>
        acc.id === targetAccountId || (paymentData.payment_method === acc.type)
          ? { ...acc, current_balance: acc.current_balance + paymentData.amount }
          : acc
      )
    );

    // Add to Customer Ledger
    const entryId = `cl_${Date.now()}`;
    const ledgerEntry: CustomerLedgerEntry = {
      id: entryId,
      organization_id: 'org-footwear-101',
      customer_id: paymentData.customer_id,
      transaction_type: 'PAYMENT',
      reference_number: `PAY-${Date.now().toString().slice(-4)}`,
      business_date: new Date().toISOString().split('T')[0],
      debit: 0,
      credit: paymentData.amount,
      running_balance: newBalance,
      description: paymentData.notes || `Payment Received via ${paymentData.payment_method.toUpperCase()}`,
      created_at: new Date().toISOString(),
    };

    setCustomerLedgers((prev) => {
      const list = prev[paymentData.customer_id] || [];
      return { ...prev, [paymentData.customer_id]: [...list, ledgerEntry] };
    });

    return ledgerEntry;
  };

  // Central Sale Handler (Supports Split Payments & Dues)
  const recordSale = (saleData: Omit<SaleRecord, 'id' | 'created_at'>): SaleRecord => {
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale_${Date.now()}`,
      due_amount: saleData.due_amount || 0,
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

    // Update session expected cash if cash was received
    if (activeCashSession && newSale.cash_amount > 0) {
      setActiveCashSession({
        ...activeCashSession,
        expected_cash: activeCashSession.expected_cash + newSale.cash_amount,
      });
    }

    // Customer balance reconciliation & CRM record
    const cleanPhone = (saleData.customer_phone || '').trim();
    const cleanName = (saleData.customer_name || 'Walk-in Customer').trim();
    const dueAmount = newSale.due_amount || 0;

    let targetCustomerId = saleData.customer_id;

    setCustomers((prev) => {
      let existing = prev.find(
        (c) =>
          (targetCustomerId && c.id === targetCustomerId) ||
          (cleanPhone && cleanPhone !== 'N/A' && c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')) ||
          (cleanName && cleanName !== 'Walk-in Customer' && c.name.toLowerCase() === cleanName.toLowerCase())
      );

      if (existing) {
        targetCustomerId = existing.id;
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                name: cleanName !== 'Walk-in Customer' ? cleanName : c.name,
                phone: cleanPhone || c.phone,
                current_balance: (c.current_balance || 0) + dueAmount,
                total_purchases_count: c.total_purchases_count + 1,
                total_spent: c.total_spent + newSale.total,
                last_purchase_date: newSale.created_at,
                updated_at: new Date().toISOString(),
              }
            : c
        );
      }

      if (cleanName !== 'Walk-in Customer' || cleanPhone || dueAmount > 0) {
        const newCustomer: Customer = {
          id: `cust_${Date.now()}`,
          organization_id: saleData.organization_id || 'org-footwear-101',
          shop_id: saleData.shop_id,
          name: cleanName,
          phone: cleanPhone || 'N/A',
          opening_balance: 0,
          current_balance: dueAmount,
          total_purchases_count: 1,
          total_spent: newSale.total,
          last_purchase_date: newSale.created_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        targetCustomerId = newCustomer.id;
        return [newCustomer, ...prev];
      }

      return prev;
    });

    // If customer identified, record customer ledger entry
    if (targetCustomerId) {
      setCustomerLedgers((prev) => {
        const list = prev[targetCustomerId!] || [];
        const prevBal = list.length > 0 ? list[list.length - 1].running_balance : 0;
        const newBal = prevBal + dueAmount;

        const ledgerEntry: CustomerLedgerEntry = {
          id: `cl_sale_${Date.now()}`,
          organization_id: 'org-footwear-101',
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

  // Estimates Management
  const addEstimate = (
    estimateData: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'estimate_number'> & { estimate_number?: string }
  ): Estimate => {
    const count = estimates.length + 1;
    const estNumber = estimateData.estimate_number || `EST-${100 + count}`;
    const newEst: Estimate = {
      ...estimateData,
      id: `est_${Date.now()}`,
      estimate_number: estNumber,
      status: estimateData.status || 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEstimates((prev) => [newEst, ...prev]);
    return newEst;
  };

  const updateEstimate = (estimateId: string, estimateData: Partial<Estimate>) => {
    setEstimates((prev) =>
      prev.map((est) => (est.id === estimateId ? { ...est, ...estimateData, updated_at: new Date().toISOString() } : est))
    );
  };

  const deleteEstimate = (estimateId: string) => {
    setEstimates((prev) => prev.filter((est) => est.id !== estimateId));
  };

  const convertEstimateToSale = (
    estimateId: string,
    paymentDetails: {
      cash_amount: number;
      online_amount: number;
      due_amount?: number;
      payments: Array<{ payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit'; amount: number }>;
    }
  ): SaleRecord => {
    const est = estimates.find((e) => e.id === estimateId);
    if (!est) throw new Error('Estimate not found');

    const count = sales.length + 1;
    const receiptNum = `REC-${1020 + count}`;

    const createdSale = recordSale({
      organization_id: est.organization_id || 'org-footwear-101',
      shop_id: est.shop_id || activeShop?.id || 'shop-mumbai-01',
      receipt_number: receiptNum,
      created_by_user_id: userProfile?.id || 'usr-admin-01',
      created_by_name: userProfile?.full_name || 'Staff',
      customer_id: est.customer_id,
      customer_name: est.customer_name,
      customer_phone: est.customer_phone,
      subtotal: est.subtotal,
      discount: est.discount,
      tax: est.tax,
      total: est.total,
      cash_amount: paymentDetails.cash_amount,
      online_amount: paymentDetails.online_amount,
      due_amount: paymentDetails.due_amount || 0,
      items: est.items,
      payments: paymentDetails.payments,
    });

    // Mark estimate as Converted
    updateEstimate(estimateId, {
      status: 'Converted',
      converted_sale_id: createdSale.id,
    });

    return createdSale;
  };

  // Vendor & Purchase Handlers
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

    // Ledger entries
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

    setVendors((prev) =>
      prev.map((v) =>
        v.id === paymentData.vendor_id ? { ...v, current_balance: remainingOutstanding } : v
      )
    );

    setPaymentAccounts((prevAccs) =>
      prevAccs.map((acc) =>
        acc.id === paymentData.payment_account_id
          ? { ...acc, current_balance: acc.current_balance - paymentData.amount_paid }
          : acc
      )
    );

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

    setPaymentAccounts((prevAccs) =>
      prevAccs.map((acc) =>
        acc.id === salaryData.payment_account_id
          ? { ...acc, current_balance: acc.current_balance - netSalary }
          : acc
      )
    );

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
        customerLedgers,
        estimates,
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

        addEstimate,
        updateEstimate,
        deleteEstimate,
        convertEstimateToSale,

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
