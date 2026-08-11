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

export const INITIAL_FOOTWEAR_PRODUCTS: Product[] = [
  {
    id: 'prod-101',
    organization_id: 'org-footwear-101',
    sku: 'SC-OXF-BLK-8',
    name: 'SoleCraft Premium Italian Leather Oxfords (Black)',
    category: 'Formal Shoes',
    gender: 'Men',
    brand: 'SoleCraft',
    size_uk_ind: '8',
    sale_price: 4999.0, // ₹4,999
    cost_price: 2200.0, // ₹2,200
    preferred_vendor_id: 'v-kanpur-01',
    reorder_level: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    on_hand: 18,
    reserved: 2,
    available: 16,
  },
  {
    id: 'prod-102',
    organization_id: 'org-footwear-101',
    sku: 'SC-SNK-BLU-9',
    name: 'SoleCraft AirStride Running Sneakers (Royal Blue)',
    category: 'Sports & Running Shoes',
    gender: 'Unisex',
    brand: 'SoleCraft',
    size_uk_ind: '9',
    sale_price: 2499.0, // ₹2,499
    cost_price: 1100.0, // ₹1,100
    preferred_vendor_id: 'v-delhi-03',
    reorder_level: 6,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    on_hand: 3,
    reserved: 1,
    available: 2,
  },
  {
    id: 'prod-103',
    organization_id: 'org-footwear-101',
    sku: 'SC-LOA-BRN-7',
    name: 'SoleCraft SoftStep Leather Slip-On Loafers (Tan Brown)',
    category: 'Sneakers & Casuals',
    gender: 'Men',
    brand: 'SoleCraft',
    size_uk_ind: '7',
    sale_price: 1899.0, // ₹1,899
    cost_price: 850.0, // ₹850
    preferred_vendor_id: 'v-agra-02',
    reorder_level: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    on_hand: 25,
    reserved: 3,
    available: 22,
  },
  {
    id: 'prod-104',
    organization_id: 'org-footwear-101',
    sku: 'SC-[#BOT-BLK-10]',
    name: 'SoleCraft Urban High-Ankle Leather Boots (Black)',
    category: 'Boots & Leather',
    gender: 'Men',
    brand: 'SoleCraft',
    size_uk_ind: '10',
    sale_price: 5499.0, // ₹5,499
    cost_price: 2500.0, // ₹2,500
    preferred_vendor_id: 'v-kanpur-01',
    reorder_level: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    on_hand: 12,
    reserved: 1,
    available: 11,
  },
  {
    id: 'prod-105',
    organization_id: 'org-footwear-101',
    sku: 'SC-CARE-KIT',
    name: 'Premium Leather Shoe Polish & Care Shine Kit',
    category: 'Accessories & Care',
    gender: 'Unisex',
    brand: 'SoleCraft',
    size_uk_ind: 'One Size',
    sale_price: 399.0, // ₹399
    cost_price: 150.0, // ₹150
    preferred_vendor_id: 'v-kanpur-01',
    reorder_level: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    on_hand: 40,
    reserved: 0,
    available: 40,
  },
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    product_id: 'prod-101',
    product_name: 'SoleCraft Premium Italian Leather Oxfords (Black UK 8)',
    sku: 'SC-OXF-BLK-8',
    movement_type: 'OPENING_STOCK',
    quantity: 20,
    unit_cost: 2200.0,
    notes: 'Initial footwear shipment from Kanpur Tannery',
    created_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'mov-2',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    product_id: 'prod-101',
    product_name: 'SoleCraft Premium Italian Leather Oxfords (Black UK 8)',
    sku: 'SC-OXF-BLK-8',
    movement_type: 'SALE_OUT',
    quantity: -2,
    unit_cost: 2200.0,
    reference_number: 'REC-8923',
    notes: 'Footwear POS Counter Sale',
    created_at: '2026-08-09T10:30:00Z',
  },
];

