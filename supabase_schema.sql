-- ============================================================================
-- ZAIN FOOTWEAR - COMPLETE SUPABASE BACKEND SCHEMA & RPC FUNCTIONS
-- Copy and run this script in Supabase SQL Editor (https://app.supabase.com)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE system_role_enum AS ENUM ('ADMIN', 'MANAGER', 'CASHIER', 'FINANCE');
CREATE TYPE attendance_status_enum AS ENUM ('present', 'absent', 'half_day', 'leave');
CREATE TYPE cash_session_status_enum AS ENUM ('OPEN', 'CLOSED', 'PENDING_APPROVAL');

-- 3. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    tax_rate NUMERIC(5, 2) DEFAULT 12.00,
    gstin VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SHOPS TABLE
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization_id UUID REFERENCES public.organizations(id),
    default_shop_id UUID REFERENCES public.shops(id),
    role system_role_enum DEFAULT 'CASHIER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENT ACCOUNTS TABLE (Cash Counter, UPI, Card, Bank)
CREATE TABLE IF NOT EXISTS public.payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'cash', 'upi', 'card', 'bank'
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CASH SESSIONS TABLE (Daily Cash Drawer Closing)
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
    requires_approval BOOLEAN DEFAULT FALSE,
    status cash_session_status_enum DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    created_by_user_id UUID REFERENCES public.user_profiles(id),
    created_by_name VARCHAR(255) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    cash_amount NUMERIC(12, 2) DEFAULT 0.00,
    online_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 10. SALE PAYMENTS TABLE (Split Payment Entries)
CREATE TABLE IF NOT EXISTS public.sale_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL, -- 'cash', 'upi', 'card', 'bank'
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. VENDORS / PARTIES TABLE
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

-- 12. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    bill_number VARCHAR(100) NOT NULL,
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    total NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Due',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. VENDOR LEDGER ENTRIES TABLE (Append-Only)
CREATE TABLE IF NOT EXISTS public.vendor_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'OPENING_BALANCE', 'PURCHASE', 'PAYMENT'
    reference_number VARCHAR(100),
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    debit NUMERIC(12, 2) DEFAULT 0.00,  -- Payment reduces balance
    credit NUMERIC(12, 2) DEFAULT 0.00, -- Purchase increases balance
    running_balance NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. VENDOR PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    previous_outstanding NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    remaining_outstanding NUMERIC(12, 2) NOT NULL,
    payment_account_id UUID REFERENCES public.payment_accounts(id),
    payment_account_name VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL,
    reference_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PAID',
    payment_account_id UUID REFERENCES public.payment_accounts(id),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    base_salary NUMERIC(12, 2) NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status_enum NOT NULL DEFAULT 'present',
    check_in_time VARCHAR(20),
    check_out_time VARCHAR(20),
    manager_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- 18. SALARY PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.salary_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    gross_salary NUMERIC(12, 2) NOT NULL,
    deductions NUMERIC(12, 2) DEFAULT 0.00,
    advances NUMERIC(12, 2) DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL,
    payment_account_id UUID REFERENCES public.payment_accounts(id),
    payment_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users access within their organization
CREATE POLICY "Users access own organization data" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users view payment_accounts" ON public.payment_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users view sales" ON public.sales
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users view vendors" ON public.vendors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users view expenses" ON public.expenses
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 20. STORED PROCEDURES (RPCs)
-- ============================================================================

-- RPC 1: Create Sale
CREATE OR REPLACE FUNCTION rpc_create_sale(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_sale_id UUID;
    v_receipt_number TEXT;
BEGIN
    v_receipt_number := p_payload->>'receipt_number';

    INSERT INTO public.sales (
        organization_id, shop_id, receipt_number, created_by_user_id,
        created_by_name, subtotal, discount, tax, total, cash_amount, online_amount
    ) VALUES (
        (p_payload->>'organization_id')::UUID,
        (p_payload->>'shop_id')::UUID,
        v_receipt_number,
        (p_payload->>'created_by_user_id')::UUID,
        p_payload->>'created_by_name',
        (p_payload->>'subtotal')::NUMERIC,
        (p_payload->>'discount')::NUMERIC,
        (p_payload->>'tax')::NUMERIC,
        (p_payload->>'total')::NUMERIC,
        (p_payload->>'cash_amount')::NUMERIC,
        (p_payload->>'online_amount')::NUMERIC
    ) RETURNING id INTO v_sale_id;

    RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id, 'receipt_number', v_receipt_number);
END;
$$;
