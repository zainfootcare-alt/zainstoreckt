import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import {
  Users,
  UserCheck,
  CreditCard,
  ShoppingBag,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Search,
  IndianRupee,
} from 'lucide-react';

export const StaffManagementPage: React.FC = () => {
  const {
    employees,
    attendance,
    sales,
    salaryPayments,
    markAttendance,
    recordSalaryPayment,
    paymentAccounts,
    activeRole,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'sales' | 'attendance' | 'salary' | 'directory'>('sales');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Salary Payment Modal State
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState<boolean>(false);
  const [targetEmpId, setTargetEmpId] = useState<string>('');
  const [grossSalaryInput, setGrossSalaryInput] = useState<number>(0);
  const [deductionsInput, setDeductionsInput] = useState<number>(0);
  const [advancesInput, setAdvancesInput] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(paymentAccounts[0]?.id || '');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate staff performance metrics for today
  const getStaffDailyMetrics = (empId: string) => {
    const empSales = sales.filter((s) => s.created_by_user_id === empId && s.created_at.startsWith(todayStr));
    const totalAmt = empSales.reduce((sum, s) => sum + s.total, 0);
    const count = empSales.length;
    const cashAmt = empSales.reduce((sum, s) => sum + s.cash_amount, 0);
    const onlineAmt = empSales.reduce((sum, s) => sum + s.online_amount, 0);

    return { totalAmt, count, cashAmt, onlineAmt };
  };

  // Calculate monthly attendance summary for an employee
  const getStaffAttendanceSummary = (empId: string) => {
    const empAtt = attendance.filter((a) => a.employee_id === empId);
    const presentDays = empAtt.filter((a) => a.status === 'present').length;
    const absentDays = empAtt.filter((a) => a.status === 'absent').length;
    const halfDays = empAtt.filter((a) => a.status === 'half_day').length;
    const leaveDays = empAtt.filter((a) => a.status === 'leave').length;

    const workingDaysCount = presentDays + halfDays * 0.5;
    return { presentDays, absentDays, halfDays, leaveDays, workingDaysCount };
  };

  // Open Salary Modal
  const openPaySalaryModal = (empId: string, suggestedPayable: number) => {
    setTargetEmpId(empId);
    setGrossSalaryInput(suggestedPayable);
    setDeductionsInput(0);
    setAdvancesInput(0);
    setIsSalaryModalOpen(true);
  };

  const handleConfirmSalaryDisbursement = async () => {
    if (!targetEmpId || grossSalaryInput <= 0) return;

    await recordSalaryPayment({
      employee_id: targetEmpId,
      gross_salary: grossSalaryInput,
      deductions: deductionsInput,
      advances: advancesInput,
      payment_account_id: selectedAccountId || paymentAccounts[0]?.id || 'd4000000-0000-0000-0000-000000000001',
      payment_reference: `Salary Payout (${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})`,
    });

    setIsSalaryModalOpen(false);
  };

  return (
    <PermissionGuard requiredPermission="staff:view">
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Team Operations</h1>
            <p className="text-xs text-slate-500 font-medium">Daily sales tracking, attendance shift log & salary disbursement</p>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'sales' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Daily Sales
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'attendance' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance Log
            </button>

            {activeRole !== 'CASHIER' && (
              <button
                onClick={() => setActiveTab('salary')}
                className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeTab === 'salary' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Salary & Payroll
              </button>
            )}

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'directory' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Directory
            </button>
          </div>
        </div>

        {/* TAB 1: STAFF DAILY SALES */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.map((emp) => {
                const metrics = getStaffDailyMetrics(emp.id);
                return (
                  <div
                    key={emp.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{emp.full_name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{emp.designation}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {emp.employee_code}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Today's Sales Total:</span>
                        <span className="text-base font-black text-emerald-700">₹{metrics.totalAmt.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Txns</p>
                          <p className="text-slate-900 text-sm font-extrabold">{metrics.count}</p>
                        </div>
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                          <p className="text-[10px] text-amber-700 font-bold uppercase">Cash</p>
                          <p className="text-amber-900 text-xs font-black">₹{metrics.cashAmt.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                          <p className="text-[10px] text-blue-700 font-bold uppercase">Online</p>
                          <p className="text-blue-900 text-xs font-black">₹{metrics.onlineAmt.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE LOG */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" /> Staff Attendance Register
                </h2>
                <p className="text-xs text-slate-500">Mark daily attendance: Present, Absent, Half Day, Leave</p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* MOBILE ATTENDANCE CARDS VIEW */}
            <div className="block md:hidden space-y-3">
              {employees.map((emp) => {
                const todayRecord = attendance.find(
                  (a) => a.employee_id === emp.id && a.attendance_date === attendanceDate
                );
                const attSummary = getStaffAttendanceSummary(emp.id);

                return (
                  <div key={emp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{emp.full_name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{emp.designation}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          todayRecord?.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : todayRecord?.status === 'absent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : todayRecord?.status === 'half_day'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {todayRecord?.status || 'Not Marked'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      <button
                        onClick={() => markAttendance(emp.id, 'present')}
                        className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-[11px]"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(emp.id, 'absent')}
                        className="py-2 bg-rose-600 text-white font-bold rounded-xl text-[11px]"
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => markAttendance(emp.id, 'half_day')}
                        className="py-2 bg-amber-500 text-white font-bold rounded-xl text-[11px]"
                      >
                        Half
                      </button>
                      <button
                        onClick={() => markAttendance(emp.id, 'leave')}
                        className="py-2 bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px]"
                      >
                        Leave
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 font-semibold text-right">
                      Month Total: {attSummary.presentDays} Present | {attSummary.absentDays} Absent | {attSummary.halfDays} Half
                    </p>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP ATTENDANCE TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Status Today</th>
                    <th className="py-3 px-4 text-center">Quick Mark Actions</th>
                    <th className="py-3 px-4">Monthly Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const todayRecord = attendance.find(
                      (a) => a.employee_id === emp.id && a.attendance_date === attendanceDate
                    );
                    const attSummary = getStaffAttendanceSummary(emp.id);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">{emp.full_name}</td>
                        <td className="py-4 px-4 text-slate-600">{emp.designation}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              todayRecord?.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : todayRecord?.status === 'absent'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : todayRecord?.status === 'half_day'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {todayRecord?.status || 'Not Marked'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => markAttendance(emp.id, 'present')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => markAttendance(emp.id, 'absent')}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => markAttendance(emp.id, 'half_day')}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] transition-colors"
                            >
                              Half Day
                            </button>
                            <button
                              onClick={() => markAttendance(emp.id, 'leave')}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[10px] transition-colors"
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                          {attSummary.presentDays} Present | {attSummary.absentDays} Absent | {attSummary.halfDays} Half
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SALARY & PAYROLL */}
        {activeTab === 'salary' && activeRole !== 'CASHIER' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" /> Staff Salary & Payroll Calculator
                </h2>
                <p className="text-xs text-slate-500">Simple daily rate calculation: Base Salary ÷ 30 × Attended Days</p>
              </div>
            </div>

            {/* SALARY SUMMARY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Monthly Salary</th>
                    <th className="py-3 px-4">Per Day Rate</th>
                    <th className="py-3 px-4">Working Days</th>
                    <th className="py-3 px-4">Payable Amount</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Remaining Due</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const attSummary = getStaffAttendanceSummary(emp.id);
                    const perDayRate = Math.round(emp.base_salary / 30);
                    const payableAmt = Math.round(perDayRate * attSummary.workingDaysCount);

                    const paidTotal = salaryPayments
                      .filter((s) => s.employee_id === emp.id)
                      .reduce((sum, s) => sum + s.net_salary, 0);

                    const remainingDue = Math.max(0, payableAmt - paidTotal);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {emp.full_name}
                          <p className="text-[10px] text-slate-400 font-medium">{emp.designation}</p>
                        </td>
                        <td className="py-4 px-4 font-extrabold text-slate-800">₹{emp.base_salary.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 text-slate-600">₹{perDayRate.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 font-bold text-slate-800">{attSummary.workingDaysCount} Days</td>
                        <td className="py-4 px-4 font-extrabold text-emerald-700">₹{payableAmt.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 font-bold text-slate-700">₹{paidTotal.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 font-extrabold text-rose-600">₹{remainingDue.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => openPaySalaryModal(emp.id, remainingDue > 0 ? remainingDue : payableAmt)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                          >
                            Record Payout
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STAFF DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" /> Active Staff Directory
                </h2>
                <p className="text-xs text-slate-500">Employee roles, mobile numbers & joining dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm">{emp.full_name}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {emp.employee_code}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">{emp.designation}</p>
                  <p className="text-xs text-slate-600 font-medium">Mobile: {emp.phone}</p>
                  <p className="text-[11px] text-slate-400">Joining Date: {emp.joining_date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALARY PAYMENT MODAL */}
        {isSalaryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Record Salary Payment</h3>
                <button onClick={() => setIsSalaryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Payable Gross Salary (₹)</label>
                  <input
                    type="number"
                    value={grossSalaryInput}
                    onChange={(e) => setGrossSalaryInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Deductions (₹)</label>
                    <input
                      type="number"
                      value={deductionsInput}
                      onChange={(e) => setDeductionsInput(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Advances (₹)</label>
                    <input
                      type="number"
                      value={advancesInput}
                      onChange={(e) => setAdvancesInput(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Payment Account</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {paymentAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Bal: ₹{acc.current_balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-extrabold text-emerald-900 flex justify-between">
                  <span>NET SALARY PAYOUT:</span>
                  <span>₹{(grossSalaryInput - deductionsInput - advancesInput).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmSalaryDisbursement}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all"
              >
                Confirm Salary Disbursal
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};
