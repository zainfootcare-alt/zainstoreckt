import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../../components/common/ZainLogo';
import { PwaInstallButton } from '../../components/common/PwaInstallButton';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser } = useShop();
  const navigate = useNavigate();

  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
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
        setErrorMsg(res.message || 'Invalid email/username or PIN.');
      }
    }, 200);
  };

  // Quick fill helper for testing demo accounts
  const quickFill = (email: string, pin: string) => {
    setIdentifierInput(email);
    setPasswordInput(pin);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner PWA Install Option */}
      <div className="absolute top-4 right-4 z-20">
        <PwaInstallButton />
      </div>

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10">
        {/* LOGO & BRAND HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
            <ZainLogo size="lg" showText={true} lightText={true} />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-white tracking-tight">Sign In to POS & CRM</h1>
            <p className="text-xs text-slate-400 font-medium">Enter your credentials to access your store workspace</p>
          </div>
        </div>

        {/* ERROR MESSAGE ALERT */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold flex items-center space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STANDARD LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={identifierInput}
                onChange={(e) => setIdentifierInput(e.target.value)}
                placeholder="Enter email or username"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password / PIN Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                Password / Security PIN
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password or PIN"
                className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Options */}
          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-orange-950/40 flex items-center justify-center space-x-2 transition-all mt-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* DEMO QUICK FILL BUTTONS (Subtle & Clean) */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[10px] font-extrabold uppercase text-slate-500 text-center tracking-wider">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => quickFill('admin@zainfootwear.com', '1234')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-orange-400 text-[10px] font-extrabold rounded-xl border border-slate-700/60 transition-all text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill('manager@zainfootwear.com', '5678')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-blue-400 text-[10px] font-extrabold rounded-xl border border-slate-700/60 transition-all text-center"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => quickFill('cashier@zainfootwear.com', '1111')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-[10px] font-extrabold rounded-xl border border-slate-700/60 transition-all text-center"
            >
              Cashier
            </button>
            <button
              type="button"
              onClick={() => quickFill('finance@zainfootwear.com', '2222')}
              className="px-2 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-purple-400 text-[10px] font-extrabold rounded-xl border border-slate-700/60 transition-all text-center"
            >
              Finance
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-2 text-center text-[10px] text-slate-500 font-medium flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
          <span>Zain Footwear POS & CRM • Multi-User System</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
