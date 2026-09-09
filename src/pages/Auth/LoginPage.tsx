import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../../components/common/ZainLogo';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser, userProfile, users } = useShop();
  const navigate = useNavigate();

  // If session is already active, direct to dashboard
  useEffect(() => {
    if (userProfile) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [userProfile, navigate]);

  // Login form state
  const [identifierInput, setIdentifierInput] = useState<string>('saif@admin.com');
  const [passwordInput, setPasswordInput] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Full Credentials Submit
  const handleFullSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifierInput.trim()) {
      setErrorMsg('Please enter your email or username');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(identifierInput.trim(), passwordInput.trim());
      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setIdentifierInput(email);
    setPasswordInput(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center px-4 py-8 font-sans antialiased">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-1">
            <ZainLogo size="lg" showText={true} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Sign In</h1>
          <p className="text-xs text-slate-500 font-medium">Zain Footwear POS & Store Management</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Full Login Form */}
        <form onSubmit={handleFullSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Email / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={identifierInput}
                onChange={(e) => setIdentifierInput(e.target.value)}
                placeholder="Enter email or username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-2xl text-sm shadow-xs flex items-center justify-center space-x-2 transition-all mt-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo / Quick Select Accounts */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
            Quick Switch Demo Login
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('saif@admin.com', 'admin123')}
              className="p-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold text-orange-950 block text-[11px]">Saif (Admin)</span>
              <span className="text-[10px] text-orange-600 block">Full Store Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('cashier@zain.com', 'cashier123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold text-slate-800 block text-[11px]">Sales User</span>
              <span className="text-[10px] text-slate-500 block">Counter POS Staff</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Enterprise Authentication</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