export const INITIAL_DEMAND_LOGS: DemandLog[] = [
  {
    id: 'dem-101',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    product_id: 'prod-102',
    requested_item_text: 'SoleCraft AirStride Running Sneakers (Royal Blue UK 9)',
    quantity: 5,
    customer_id: 'c-101',
    customer_name: 'Aarav Mehta',
    salesperson_name: 'Vikram Singh',
    status: 'PENDING',
    notes: 'Out of stock at Mumbai Bandra store; requested by customer for weekend sports event.',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'co-101',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    order_number: 'CO-2026-001',
    customer_id: 'c-101',
    customer_name: 'Aarav Mehta',
    promised_date: '2026-08-16',
    status: 'Ordered from Vendor',
    total_amount: 4999.0,
    advance_paid: 1000.0,
    balance_due: 3999.0,
    linked_vendor_id: 'v-kanpur-01',
    owner_name: 'Vikram Singh',
    notes: 'Custom Hand-Burnished Leather Oxford Custom Order',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'coi-1',
        organization_id: 'org-footwear-101',
        customer_order_id: 'co-101',
        product_id: 'prod-101',
        item_name: 'Italian Leather Oxfords (Black UK 8)',
        sku: 'SC-OXF-BLK-8',
        size: 'UK 8',
        quantity: 1,
        unit_price: 4999.0,
        total_price: 4999.0,
      },
    ],
  },
];

export const inventoryService = {
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch products failed, using initial footwear dataset:', err);
      }
    }
    return INITIAL_FOOTWEAR_PRODUCTS;
  },

  async getLowStockProducts(): Promise<Product[]> {
    const list = await this.getProducts();
    return list.filter((p) => (p.on_hand || 0) <= p.reorder_level);
  },

  async getMovements(productId?: string): Promise<InventoryMovement[]> {
    let list = INITIAL_MOVEMENTS;
    if (productId) list = list.filter((m) => m.product_id === productId);
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async adjustStock(payload: {
    organization_id: string;
    shop_id: string;
    product_id: string;
    movement_type: InventoryMovementType;
    quantity: number;
    unit_cost?: number;
    notes?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_adjust_stock', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC adjust stock failed, using local ledger:', err);
      }
    }

    const prod = INITIAL_FOOTWEAR_PRODUCTS.find((p) => p.id === payload.product_id);
    if (!prod) throw new Error('Product not found');

    const curOnHand = prod.on_hand || 0;
    const newOnHand = Math.max(0, curOnHand + payload.quantity);
    prod.on_hand = newOnHand;
    prod.available = newOnHand - (prod.reserved || 0);

    const newMov: InventoryMovement = {
      id: `mov_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      product_id: payload.product_id,
      product_name: prod.name,
      sku: prod.sku,
      movement_type: payload.movement_type,
      quantity: payload.quantity,
      unit_cost: payload.unit_cost || prod.cost_price,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };

    INITIAL_MOVEMENTS.unshift(newMov);
    return { success: true, new_on_hand: newOnHand };
  },

  async getDemandLogs(): Promise<DemandLog[]> {
    return INITIAL_DEMAND_LOGS;
  },

  async logDemand(payload: {
    organization_id: string;
    shop_id: string;
    product_id?: string;
    requested_item_text: string;
    quantity: number;
    customer_id?: string;
    salesperson_name?: string;
    notes?: string;
  }) {
    const newDemand: DemandLog = {
      id: `dem_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      product_id: payload.product_id,
      requested_item_text: payload.requested_item_text,
      quantity: payload.quantity,
      customer_id: payload.customer_id,
      salesperson_name: payload.salesperson_name || 'Store Staff',
      status: 'PENDING',
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };

    INITIAL_DEMAND_LOGS.unshift(newDemand);
    return newDemand;
  },

  async convertDemandToPO(payload: {
    organization_id: string;
    shop_id: string;
    demand_id: string;
    vendor_id: string;
  }) {
    const dem = INITIAL_DEMAND_LOGS.find((d) => d.id === payload.demand_id);
    if (!dem) throw new Error('Demand log not found');

    dem.status = 'CONVERTED_TO_PO';
    dem.converted_po_id = `po_dem_${Date.now()}`;

    return {
      success: true,
      po_id: dem.converted_po_id,
      po_number: `PO-FOOTWEAR-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  },

  async getCustomerOrders(): Promise<CustomerOrder[]> {
    return INITIAL_CUSTOMER_ORDERS;
  },

  async getCustomerOrderById(id: string): Promise<CustomerOrder | null> {
    const list = await this.getCustomerOrders();
    return list.find((co) => co.id === id) || null;
  },

  async updateOrderStatus(id: string, newStatus: CustomerOrderStatus, notes?: string) {
    const order = INITIAL_CUSTOMER_ORDERS.find((co) => co.id === id);
    if (!order) throw new Error('Order not found');

    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    return order;
  },
};
