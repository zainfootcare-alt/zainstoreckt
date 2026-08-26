import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../../components/common/ZainLogo';
import { PwaInstallButton } from '../../components/common/PwaInstallButton';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser } = useShop();
  const navigate = useNavigate();

  const [identifierInput, setIdentifierInput] = useState<string>('admin');
  const [passwordInput, setPasswordInput] = useState<string>('1234');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifierInput.trim()) {
      setErrorMsg('Please enter your email or username');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMsg('Please enter your password or PIN');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginUser(identifierInput, passwordInput);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setErrorMsg(res.message || 'Invalid username or PIN.');
      }
    }, 150);
  };

  // Quick 1-Click Role Login Selector
  const quickSelect = (username: string, pin: string) => {
    setIdentifierInput(username);
    setPasswordInput(pin);
    setErrorMsg('');
    const res = loginUser(username, pin);
    if (res.success) {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center p-4 relative font-sans">
      {/* Top Banner PWA Install Option */}
      <div className="absolute top-4 right-4 z-20">
        <PwaInstallButton />
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 z-10">
        {/* LOGO & BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-orange-50 rounded-2xl border border-orange-100 mb-1">
            <ZainLogo size="md" showText={true} />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Sign In to POS & CRM</h1>
          <p className="text-xs text-slate-500 font-medium">Select a role below or enter your login PIN</p>
        </div>

        {/* 1-TAP QUICK ROLE SELECTOR (Khatabook Simplicity) */}
        <div className="space-y-2">
          <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
            Quick 1-Click Demo Login
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickSelect('admin', '1234')}
              className="p-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-2xl text-left transition-all active:scale-98 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-950">👑 Admin</span>
                <span className="text-[10px] font-mono font-bold text-orange-600 bg-white px-1.5 py-0.5 rounded border border-orange-200">1234</span>
              </div>
              <p className="text-[10px] text-orange-800 font-medium mt-0.5">Full System Access</p>
            </button>

            <button
              type="button"
              onClick={() => quickSelect('cashier', '1111')}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition-all active:scale-98 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950">🧮 Cashier</span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded border border-emerald-200">1111</span>
              </div>
              <p className="text-[10px] text-emerald-800 font-medium mt-0.5">Fast Sales & POS</p>
            </button>

            <button
              type="button"
              onClick={() => quickSelect('manager', '5678')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all active:scale-98"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">👔 Manager</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">5678</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Store Operations</p>
            </button>

            <button
              type="button"
              onClick={() => quickSelect('finance', '2222')}
              className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-left transition-all active:scale-98"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950">📑 Finance</span>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-200">2222</span>
              </div>
              <p className="text-[10px] text-indigo-800 font-medium mt-0.5">P&L & Accounting</p>
            </button>
          </div>
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MANUAL LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={identifierInput}
                onChange={(e) => setIdentifierInput(e.target.value)}
                placeholder="admin, cashier, manager, finance"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
              PIN / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all mt-3 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* FOOTER */}
        <div className="pt-2 text-center text-[11px] text-slate-400 font-medium flex items-center justify-center space-x-1 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
          <span>Zain Footwear POS • Retail Operations System</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
