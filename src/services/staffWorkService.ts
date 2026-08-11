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

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    employee_code: 'EMP-001',
    full_name: 'Vikram Singh',
    designation: 'Store Manager',
    phone: '+91 98200 99887',
    email: 'vikram.singh@solecraft.in',
    base_salary: 45000.0, // ₹45,000 / month
    joining_date: '2024-04-15',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'emp-02',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    employee_code: 'EMP-002',
    full_name: 'Mohd Salim',
    designation: 'Senior Leather Shoe Craftsman',
    phone: '+91 98211 44332',
    email: 'salim.leather@solecraft.in',
    base_salary: 38000.0, // ₹38,000 / month
    joining_date: '2023-11-01',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'emp-03',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    employee_code: 'EMP-003',
    full_name: 'Pooja Verma',
    designation: 'Senior Cashier & POS Sales',
    phone: '+91 98334 55667',
    email: 'pooja.v@solecraft.in',
    base_salary: 28000.0, // ₹28,000 / month
    joining_date: '2025-01-10',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    employee_id: 'emp-01',
    employee_name: 'Vikram Singh',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    check_in_time: '09:45:00',
    created_at: new Date().toISOString(),
  },
  {
    id: 'att-2',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    employee_id: 'emp-02',
    employee_name: 'Mohd Salim',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    check_in_time: '10:00:00',
    created_at: new Date().toISOString(),
  },
  {
    id: 'att-3',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    employee_id: 'emp-03',
    employee_name: 'Pooja Verma',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'absent',
    manager_notes: 'Medical leave approved',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-101',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    title: 'Inspect incoming Kanpur Leathercrafts shipment (Oxfords & Boots UK 7-11)',
    module: 'Inventory',
    owner_name: 'Vikram Singh',
    priority: 'High',
    due_date: new Date().toISOString().split('T')[0],
    recurrence: 'None',
    status: 'In Progress',
    notes: 'Verify shoe box barcodes and leather finish quality.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-102',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    title: 'Post Festival Sneaker Festive Offer on Instagram & WhatsApp Business',
    module: 'Marketing',
    owner_name: 'Marketing Executive',
    priority: 'Medium',
    due_date: new Date().toISOString().split('T')[0],
    recurrence: 'Weekly',
    status: 'Todo',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_MARKETING_POSTS: MarketingPost[] = [
  {
    id: 'post-1',
    organization_id: 'org-footwear-101',
    shop_id: 'shop-mumbai-01',
    platform: 'Instagram',
    content_type: 'Image',
    caption: 'Step into handcrafted luxury! Pure leather Oxfords now live at SoleCraft Bandra Mumbai 👞✨',
    publish_date: new Date().toISOString().split('T')[0],
    owner_name: 'Marketing Lead',
    status: 'Scheduled',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    organization_id: 'org-footwear-101',
    name: 'Festive Season Footwear Collection Launch 2026',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    planned_spend: 25000.0, // ₹25,000
    actual_spend: 18500.0, // ₹18,500
    leads_generated: 180,
    attributed_sales: 245000.0, // ₹2,45,000
    notes: 'Meta Ads (Instagram / Facebook) & Google Local Search Campaign in Mumbai',
    created_at: new Date().toISOString(),
  },
];

export const staffWorkService = {
  async getEmployees(): Promise<Employee[]> {
    return INITIAL_EMPLOYEES;
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    return INITIAL_ATTENDANCE;
  },

  async markAttendance(employeeId: string, status: 'present' | 'absent' | 'half_day' | 'leave', notes?: string) {
    const emp = INITIAL_EMPLOYEES.find((e) => e.id === employeeId);
    const dateStr = new Date().toISOString().split('T')[0];

    const existing = INITIAL_ATTENDANCE.find((a) => a.employee_id === employeeId && a.attendance_date === dateStr);
    if (existing) {
      existing.status = status;
      existing.manager_notes = notes;
      return existing;
    }

    const newAtt: AttendanceRecord = {
      id: `att_${Date.now()}`,
      organization_id: 'org-footwear-101',
      shop_id: 'shop-mumbai-01',
      employee_id: employeeId,
      employee_name: emp?.full_name || 'Staff Member',
      attendance_date: dateStr,
      status,
      manager_notes: notes,
      created_at: new Date().toISOString(),
    };

    INITIAL_ATTENDANCE.unshift(newAtt);
    return newAtt;
  },

  async paySalary(payload: {
    organization_id: string;
    shop_id: string;
    employee_id: string;
    gross_salary: number;
    deductions: number;
    advances: number;
    payment_account_id: string;
    payment_reference?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('rpc_pay_salary', { p_payload: payload });
        if (!error && data) return data;
      } catch (err) {
        console.warn('RPC pay salary failed, using local engine:', err);
      }
    }

    const emp = INITIAL_EMPLOYEES.find((e) => e.id === payload.employee_id);
    const net = payload.gross_salary - payload.deductions - payload.advances;

    return {
      success: true,
      salary_id: `sal_${Date.now()}`,
      employee_name: emp?.full_name || 'Employee',
      net_salary: net,
    };
  },

  async getTasks(): Promise<TaskItem[]> {
    return INITIAL_TASKS;
  },

  async completeTask(id: string) {
    const task = INITIAL_TASKS.find((t) => t.id === id);
    if (!task) return null;

    task.status = 'Done';

    if (task.recurrence !== 'None') {
      const nextDueDate = new Date();
      if (task.recurrence === 'Daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
      if (task.recurrence === 'Weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
      if (task.recurrence === 'Monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      INITIAL_TASKS.push({
        ...task,
        id: `tsk_rec_${Date.now()}`,
        due_date: nextDueDate.toISOString().split('T')[0],
        status: 'Todo',
        created_at: new Date().toISOString(),
      });
    }

    return task;
  },

  async getMarketingPosts(): Promise<MarketingPost[]> {
    return INITIAL_MARKETING_POSTS;
  },

  async getCampaigns(): Promise<Campaign[]> {
    return INITIAL_CAMPAIGNS;
  },

  getDailyPriorityEngine(): PriorityItem[] {
    const priorities: PriorityItem[] = [
      {
        id: 'prio-1',
        rank: 1,
        category: 'Overdue Vendor Dues',
        title: 'Agra Footwear Hub Invoice ₹84,000.00 Overdue',
        urgency: 'URGENT',
        target_link: '/app/vendor-dues',
        details: 'Vendor credit payment terms expired. Clear balance to dispatch fresh casual footwear shipment.',
      },
      {
        id: 'prio-2',
        rank: 2,
        category: 'Customer Shoe Orders Due',
        title: 'Customer Order #CO-2026-001 promised date is tomorrow',
        urgency: 'HIGH',
        target_link: '/app/orders/co-101',
        details: 'Aarav Mehta - Custom Hand-Burnished Oxford size UK 8 pending craftsman finishing.',
      },
      {
        id: 'prio-3',
        rank: 3,
        category: 'High-Demand / Low-Stock Footwear',
        title: 'AirStride Running Sneakers UK 9 (3 pairs remaining)',
        urgency: 'HIGH',
        target_link: '/app/inventory/low-stock',
        details: 'Stock level (3) is below reorder threshold (6). 5 customer demand requests pending.',
      },
      {
        id: 'prio-4',
        rank: 4,
        category: 'Missing Invoices',
        title: 'Bill #INV-2026-8801 missing GST supplier invoice attachment',
        urgency: 'MEDIUM',
        target_link: '/app/purchases',
        details: 'Upload private RLS GST invoice PDF for ITC input tax credit filing.',
      },
      {
        id: 'prio-5',
        rank: 5,
        category: 'Recurring Bills Due',
        title: 'Custom Branded Shoe Boxes Invoice ₹12,500.00 due in 3 days',
        urgency: 'MEDIUM',
        target_link: '/app/expenses',
        details: 'Packaging vendor bill due on 2026-08-12.',
      },
      {
        id: 'prio-6',
        rank: 6,
        category: 'Absent Staff',
        title: 'Senior Cashier Pooja Verma reported absent today',
        urgency: 'MEDIUM',
        target_link: '/app/staff/attendance',
        details: 'Medical leave approved. Ensure register counter shift coverage.',
      },
    ];

    return priorities.sort((a, b) => a.rank - b.rank);
  },
};
