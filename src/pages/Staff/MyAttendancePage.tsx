import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const MyAttendancePage: React.FC = () => {
  const { userProfile, attendance, punchAttendance, activeShop } = useShop();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('en-US'));
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if current user has already punched in today
  const myAttendanceToday = attendance.find(
    (a) =>
      a.attendance_date === todayDateStr &&
      (a.employee_id === userProfile?.id ||
        (userProfile?.full_name && a.employee_name === userProfile.full_name))
  );

  // My full attendance history
  const myHistory = attendance
    .filter(
      (a) =>
        a.employee_id === userProfile?.id ||
        (userProfile?.full_name && a.employee_name === userProfile.full_name) ||
        !userProfile?.id
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handlePunchNow = () => {
    punchAttendance(userProfile?.full_name || 'Staff');
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-full shadow-2xs hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          Staff Attendance
        </span>
      </div>

      {/* 2. REAL-TIME LIVE CLOCK & PUNCH CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-center">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-orange-400">
            {currentTime}
          </p>
          <p className="text-xs text-slate-300">
            {userProfile?.full_name || 'Staff Member'} ({userProfile?.role || 'Sales Executive'})
          </p>
        </div>

        {myAttendanceToday ? (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl p-3.5 max-w-sm mx-auto space-y-1">
            <div className="flex items-center justify-center space-x-1.5 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Punched In Today!</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Timestamp: <strong>{myAttendanceToday.check_in_time}</strong>
            </p>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePunchNow}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 mx-auto transition-all cursor-pointer"
            >
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
              <span>Punch In Attendance Now</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. ATTENDANCE LOG / HISTORY */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>My Attendance Records ({myHistory.length})</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Monthly Log</span>
        </div>

        <div className="divide-y divide-slate-100">
          {myHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No previous punch records found. Click 'Punch In' above to record your attendance.
            </div>
          ) : (
            myHistory.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    {new Date(rec.attendance_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Check-in: <strong className="text-slate-800">{rec.check_in_time || 'N/A'}</strong>
                  </p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[11px]">
                  ✓ Present
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
