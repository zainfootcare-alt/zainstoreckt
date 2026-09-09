import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../../components/common/ZainLogo';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, KeyRound, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser, loginWithPin, lastAccount, userProfile, clearRememberedAccount } = useShop();
  const navigate = useNavigate();

  // If session is already active, direct to dashboard
  useEffect(() => {
    if (userProfile) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [userProfile, navigate]);

  // If lastAccount exists, default to Quick PIN mode
  const [authMode, setAuthMode] = useState<'PIN' | 'FULL'>(() => (lastAccount ? 'PIN' : 'FULL'));

  // PIN mode state
  const [pinInput, setPinInput] = useState<string>('');

  // Full login state
  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle PIN Form Submit
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!pinInput.trim()) {
      setErrorMsg('Please enter your 4-digit PIN');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithPin(pinInput.trim());
      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setErrorMsg(res.message || 'Incorrect PIN. Try again.');
        setPinInput('');
      }
    } catch {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Full Credentials Submit
  const handleFullSubmit = async (e: React.FormEvent) => {
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
    try {
      const res = await loginUser(identifierInput, passwordInput);
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

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    if (val === 'CLEAR') {
      setPinInput('');
    } else if (val === 'BACK') {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      if (pinInput.length < 8) {
        setPinInput((prev) => prev + val);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center px-4 py-8 font-sans antialiased">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-1">
            <ZainLogo size="lg" showText={true} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {authMode === 'PIN' ? 'Fast PIN Unlock' : 'Sign In'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">Zain Footwear POS & CRM</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE A: QUICK PIN UNLOCK (Remembered user on device) */}
        {/* ================================================================= */}
        {authMode === 'PIN' && lastAccount ? (
          <div className="space-y-4">
            {/* Remembered User Card */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#ff6600] text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
                  {(lastAccount.full_name || lastAccount.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {lastAccount.full_name || lastAccount.username}
                    </p>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-orange-200/60 text-orange-900">
                      {lastAccount.role || 'Staff'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{lastAccount.email || lastAccount.username}</p>
                </div>
              </div>
              <UserCheck className="w-5 h-5 text-orange-600 flex-shrink-0" />
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-center">
                  Enter Your PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter PIN"
                    maxLength={8}
                    className="w-full text-center tracking-[0.4em] pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black font-mono text-slate-900 placeholder:tracking-normal placeholder:text-xs placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Touch Numpad (Perfect for POS Counter) */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'C') handleKeypadPress('CLEAR');
                      else if (k === '⌫') handleKeypadPress('BACK');
                      else handleKeypadPress(k);
                    }}
                    className={`h-11 rounded-xl font-mono text-sm font-black transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                      k === 'C'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : k === '⌫'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-900 hover:bg-orange-50 hover:text-orange-600 border border-slate-100'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !pinInput.trim()}
                className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-2xl text-sm shadow-xs flex items-center justify-center space-x-2 transition-all mt-2 disabled:opacity-40 cursor-pointer"
              >
                <span>{isSubmitting ? 'Unlocking...' : 'Unlock POS Counter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch Account Option */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setAuthMode('FULL');
                }}
                className="hover:text-orange-600 hover:underline cursor-pointer"
              >
                Login with Password
              </button>
              <button
                type="button"
                onClick={() => {
                  clearRememberedAccount();
                  setAuthMode('FULL');
                }}
                className="text-slate-400 hover:text-rose-600 hover:underline cursor-pointer text-[11px]"
              >
                Switch User
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* MODE B: STANDARD FULL LOGIN FORM */
          /* ================================================================= */
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
                Password / PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password or PIN"
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

            {lastAccount && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setAuthMode('PIN');
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Quick PIN Unlock ({lastAccount.full_name || lastAccount.username})</span>
                </button>
              </div>
            )}
          </form>
        )}

        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Persistent Session • 1-Click PIN Quick Access</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
