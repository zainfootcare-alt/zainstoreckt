import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Employee,
  AttendanceRecord,
  SalaryPayment,
  TaskItem,
  MarketingPost,
  Campaign,
  PriorityItem,
} from '../types/database.types';

export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_TASKS: TaskItem[] = [];
export const INITIAL_MARKETING_POSTS: MarketingPost[] = [];
export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const staffWorkService = {
  async getEmployees(): Promise<Employee[]> {
    return INITIAL_EMPLOYEES;
  },

  async getAttendance(date?: string): Promise<AttendanceRecord[]> {
    const today = date || new Date().toISOString().split('T')[0];
    return INITIAL_ATTENDANCE.filter((a) => a.attendance_date === today);
  },

  async getTasks(): Promise<TaskItem[]> {
    return INITIAL_TASKS;
  },

  async getMarketingPosts(): Promise<MarketingPost[]> {
    return INITIAL_MARKETING_POSTS;
  },

  async getCampaigns(): Promise<Campaign[]> {
    return INITIAL_CAMPAIGNS;
  },

  getDailyPriorityEngine(): PriorityItem[] {
    return [];
  },

  async markAttendance(payload: {
    employee_id: string;
    status: 'present' | 'absent' | 'half_day' | 'leave';
    check_in_time?: string;
    notes?: string;
  }) {
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: payload.employee_id,
      attendance_date: now.toISOString().split('T')[0],
      status: payload.status,
      check_in_time: payload.check_in_time || (payload.status === 'present' ? now.toTimeString().slice(0, 8) : undefined),
      notes: payload.notes,
      created_at: now.toISOString(),
    };

    INITIAL_ATTENDANCE.unshift(newRecord);
    return newRecord;
  },
};
