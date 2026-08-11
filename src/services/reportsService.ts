import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  DailyShopSummary,
  ReportSchedule,
  ReportRun,
  AppNotification,
} from '../types/database.types';

export const INITIAL_REPORT_SCHEDULES: ReportSchedule[] = [
  {
    id: 'sched-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Daily Footwear Store Closing Executive Summary',
    frequency: 'DAILY',
    cron_expression: '30 21 * * *', // 9:30 PM IST
    recipient_email: 'owner@solecraft.in',
    test_mode: true,
    allowlist_email: 'owner.test@solecraft.in',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sched-2',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Weekly Monday Morning Footwear Sales Digest (Mon-Sun)',
    frequency: 'WEEKLY',
    cron_expression: '0 8 * * 1', // Monday 8:00 AM
    recipient_email: 'owner@solecraft.in',
    test_mode: true,
    allowlist_email: 'owner.test@solecraft.in',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sched-3',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Monthly Day 1 P&L Treasury & Tax Statement',
    frequency: 'MONTHLY',
    cron_expression: '0 8 1 * *', // Day 1 8:00 AM
    recipient_email: 'accounts@solecraft.in',
    test_mode: true,
    allowlist_email: 'owner.test@solecraft.in',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sched-4',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    name: 'Footwear Vendor Dues & Overdue Payables Alert',
    frequency: 'VENDOR_DUE_ALERT',
    cron_expression: '0 9 * * 1', // Monday 9:00 AM
    recipient_email: 'accounts@solecraft.in',
    test_mode: true,
    allowlist_email: 'owner.test@solecraft.in',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    title: 'Daily Closing Summary Dispatched via Resend',
    message: 'Sent to owner.test@solecraft.in (Test Mode). Period: 2026-08-09',
    type: 'EMAIL_LOG',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    title: 'Footwear POS Cash Register Closed',
    message: 'Reconciled opening cash ₹5,000.00 with expected cash drawer float.',
    type: 'INFO',
    is_read: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_REPORT_RUNS: ReportRun[] = [
  {
    id: 'run-101',
    organization_id: 'org-footwear-101',
    schedule_id: 'sched-1',
    period_key: '2026-08-09',
    recipient_email: 'owner.test@solecraft.in',
    idempotency_key: 'sched-1_2026-08-09_owner.test@solecraft.in',
    status: 'SENT',
    resend_email_id: 'resend_msg_882910',
    sent_at: new Date().toISOString(),
  },
];

export const reportsService = {
  async getSchedules(): Promise<ReportSchedule[]> {
    return INITIAL_REPORT_SCHEDULES;
  },

  async getReportRuns(): Promise<ReportRun[]> {
    return INITIAL_REPORT_RUNS;
  },

  async getNotifications(): Promise<AppNotification[]> {
    return INITIAL_NOTIFICATIONS;
  },

  async sendAutomatedEmail(payload: {
    organization_id: string;
    schedule_id: string;
    period_key: string;
    recipient_email: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_send_automated_email', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC send_automated_email failed, using local engine:', err);
      }
    }

    const sched = INITIAL_REPORT_SCHEDULES.find((s) => s.id === payload.schedule_id);
    const targetRecipient = sched?.test_mode ? sched.allowlist_email : payload.recipient_email;
    const idempotencyKey = `${payload.schedule_id}_${payload.period_key}_${targetRecipient}`;

    const existingRun = INITIAL_REPORT_RUNS.find((r) => r.idempotency_key === idempotencyKey);
    if (existingRun) {
      return {
        success: true,
        status: 'SKIPPED_DUPLICATE',
        message: `Email already dispatched for period ${payload.period_key}. Repeated cron trigger suppressed duplicate.`,
      };
    }

    const newRun: ReportRun = {
      id: `run_${Date.now()}`,
      organization_id: payload.organization_id,
      schedule_id: payload.schedule_id,
      period_key: payload.period_key,
      recipient_email: targetRecipient,
      idempotency_key: idempotencyKey,
      status: 'SENT',
      resend_email_id: `resend_msg_${Date.now()}`,
      sent_at: new Date().toISOString(),
    };

    INITIAL_REPORT_RUNS.unshift(newRun);
    INITIAL_NOTIFICATIONS.unshift({
      id: `notif_${Date.now()}`,
      organization_id: payload.organization_id,
      title: `Email Dispatched: ${sched?.name || 'Report'}`,
      message: `Sent to ${targetRecipient} (Period: ${payload.period_key})`,
      type: 'EMAIL_LOG',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return { success: true, status: 'SENT', run_id: newRun.id, period_key: payload.period_key };
  },

  exportToCSV(filename: string, rows: Record<string, any>[]) {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((row) => Object.values(row).map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
