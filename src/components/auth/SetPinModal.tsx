import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, Check, X, AlertCircle, ShieldCheck } from 'lucide-react';

export const SetPinModal: React.FC = () => {
  const {
    isSetPinModalOpen,
    closeSetPinModal,
    pinPromptAction,
    updateUserPin,
    userProfile,
    lastAccount,
  } = useShop();

  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [focusedField, setFocusedField] = useState<'new' | 'confirm'>('new');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isSetPinModalOpen) return null;

  const activeUser = userProfile || lastAccount;

  const handleKeypad = (val: string) => {
    setErrorMsg('');
    if (val === 'CLEAR') {
      if (focusedField === 'new') setNewPin('');
      else setConfirmPin('');
    } else if (val === 'BACK') {
      if (focusedField === 'new') setNewPin((prev) => prev.slice(0, -1));
      else setConfirmPin((prev) => prev.slice(0, -1));
    } else {
      if (focusedField === 'new') {
        if (newPin.length < 4) {
          const next = newPin + val;
          setNewPin(next);
          if (next.length === 4) {
            setFocusedField('confirm');
          }
        }
      } else {
        if (confirmPin.length < 4) {
          setConfirmPin((prev) => prev + val);
        }
      }
    }
  };

  const handleSavePin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^\d{4}$/.test(newPin.trim())) {
      setErrorMsg('PIN exactly 4-digits ka hona chahiye (0-9).');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMsg('Dono PIN match nahi ho rahe. Kripya dobara check karein.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserPin(newPin.trim());
      if (res.success) {
        setSuccessMsg('✅ 4-Digit Security PIN successfully set!');
        setTimeout(() => {
          closeSetPinModal();
          setNewPin('');
          setConfirmPin('');
          setSuccessMsg('');
          // If triggered by lock request, now proceed to lock screen
          if (pinPromptAction === 'LOCK') {
            // Note: lockScreen will now see the new PIN and lock cleanly
            window.location.reload(); // Quick refresh ensures active session has the latest PIN state
          }
        }, 600);
      } else {
        setErrorMsg(res.error || 'PIN save karne me samasya aayi. Kripya dobara try karein.');
      }
    } catch {
      setErrorMsg('PIN save nahi ho paya.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setNewPin('');
    setConfirmPin('');
    closeSetPinModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-3.5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">
                {pinPromptAction === 'LOCK' ? 'Set PIN to Lock Screen' : 'Set 4-Digit Security PIN'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeUser?.full_name || activeUser?.username || 'Staff Member'} ({activeUser?.role || 'Staff'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain Banner */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-2.5 text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-800">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Kyu chahiye 4-Digit PIN?</span>
          </p>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Aapne abhi tak koi Quick PIN set nahi kiya hai. Fast screen lock aur counter safe rakhne ke liye 4-digit PIN zaroori hai.
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSavePin} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                Enter 4-Digit PIN *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onFocus={() => setFocusedField('new')}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setNewPin(v);
                  if (v.length === 4) setFocusedField('confirm');
                }}
                placeholder="••••"
                className={`w-full text-center tracking-[0.3em] py-2 px-3 bg-slate-50 border rounded-xl text-base font-black font-mono text-slate-900 placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400 focus:outline-none transition-colors ${
                  focusedField === 'new' ? 'border-orange-500 ring-1 ring-orange-400 bg-white' : 'border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                Confirm PIN *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onFocus={() => setFocusedField('confirm')}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className={`w-full text-center tracking-[0.3em] py-2 px-3 bg-slate-50 border rounded-xl text-base font-black font-mono text-slate-900 placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400 focus:outline-none transition-colors ${
                  focusedField === 'confirm' ? 'border-orange-500 ring-1 ring-orange-400 bg-white' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Quick Touch Numpad */}
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') handleKeypad('CLEAR');
                  else if (k === '⌫') handleKeypad('BACK');
                  else handleKeypad(k);
                }}
                className={`h-9 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
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

          {/* Action Buttons */}
          <div className="pt-2 space-y-1.5">
            <button
              type="submit"
              disabled={isSaving || newPin.length !== 4 || confirmPin.length !== 4}
              className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSaving
                  ? 'Saving PIN...'
                  : pinPromptAction === 'LOCK'
                  ? 'Save PIN & Lock Counter'
                  : 'Save 4-Digit Security PIN'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Cancel / Abhi Nahi Karna
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 text-center italic">
          💡 Aap baad me kabhi bhi &quot;My Profile&quot; se apna PIN set ya change kar sakte hain.
        </p>
      </div>
    </div>
  );
};
