import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { ZainLogo } from '../common/ZainLogo';
import { Lock, ArrowRight, AlertCircle, LogOut } from 'lucide-react';

export const PinLockOverlay: React.FC = () => {
  const { isScreenLocked, unlockScreen, userProfile, lastAccount, logoutUser } = useShop();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [usePasswordMode, setUsePasswordMode] = useState<boolean>(false);

  if (!isScreenLocked) return null;

  const activeUser = userProfile || lastAccount;

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!pinInput.trim()) {
      setErrorMsg('Please enter your PIN');
      return;
    }

    setIsUnlocking(true);
    try {
      const res = await unlockScreen(pinInput.trim());
      if (!res.success) {
        setErrorMsg(res.message || 'Incorrect PIN. Try again.');
        setPinInput('');
      } else {
        setPinInput('');
      }
    } catch {
      setErrorMsg('Failed to unlock. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleKeypad = (val: string) => {
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="flex justify-center mb-1">
            <ZainLogo size="sm" showText={true} />
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Counter Screen Locked</h2>
          <p className="text-xs text-slate-500 font-medium">Enter your PIN to unlock</p>
        </div>

        {/* User Card */}
        {activeUser && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                {(activeUser.full_name || activeUser.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">
                  {activeUser.full_name || activeUser.username}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {activeUser.role || 'Staff'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              Locked
            </span>
          </div>
        )}

        {/* Informational banner if PIN was not set */}
        {!userProfile?.pin && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
            💡 Aapka 4-digit PIN set nahi tha. Kripya apna account password enter karke unlock karein.
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PIN / Password Input */}
        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={usePasswordMode ? 'Enter Account Password' : 'Enter 4-Digit PIN'}
              className={`w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-orange-500 transition-colors ${
                usePasswordMode
                  ? 'text-center text-sm font-bold'
                  : 'text-center tracking-[0.4em] text-lg font-black font-mono placeholder:tracking-normal placeholder:text-xs placeholder-slate-400'
              }`}
            />
          </div>

          {/* Quick Touch Numpad (Shown when in PIN mode) */}
          {!usePasswordMode && (
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') handleKeypad('CLEAR');
                    else if (k === '⌫') handleKeypad('BACK');
                    else handleKeypad(k);
                  }}
                  className={`h-10 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
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
          )}

          <button
            type="submit"
            disabled={isUnlocking || !pinInput.trim()}
            className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-2xl text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <span>{isUnlocking ? 'Unlocking...' : usePasswordMode ? 'Unlock with Password' : 'Unlock Screen'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle between PIN and Password */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={() => {
              setUsePasswordMode(!usePasswordMode);
              setPinInput('');
              setErrorMsg('');
            }}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
          >
            {usePasswordMode ? '← Use 4-Digit PIN Instead' : 'Forgot PIN? Unlock with Password →'}
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={logoutUser}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch User / Log Out Completely</span>
          </button>
        </div>
      </div>
    </div>
  );
};
