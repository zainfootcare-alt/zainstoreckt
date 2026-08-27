export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SystemRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'CASHIER'
  | 'FINANCE'
  | 'owner'
  | 'shop_admin'
  | 'cashier'
  | 'purchase_manager'
  | 'accountant'
  | 'inventory_manager'
  | 'marketing_manager'
  | 'viewer';

export type ActiveRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'FINANCE';

export type PermissionKey =
  | 'dashboard:view'
  | 'sales:view'
  | 'sales:create'
  | 'sales:void'
  | 'purchases:view'
  | 'purchases:manage'
  | 'vendors:view'
  | 'vendors:manage'
  | 'finance:view'
  | 'finance:manage'
  | 'cash_close:manage'
  | 'inventory:view'
  | 'inventory:manage'
  | 'orders:view'
  | 'orders:manage'
  | 'staff:view'
  | 'staff:manage'
  | 'salary:view'
  | 'salary:manage'
  | 'marketing:view'
  | 'marketing:manage'
  | 'reports:view'
  | 'settings:manage';

export interface Organization {
  id: string;
  name: string;
  currency: string; // 'INR'
  tax_rate: number; // e.g. 12% GST
  gstin?: string;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address_line_1?: string;
  city?: string; // 'Mumbai', 'Delhi', 'Agra', 'Kanpur', 'Bengaluru'
  postcode?: string;
  gstin?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoItem {
  id: string;
  organization_id: string;
  shop_id?: string;
  title: string;
  description?: string;
  category: 'SHOP_TASK' | 'SUPPLIER_PAYMENT' | 'CUSTOMER_FOLLOWUP' | 'SELF_GROWTH';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  created_by_user_id?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  organization_id?: string;
  default_shop_id?: string;
  is_onboarded?: boolean;
  role?: SystemRole;
  pin?: string;
  password?: string;
  status?: 'Active' | 'Inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserShopRole {
  id: string;
  user_id: string;
  organization_id: string;
  shop_id: string | null;
  role_key: SystemRole;
  created_at: string;
}

// FOOTWEAR PRODUCT DOMAIN
export type FootwearCategory =
  | 'Formal Shoes'
  | 'Sneakers & Casuals'
  | 'Sports & Running Shoes'
  | 'Sandals & Slippers'
  | 'Boots & Leather'
  | 'Accessories & Care';

export interface Product {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  category: FootwearCategory;
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids';
  brand: string; // 'SoleCraft', 'Bata', 'Red Chief', 'Paragon', 'Woodland', 'Puma'
  size_uk_ind: string; // '6', '7', '8', '9', '10', '11'
  sale_price: number; // in INR ₹
  cost_price: number; // in INR ₹
  preferred_vendor_id?: string;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  on_hand?: number;
  reserved?: number;
  available?: number;
}

export interface StockBalance {
  id: string;
  organization_id: string;
  shop_id: string;
  product_id: string;
  on_hand: number;
  reserved: number;
  available: number;
  updated_at: string;
}

export type InventoryMovementType =
  | 'OPENING_STOCK'
  | 'PURCHASE_IN'
  | 'SALE_OUT'
  | 'CUSTOMER_RETURN_IN'
  | 'VENDOR_RETURN_OUT'
  | 'DAMAGE'
  | 'COUNT_ADJUSTMENT';

export interface InventoryMovement {
  id: string;
  organization_id: string;
  shop_id: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  reference_id?: string;
  reference_number?: string;
  unit_cost: number;
  notes?: string;
  created_at: string;
  product_name?: string;
  sku?: string;
}

export interface DemandLog {
  id: string;
  organization_id: string;
  shop_id: string;
  product_id?: string;
  requested_item_text: string;
  quantity: number;
  customer_id?: string;
  salesperson_name: string;
  status: 'PENDING' | 'CONVERTED_TO_PO' | 'FULFILLED' | 'DISCARDED';
  converted_po_id?: string;
  notes?: string;
  created_at: string;
  customer_name?: string;
}

export type CustomerOrderStatus =
  | 'New'
  | 'Purchase Required'
  | 'Ordered from Vendor'
  | 'Received'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export interface CustomerOrder {
  id: string;
  organization_id: string;
  shop_id: string;
  order_number: string;
  customer_id?: string;
  promised_date?: string;
  status: CustomerOrderStatus;
  total_amount: number;
  advance_paid: number;
  balance_due: number;
  linked_vendor_id?: string;
  linked_purchase_id?: string;
  owner_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  items?: CustomerOrderItem[];
}

export interface CustomerOrderItem {
  id: string;
  organization_id: string;
  customer_order_id: string;
  product_id?: string;
  item_name: string;
  sku?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// FINANCE & PAYMENT ACCOUNTS (INR ₹)
export interface PaymentAccount {
  id: string;
  organization_id: string;
  shop_id: string;
  name: string; // 'Main Cash Register', 'UPI QR Code (PhonePe/Paytm)', 'Card POS Machine', 'HDFC Bank Account'
  type: 'cash' | 'upi' | 'card' | 'bank' | 'credit';
  current_balance: number; // in INR ₹
  is_active: boolean;
  created_at: string;
}

export interface CashSession {
  id: string;
  organization_id: string;
  shop_id: string;
  cashier_id?: string;
  business_date: string;
  opened_at: string;
  closed_at?: string;
  opening_cash: number; // in INR ₹
  expected_cash: number;
  counted_cash?: number;
  variance?: number;
  variance_reason?: string;
  requires_approval: boolean;
  status: 'OPEN' | 'CLOSED' | 'PENDING_APPROVAL';
  created_at: string;
}

export interface MoneyTransaction {
  id: string;
  organization_id: string;
  shop_id: string;
  payment_account_id?: string;
  cash_session_id?: string;
  sale_id?: string;
  type: 'SALE_INFLOW' | 'EXPENSE_OUTFLOW' | 'REFUND_OUTFLOW' | 'TRANSFER' | 'VOID_REVERSAL';
  amount: number; // in INR ₹
  business_date: string;
  description: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  business_name?: string;
  category: string; // 'Leather Footwear', 'Sports Shoes', 'Sole & Materials', 'Shoe Boxes & Packaging'
  contact_person?: string;
  phone?: string;
  whatsapp_phone?: string;
  email?: string;
  city?: string; // 'Agra', 'Kanpur', 'Delhi', 'Mumbai'
  address?: string;
  gstin?: string;
  bank_details?: {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
  };
  credit_limit: number;
  payment_terms: number;
  weekly_payment_day?: string;
  opening_balance: number;
  current_balance: number;
  status: 'Active' | 'On Hold' | 'Inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  shop_id: string;
  vendor_id: string;
  po_number: string;
  order_date: string;
  expected_delivery_date?: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  vendor_name?: string;
}

export interface Purchase {
  id: string;
  organization_id: string;
  shop_id: string;
  vendor_id: string;
  purchase_order_id?: string;
  bill_number: string;
  business_date: string;
  due_date: string;
  entry_type: 'itemized' | 'amount_only';
  subtotal: number;
  transport_charges: number;
  tax: number;
  other_charges: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  status: string;
  invoice_attachment_path?: string;
  is_immutable: boolean;
  is_voided: boolean;
  void_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  vendor_name?: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  shop_id: string;
  employee_code: string;
  full_name: string;
  designation: string; // 'Store Manager', 'Senior Shoe Craftsman', 'Sales Executive', 'Cashier'
  phone?: string;
  email?: string;
  base_salary: number; // in INR ₹
  joining_date: string;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  organization_id: string;
  shop_id: string;
  employee_id: string;
  employee_name?: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  check_in_time?: string;
  check_out_time?: string;
  manager_notes?: string;
  created_at: string;
}

export interface SalaryPayment {
  id: string;
  organization_id: string;
  shop_id: string;
  employee_id: string;
  employee_name?: string;
  payment_date: string;
  gross_salary: number;
  deductions: number;
  advances: number;
  net_salary: number;
  payment_account_id?: string;
  payment_reference: string;
  status: 'UNPAID' | 'PAID';
  created_at: string;
}

export interface TaskItem {
  id: string;
  organization_id: string;
  shop_id: string;
  title: string;
  module: 'Vendors' | 'Inventory' | 'Sales' | 'Marketing' | 'Finance' | 'General';
  owner_name: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  due_date: string;
  due_time?: string;
  recurrence: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  status: 'Todo' | 'In Progress' | 'Done' | 'Overdue';
  notes?: string;
  created_at: string;
}

export interface MarketingPost {
  id: string;
  organization_id: string;
  shop_id: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'Email' | 'Google';
  content_type: 'Image' | 'Video Reel' | 'Newsletter' | 'Promo Banner';
  caption: string;
  publish_date: string;
  owner_name: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  post_url?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  start_date: string;
  end_date: string;
  planned_spend: number;
  actual_spend: number;
  leads_generated: number;
  attributed_sales: number;
  notes?: string;
  created_at: string;
}

export interface PriorityItem {
  id: string;
  rank: number;
  category: string;
  title: string;
  urgency: 'URGENT' | 'HIGH' | 'MEDIUM';
  target_link: string;
  details: string;
}

export interface AppNotification {
  id: string;
  organization_id: string;
  shop_id?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'EMAIL_LOG';
  is_read: boolean;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  organization_id: string;
  shop_id?: string;
  name: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'VENDOR_DUE_ALERT';
  cron_expression: string;
  recipient_email: string;
  test_mode: boolean;
  allowlist_email: string;
  is_active: boolean;
  created_at: string;
}

export interface ReportRun {
  id: string;
  organization_id: string;
  schedule_id: string;
  period_key: string;
  recipient_email: string;
  idempotency_key: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED_DUPLICATE';
  resend_email_id?: string;
  sent_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  shop_id?: string;
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Expense {
  id: string;
  organization_id: string;
  shop_id: string;
  category_name: string;
  title: string;
  vendor_name?: string;
  amount: number;
  business_date: string;
  expense_date: string;
  status: 'PAID' | 'UNPAID';
  payment_account_id?: string;
  payment_method?: string;
  receipt_attachment_path?: string;
  requires_approval?: boolean;
  is_approved?: boolean;
  is_immutable?: boolean;
  is_voided?: boolean;
  notes?: string;
  created_at: string;
}

export interface ExpensePayable {
  id: string;
  expense_id: string;
  amount: number;
  due_date: string;
  status: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  frequency: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  shop_id?: string;
  name: string;
  phone: string;
  email?: string;
  opening_balance?: number;
  current_balance?: number; // Positive = Customer owes us ("You will receive"), Negative = We owe customer ("You will give"), 0 = Settled
  total_purchases_count: number;
  total_spent: number;
  last_purchase_date?: string;
  city?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerLedgerEntry {
  id: string;
  organization_id: string;
  customer_id: string;
  transaction_type: 'SALE' | 'PAYMENT' | 'OPENING_BALANCE' | 'ESTIMATE_CONVERTED' | 'RETURN';
  reference_number?: string;
  business_date: string;
  debit: number; // Sale/Due increases receivable balance
  credit: number; // Payment received decreases receivable balance
  running_balance: number;
  description: string;
  created_at: string;
}

export interface Estimate {
  id: string;
  organization_id: string;
  shop_id?: string;
  estimate_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Converted' | 'Rejected';
  notes?: string;
  items: Array<{
    item_name: string;
    size?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  converted_sale_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit';
  amount: number;
  transaction_ref?: string;
}

export interface SaleRecord {
  id: string;
  organization_id: string;
  shop_id: string;
  receipt_number: string;
  created_by_user_id: string;
  created_by_name: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cash_amount: number;
  online_amount: number;
  due_amount?: number;
  created_at: string;
  items: Array<{
    item_name: string;
    size?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  payments: Array<{
    payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit';
    amount: number;
  }>;
}

export interface VendorLedgerEntry {
  id: string;
  organization_id: string;
  vendor_id: string;
  transaction_type: 'OPENING_BALANCE' | 'PURCHASE' | 'PAYMENT' | 'CREDIT_NOTE';
  reference_number?: string;
  business_date: string;
  debit: number; // payment made reduces due
  credit: number; // purchase increases due
  running_balance: number;
  description: string;
  created_at: string;
}

export interface VendorPayment {
  id: string;
  organization_id: string;
  shop_id: string;
  vendor_id: string;
  vendor_name: string;
  payment_date: string;
  previous_outstanding: number;
  amount_paid: number;
  remaining_outstanding: number;
  payment_account_id: string;
  payment_account_name: string;
  payment_method: string;
  reference_notes?: string;
  created_at: string;
}

export interface DailyShopSummary {
  date: string;
  total_sales: number;
  cash_sales: number;
  online_sales: number;
  total_purchases: number;
  party_payments: number;
  other_expenses: number;
  staff_present_count: number;
  party_outstanding: number;
}
