import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, Check, X, AlertCircle } from 'lucide-react';

export const SetPinModal: React.FC = () => {
  const {
    isSetPinModalOpen,
    closeSetPinModal,
    pinPromptAction,
    updateUserPin,
    lockScreen,
    userProfile,
    lastAccount,
  } = useShop();

  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isSetPinModalOpen) return null;

  const activeUser = userProfile || lastAccount;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^\d{4}$/.test(newPin.trim())) {
      setErrorMsg('Please enter a 4-digit numeric PIN (0-9).');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMsg('PINs do not match. Please re-enter.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserPin(newPin.trim());
      if (res.success) {
        setSuccessMsg('✅ Security PIN saved successfully!');
        setTimeout(() => {
          closeSetPinModal();
          setNewPin('');
          setConfirmPin('');
          setSuccessMsg('');
          if (pinPromptAction === 'LOCK') {
            lockScreen();
          }
        }, 500);
      } else {
        setErrorMsg(res.error || 'Failed to save PIN. Please try again.');
      }
    } catch {
      setErrorMsg('Failed to save PIN.');
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
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                {pinPromptAction === 'LOCK' ? 'Set PIN to Lock' : 'Set 4-Digit Quick PIN'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeUser?.full_name || activeUser?.username || 'Staff Member'}
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

        {/* Feedback Alert */}
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

        {/* Clean Single Form */}
        <form onSubmit={handleSavePin} className="space-y-3.5">
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                autoFocus
                className="w-full text-center tracking-[0.4em] py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black font-mono text-slate-900 placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                Confirm 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full text-center tracking-[0.4em] py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black font-mono text-slate-900 placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSaving || newPin.length !== 4 || confirmPin.length !== 4}
              className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? 'Saving PIN...' : 'Save 4-Digit PIN'}</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetPinModal;
