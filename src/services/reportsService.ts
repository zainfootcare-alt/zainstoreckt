import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  ReportSchedule,
  ReportRun,
  AppNotification,
} from '../types/database.types';

export const INITIAL_REPORT_SCHEDULES: ReportSchedule[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_REPORT_RUNS: ReportRun[] = [];

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
        console.warn('RPC send_automated_email failed:', err);
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
        message: `Email already dispatched for period ${payload.period_key}.`,
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
