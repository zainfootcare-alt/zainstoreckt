import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Vendor, Purchase, PurchaseOrder, VendorLedgerEntry, VendorPayment } from '../types/database.types';

export const MOCK_FOOTWEAR_VENDORS: Vendor[] = [];
export const MOCK_PURCHASES: Purchase[] = [];

export const vendorService = {
  async getVendors(): Promise<Vendor[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('vendors').select('*').order('name');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch vendors failed:', err);
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
    return [];
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
