import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../../components/common/ZainLogo';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser } = useShop();
  const navigate = useNavigate();

  const [identifierInput, setIdentifierInput] = useState<string>('saif@admin.com');
  const [passwordInput, setPasswordInput] = useState<string>('Saif@Zain');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifierInput.trim()) {
      setErrorMsg('Please enter your email or username (saif@admin.com)');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMsg('Please enter your password (Saif@Zain)');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginUser(identifierInput, passwordInput);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center px-4 py-8 font-sans antialiased">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-orange-50 rounded-2xl border border-orange-100 mb-1">
            <ZainLogo size="md" showText={true} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Sign In</h1>
          <p className="text-xs text-slate-500 font-medium">Zain Footwear POS & CRM</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="saif@admin.com"
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
                placeholder="Saif@Zain"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
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
            className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-2xl text-sm shadow-xs flex items-center justify-center space-x-2 transition-all mt-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In as Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Credentials Info */}
        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 space-y-0.5 font-medium">
          <p>Admin Login: <strong className="text-slate-700">saif@admin.com</strong></p>
          <p>Password: <strong className="text-slate-700 font-mono">Saif@Zain</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
