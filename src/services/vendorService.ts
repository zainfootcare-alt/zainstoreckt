import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Vendor, Purchase, PurchaseOrder, VendorLedgerEntry, VendorPayment } from '../types/database.types';

export const MOCK_FOOTWEAR_VENDORS: Vendor[] = [
  {
    id: 'v-kanpur-01',
    organization_id: 'org-footwear-101',
    name: 'Kanpur Leathercrafts Pvt Ltd',
    business_name: 'Kanpur Tannery & Footwear Works',
    category: 'Leather Footwear',
    contact_person: 'Ramesh Agarwal',
    phone: '+91 98390 11223',
    whatsapp_phone: '+91 98390 11223',
    email: 'orders@kanpurleather.in',
    city: 'Kanpur',
    address: 'Jajmau Leather Zone, Kanpur, UP 208010',
    gstin: '09AAACK1234F1Z2',
    bank_details: {
      bank_name: 'HDFC Bank Kanpur Main Branch',
      account_number: '50200012345678',
      ifsc_code: 'HDFC0000102',
      upi_id: 'kanpurleather@hdfcbank',
    },
    credit_limit: 500000.0, // ₹5,00,000
    payment_terms: 30, // Net 30 days
    weekly_payment_day: 'Tuesday',
    opening_balance: 50000.0, // ₹50,000
    current_balance: 165000.0, // ₹1,65,000
    status: 'Active',
    notes: 'Primary supplier for genuine leather formal shoes and oxfords.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v-agra-02',
    organization_id: 'org-footwear-101',
    name: 'Agra Footwear Hub',
    business_name: 'Agra Shoe Manufacturing Syndicate',
    category: 'Formal & Casual Shoes',
    contact_person: 'Suresh Verma',
    phone: '+91 98370 44556',
    whatsapp_phone: '+91 98370 44556',
    email: 'supply@agrashoehub.in',
    city: 'Agra',
    address: 'Shoe Market, Hing Ki Mandi, Agra, UP 282003',
    gstin: '09AAACA9988G1Z9',
    bank_details: {
      bank_name: 'ICICI Bank Agra Branch',
      account_number: '623405012345',
      ifsc_code: 'ICIC0000204',
      upi_id: 'agrashoehub@icici',
    },
    credit_limit: 350000.0,
    payment_terms: 15,
    weekly_payment_day: 'Friday',
    opening_balance: 0.0,
    current_balance: 84000.0, // ₹84,000
    status: 'Active',
    notes: 'Manufacturer for casual loafers and formal boots.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v-delhi-03',
    organization_id: 'org-footwear-101',
    name: 'Delhi Sports Shoe Syndicate',
    business_name: 'Delhi Athletic & Rubber Soles Ltd',
    category: 'Sports Shoes',
    contact_person: 'Vikram Malhotra',
    phone: '+91 98110 77889',
    whatsapp_phone: '+91 98110 77889',
    email: 'sales@delhisportsshoe.in',
    city: 'Delhi',
    address: 'Karol Bagh Shoe Wholesale Market, New Delhi 110005',
    gstin: '07AAACD5544H1Z1',
    bank_details: {
      bank_name: 'Axis Bank Karol Bagh',
      account_number: '918020034567890',
      ifsc_code: 'UTIB0000105',
      upi_id: 'delhisports@axisbank',
    },
    credit_limit: 250000.0,
    payment_terms: 14,
    weekly_payment_day: 'Monday',
    opening_balance: 0.0,
    current_balance: 0.0,
    status: 'Active',
    notes: 'Supplier for AirStride running sneakers and sports footwear.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'pur-101',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    vendor_id: 'v-kanpur-01',
    bill_number: 'INV-2026-8801',
    business_date: '2026-08-01',
    due_date: '2026-08-31',
    entry_type: 'itemized',
    subtotal: 140000.0,
    transport_charges: 2000.0,
    tax: 16800.0, // 12% GST
    other_charges: 0.0,
    total: 158800.0,
    amount_paid: 25000.0,
    balance_due: 133800.0,
    payment_status: 'Partially Paid',
    status: 'Active',
    invoice_attachment_path: 'footwear/invoices/kanpur_inv_8801.pdf',
    is_immutable: true,
    is_voided: false,
    notes: 'Bulk stock purchase of Oxford leather formal shoes (Sizes UK 7-11)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vendor_name: 'Kanpur Leathercrafts Pvt Ltd',
  },
];

export const vendorService = {
  async getVendors(): Promise<Vendor[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('vendors').select('*').order('name');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch vendors failed, using footwear dataset:', err);
      }
    }
    return MOCK_FOOTWEAR_VENDORS;
  },

  async getVendorById(id: string): Promise<Vendor | null> {
    const list = await this.getVendors();
    return list.find((v) => v.id === id) || null;
  },

  async getPurchases(): Promise<Purchase[]> {
    return MOCK_PURCHASES;
  },

  async getVendorLedger(vendorId: string): Promise<VendorLedgerEntry[]> {
    const v = await this.getVendorById(vendorId);
    if (!v) return [];

    return [
      {
        id: `l_${vendorId}_1`,
        organization_id: v.organization_id,
        vendor_id: v.id,
        transaction_type: 'OPENING_BALANCE',
        business_date: '2026-04-01',
        debit: 0.0,
        credit: v.opening_balance,
        running_balance: v.opening_balance,
        description: 'Opening Balance (FY 2026-27)',
        created_at: '2026-04-01T00:00:00Z',
      },
      {
        id: `l_${vendorId}_2`,
        organization_id: v.organization_id,
        vendor_id: v.id,
        transaction_type: 'PURCHASE',
        reference_number: 'INV-2026-8801',
        business_date: '2026-08-01',
        debit: 0.0,
        credit: 158800.0,
        running_balance: v.opening_balance + 158800.0,
        description: 'Itemized Footwear Purchase Bill #INV-2026-8801',
        created_at: '2026-08-01T10:00:00Z',
      },
      {
        id: `l_${vendorId}_3`,
        organization_id: v.organization_id,
        vendor_id: v.id,
        transaction_type: 'PAYMENT',
        reference_number: 'PAY-HDFC-991',
        business_date: '2026-08-02',
        debit: 25000.0,
        credit: 0.0,
        running_balance: v.opening_balance + 158800.0 - 25000.0,
        description: 'Advance Bank Transfer Outflow via HDFC Bank',
        created_at: '2026-08-02T14:30:00Z',
      },
    ];
  },

  async createVendor(vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'current_balance'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendorData,
      id: `v_${Date.now()}`,
      current_balance: vendorData.opening_balance || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_FOOTWEAR_VENDORS.push(newVendor);
    return newVendor;
  },
};
