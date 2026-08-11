import React from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { Bell, AlertTriangle, AlertCircle, UserX, Clock, CreditCard, IndianRupee } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { vendors, attendance, activeCashSession } = useShop();

  const todayStr = new Date().toISOString().split('T')[0];

  // Rule-based notifications generation
  const notifs: Array<{ id: string; title: string; message: string; type: 'URGENT' | 'WARNING' | 'INFO' }> = [];

  // Rule 1: Overdue Party Dues
  vendors.forEach((v) => {
    if (v.current_balance > 0) {
      notifs.push({
        id: `notif_v_${v.id}`,
        title: `Party Payment Due: ${v.name}`,
        message: `Outstanding balance of ₹${v.current_balance.toLocaleString('en-IN')} pending on payment day (${v.weekly_payment_day || 'Monday'}).`,
        type: v.current_balance > 40000 ? 'URGENT' : 'WARNING',
      });
    }
  });

  // Rule 2: Cash Variance Alert
  if (activeCashSession?.variance && Math.abs(activeCashSession.variance) > 0) {
    notifs.push({
      id: `notif_var_${activeCashSession.id}`,
      title: `Cash Counter Discrepancy Alert`,
      message: `Daily cash drawer has a variance of ₹${activeCashSession.variance.toLocaleString('en-IN')} (${activeCashSession.variance_reason || 'No note'}).`,
      type: 'URGENT',
    });
  }

  // Rule 3: Absent Staff
  const absentStaff = attendance.filter((a) => a.attendance_date === todayStr && a.status === 'absent');
  absentStaff.forEach((a) => {
    notifs.push({
      id: `notif_att_${a.id}`,
      title: `Staff Absent Today: ${a.employee_name}`,
      message: `Staff member recorded absent today (${a.manager_notes || 'No reason provided'}).`,
      type: 'WARNING',
    });
  });

  return (
    <PermissionGuard requiredPermission="dashboard:view">
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-500 font-medium">Rule-based alerts: Party dues, cash variance, staff absences & salary alerts</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {notifs.length} Rule Alerts Active
          </span>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          {notifs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
              <Bell className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">All clear! No active alerts</p>
              <p className="text-xs text-slate-400">Your shop operations and party dues are up to date.</p>
            </div>
          ) : (
            notifs.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border flex items-start space-x-4 transition-colors ${
                  item.type === 'URGENT'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : item.type === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
                    item.type === 'URGENT'
                      ? 'bg-rose-600 text-white'
                      : item.type === 'WARNING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {item.type === 'URGENT' ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm">{item.title}</h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        item.type === 'URGENT' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs font-medium opacity-90">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};
