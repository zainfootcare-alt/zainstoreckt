-- ============================================================================
-- ZAIN FOOTWEAR POS — BULLETPROOF SUPABASE SCHEMA (Idempotent & Migration-Safe)
-- Run this in Supabase Dashboard → SQL Editor
-- Project URL: https://fcgtjbmrguziyctvqfjr.supabase.co
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE system_role_enum AS ENUM ('ADMIN', 'MANAGER', 'CASHIER', 'FINANCE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status_enum AS ENUM ('present', 'absent', 'half_day', 'leave');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cash_session_status_enum AS ENUM ('OPEN', 'CLOSED', 'PENDING_APPROVAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 3. TABLES (CREATE IF NOT EXISTS)
-- ============================================================================

-- ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    gstin VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHOPS
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address_line_1 TEXT,
    city VARCHAR(100),
    postcode VARCHAR(20),
    gstin VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROFILES (Custom Auth - Independent of Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100),
    full_name VARCHAR(255),
    organization_id UUID REFERENCES public.organizations(id),
    default_shop_id UUID REFERENCES public.shops(id),
    role system_role_enum DEFAULT 'CASHIER',
    pin VARCHAR(100),
    password VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on user_profiles if it was previously created
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS default_shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role system_role_enum DEFAULT 'CASHIER';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop auth.users foreign key if old schema had it
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
          AND table_name = 'user_profiles' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%auth%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- PAYMENT ACCOUNTS
CREATE TABLE IF NOT EXISTS public.payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CASH SESSIONS
CREATE TABLE IF NOT EXISTS public.cash_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES public.user_profiles(id),
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opening_cash NUMERIC(12, 2) DEFAULT 0.00,
    expected_cash NUMERIC(12, 2) DEFAULT 0.00,
    counted_cash NUMERIC(12, 2),
    variance NUMERIC(12, 2),
    variance_reason TEXT,
    closing_note TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    status cash_session_status_enum DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    total_purchases_count INT DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    last_purchase_date TIMESTAMPTZ,
    city VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMER LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS public.customer_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    debit NUMERIC(12, 2) DEFAULT 0.00,
    credit NUMERIC(12, 2) DEFAULT 0.00,
    running_balance NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALES
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    created_by_user_id UUID,
    created_by_name VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    cash_amount NUMERIC(12, 2) DEFAULT 0.00,
    online_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure customer columns exist on sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS due_amount NUMERIC(12, 2) DEFAULT 0.00;

-- SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- SALE PAYMENTS
CREATE TABLE IF NOT EXISTS public.sale_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_ref VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDORS / PARTIES
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    category VARCHAR(100),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    whatsapp_phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    gstin VARCHAR(50),
    bank_details JSONB,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    payment_terms INT DEFAULT 30,
    weekly_payment_day VARCHAR(20) DEFAULT 'Monday',
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASES
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255),
    bill_number VARCHAR(100) NOT NULL,
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    entry_type VARCHAR(50) DEFAULT 'amount_only',
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    transport_charges NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    other_charges NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Due',
    status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    invoice_attachment_path TEXT,
    is_immutable BOOLEAN DEFAULT FALSE,
    is_voided BOOLEAN DEFAULT FALSE,
    void_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS public.vendor_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    debit NUMERIC(12, 2) DEFAULT 0.00,
    credit NUMERIC(12, 2) DEFAULT 0.00,
    running_balance NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR PAYMENTS
CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    previous_outstanding NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL,
    remaining_outstanding NUMERIC(12, 2) DEFAULT 0.00,
    payment_account_id UUID REFERENCES public.payment_accounts(id),
    payment_account_name VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL,
    reference_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    vendor_name VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL,
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PAID',
    payment_account_id UUID REFERENCES public.payment_accounts(id),
    payment_method VARCHAR(50),
    receipt_attachment_path TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    is_immutable BOOLEAN DEFAULT FALSE,
    is_voided BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_code)
);

-- ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255),
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status_enum NOT NULL DEFAULT 'present',
    check_in_time VARCHAR(30),
    check_out_time VARCHAR(30),
    manager_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- SALARY PAYMENTS
CREATE TABLE IF NOT EXISTS public.salary_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255),
    month_year VARCHAR(10),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    gross_salary NUMERIC(12, 2) NOT NULL,
    deductions NUMERIC(12, 2) DEFAULT 0.00,
    advances NUMERIC(12, 2) DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL,
    net_salary_paid NUMERIC(12, 2),
    payment_account_id UUID REFERENCES public.payment_accounts(id),
    payment_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TODOS
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'SHOP_TASK',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_by_user_id UUID,
    created_by_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ESTIMATES
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id),
    estimate_number VARCHAR(100) NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    notes TEXT,
    items JSONB DEFAULT '[]',
    converted_sale_id UUID REFERENCES public.sales(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES (Safe Drop & Create)
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'organizations', 'shops', 'user_profiles', 'payment_accounts', 'cash_sessions',
      'customers', 'customer_ledger_entries', 'sales', 'sale_items', 'sale_payments',
      'vendors', 'purchases', 'vendor_ledger_entries', 'vendor_payments', 'expenses',
      'employees', 'attendance_records', 'salary_payments', 'todos', 'estimates'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Allow all for anon" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- 5. SEED DATA (Safe Upserts)
-- ============================================================================

-- 1. Organization
INSERT INTO public.organizations (id, name, currency, tax_rate)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Zain Footwear', 'INR', 0.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Main Store
INSERT INTO public.shops (id, organization_id, name, code, email, is_active)
VALUES ('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Zain Footwear (Main Store)', 'ZAIN-01', 'saif@admin.com', TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Ensure email is unique in user_profiles
DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- 3. Saif Admin Profile
INSERT INTO public.user_profiles (id, email, username, full_name, organization_id, default_shop_id, role, pin, status)
VALUES (
    'c3000000-0000-0000-0000-000000000003',
    'saif@admin.com',
    'saif',
    'Saif',
    'a1000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000002',
    'ADMIN',
    'Saif@Zain',
    'Active'
)
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    role = 'ADMIN',
    pin = 'Saif@Zain',
    status = 'Active';

-- 4. Payment Accounts
INSERT INTO public.payment_accounts (id, organization_id, shop_id, name, type, current_balance, is_active)
VALUES
    ('d4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'Cash Counter Register', 'cash', 0.00, TRUE),
    ('d4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'UPI / QR (PhonePe/GPay)', 'upi',  0.00, TRUE),
    ('d4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'Card POS Machine',       'card', 0.00, TRUE),
    ('d4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', 'Main Bank Account',       'bank', 0.00, TRUE)
ON CONFLICT (id) DO NOTHING;
