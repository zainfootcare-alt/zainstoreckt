import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Product,
  StockBalance,
  InventoryMovement,
  InventoryMovementType,
  DemandLog,
  CustomerOrder,
  CustomerOrderStatus,
} from '../types/database.types';

export const INITIAL_FOOTWEAR_PRODUCTS: Product[] = [];
export const INITIAL_MOVEMENTS: InventoryMovement[] = [];
export const INITIAL_DEMAND_LOGS: DemandLog[] = [];
export const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [];

export const inventoryService = {
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, stock_balances(on_hand, reserved, available)')
          .eq('is_active', true)
          .order('name');

        if (!error && data) {
          return data.map((p: any) => {
            const stock = Array.isArray(p.stock_balances) && p.stock_balances.length > 0 ? p.stock_balances[0] : {};
            return {
              ...p,
              on_hand: stock.on_hand || 0,
              reserved: stock.reserved || 0,
              available: stock.available || 0,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase fetch products failed:', err);
      }
    }
    return INITIAL_FOOTWEAR_PRODUCTS;
  },

  async getProductById(id: string): Promise<Product | null> {
    const list = await this.getProducts();
    return list.find((p) => p.id === id) || null;
  },

  async getMovements(productId?: string): Promise<InventoryMovement[]> {
    let list = INITIAL_MOVEMENTS;
    if (productId) list = list.filter((m) => m.product_id === productId);
    return list;
  },

  async getDemandLogs(): Promise<DemandLog[]> {
    return INITIAL_DEMAND_LOGS;
  },

  async getCustomerOrders(): Promise<CustomerOrder[]> {
    return INITIAL_CUSTOMER_ORDERS;
  },

  async recordStockAdjustment(payload: {
    idempotency_key: string;
    organization_id: string;
    shop_id: string;
    product_id: string;
    quantity: number;
    movement_type: InventoryMovementType;
    reason_code: string;
    unit_cost?: number;
    notes?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_record_inventory_movement', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC record_inventory_movement failed:', err);
      }
    }

    const prod = INITIAL_FOOTWEAR_PRODUCTS.find((p) => p.id === payload.product_id);
    if (prod) {
      prod.on_hand = (prod.on_hand || 0) + payload.quantity;
      prod.available = (prod.available || 0) + payload.quantity;
    }

    const newMov: InventoryMovement = {
      id: `mov_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      product_id: payload.product_id,
      movement_type: payload.movement_type,
      quantity: payload.quantity,
      unit_cost: payload.unit_cost || prod?.cost_price || 0,
      reason_code: payload.reason_code,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };

    INITIAL_MOVEMENTS.unshift(newMov);
    return { success: true, movement_id: newMov.id };
  },

  async logCustomerDemand(payload: {
    organization_id: string;
    shop_id: string;
    requested_item_text: string;
    category?: string;
    size_requested?: string;
    brand_requested?: string;
    customer_phone?: string;
    notes?: string;
  }) {
    const newLog: DemandLog = {
      id: `dem_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      requested_item_text: payload.requested_item_text,
      category: payload.category || 'General Footwear',
      size_requested: payload.size_requested,
      brand_requested: payload.brand_requested,
      customer_phone: payload.customer_phone,
      notes: payload.notes,
      is_fulfilled: false,
      created_at: new Date().toISOString(),
    };

    INITIAL_DEMAND_LOGS.unshift(newLog);
    return { success: true, log_id: newLog.id };
  },
};
