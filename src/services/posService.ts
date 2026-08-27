import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { CashSession, MoneyTransaction } from '../types/database.types';

export interface POSSalePayload {
  idempotency_key: string;
  organization_id: string;
  shop_id: string;
  customer_id?: string;
  receipt_number: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  credit_amount: number;
  notes?: string;
  items: Array<{
    item_name: string;
    sku?: string;
    size?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  payments: Array<{
    payment_type: 'cash' | 'upi' | 'card' | 'bank' | 'credit';
    amount: number;
    transaction_ref?: string;
  }>;
}

let MOCK_CASH_SESSION: CashSession | null = null;
const MOCK_MONEY_TRANSACTIONS: MoneyTransaction[] = [];

export const posService = {
  async getActiveSession(shopId: string): Promise<CashSession | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('cash_sessions')
          .select('*')
          .eq('shop_id', shopId)
          .eq('status', 'OPEN')
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch session failed:', err);
      }
    }
    return MOCK_CASH_SESSION;
  },

  async openCounter(payload: { organization_id: string; shop_id: string; opening_cash: number }): Promise<CashSession> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_open_cash_session', { p_payload: payload });
        if (!error && data) {
          const fresh = await this.getActiveSession(payload.shop_id);
          if (fresh) return fresh;
        }
      } catch (err) {
        console.warn('RPC open counter failed, setting local session:', err);
      }
    }

    MOCK_CASH_SESSION = {
      id: `sess_${Date.now()}`,
      organization_id: payload.organization_id,
      shop_id: payload.shop_id,
      business_date: new Date().toISOString().split('T')[0],
      opened_at: new Date().toISOString(),
      opening_cash: payload.opening_cash,
      expected_cash: payload.opening_cash,
      requires_approval: false,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };

    return MOCK_CASH_SESSION;
  },

  async closeCounter(payload: {
    session_id: string;
    counted_cash: number;
    variance_reason?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_close_cash_session', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC close counter failed:', err);
      }
    }

    if (MOCK_CASH_SESSION) {
      const expected = MOCK_CASH_SESSION.opening_cash;
      const variance = payload.counted_cash - expected;
      const reqApproval = Math.abs(variance) > 500.0;

      MOCK_CASH_SESSION.closed_at = new Date().toISOString();
      MOCK_CASH_SESSION.counted_cash = payload.counted_cash;
      MOCK_CASH_SESSION.expected_cash = expected;
      MOCK_CASH_SESSION.variance = variance;
      MOCK_CASH_SESSION.variance_reason = payload.variance_reason;
      MOCK_CASH_SESSION.requires_approval = reqApproval;
      MOCK_CASH_SESSION.status = reqApproval ? 'PENDING_APPROVAL' : 'CLOSED';

      const result = {
        success: true,
        session_id: payload.session_id,
        expected_cash: expected,
        counted_cash: payload.counted_cash,
        variance,
        requires_approval: reqApproval,
      };

      MOCK_CASH_SESSION = null;
      return result;
    }

    throw new Error('No active cash session to close');
  },

  async createPOSSale(payload: POSSalePayload) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_create_sale', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC create sale failed, using local engine:', err);
      }
    }

    if (MOCK_CASH_SESSION) {
      payload.payments.forEach((p) => {
        if (p.payment_type === 'cash') {
          MOCK_CASH_SESSION!.expected_cash += p.amount;
        }
        MOCK_MONEY_TRANSACTIONS.push({
          id: `mt_${Date.now()}`,
          organization_id: payload.organization_id,
          shop_id: payload.shop_id,
          cash_session_id: MOCK_CASH_SESSION!.id,
          type: 'SALE_INFLOW',
          amount: p.amount,
          business_date: new Date().toISOString().split('T')[0],
          description: `Footwear POS Receipt #${payload.receipt_number} (${p.payment_type.toUpperCase()})`,
          created_at: new Date().toISOString(),
        });
      });
    }

    return {
      success: true,
      sale_id: `sale_${Date.now()}`,
      receipt_number: payload.receipt_number,
      total: payload.total,
    };
  },

  async voidSale(payload: {
    idempotency_key: string;
    organization_id: string;
    sale_id: string;
    reason: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_void_sale', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC void sale failed:', err);
      }
    }
    return { success: true, sale_id: payload.sale_id, voided: true };
  },
};
