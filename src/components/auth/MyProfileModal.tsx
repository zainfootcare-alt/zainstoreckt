import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Smartphone,
  Store,
  LogOut,
} from 'lucide-react';

export const MyProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    closeProfileModal,
    userProfile,
    lastAccount,
    hasConfiguredPin,
    updateUserPin,
    updateUserProfile,
    lockScreen,
    logoutUser,
    activeShop,
    activeRole,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'PIN' | 'PASSWORD' | 'DETAILS'>('PIN');

  // Edit details state
  const [fullName, setFullName] = useState<string>(userProfile?.full_name || '');
  const [phone, setPhone] = useState<string>('');

  // PIN Change State
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isProfileModalOpen) return null;

  const activeUser = userProfile || lastAccount;

  // Handle Save / Change PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^\d{4}$/.test(newPin.trim())) {
      setErrorMsg('PIN exactly 4-digits ka hona chahiye (0-9).');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMsg('Dono PIN match nahi ho rahe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserPin(newPin.trim());
      if (res.success) {
        setSuccessMsg('✅ 4-Digit Security PIN successfully update ho gaya!');
        setNewPin('');
        setConfirmPin('');
        setIsChangingPin(false);
      } else {
        setErrorMsg(res.error || 'PIN update nahi ho paya.');
      }
    } catch {
      setErrorMsg('PIN update karte samay truti aayi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword.trim() || newPassword.length < 4) {
      setErrorMsg('New password kam se kam 4 characters ka hona chahiye.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password aur Confirm password match nahi ho rahe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({ password: newPassword });
      if (res.success) {
        setSuccessMsg('✅ Password successfully update ho gaya!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.error || 'Password update nahi ho paya.');
      }
    } catch {
      setErrorMsg('Password update karte samay error aaya.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Profile Details Save
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name khali nahi ho sakta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({ full_name: fullName.trim() });
      if (res.success) {
        setSuccessMsg('✅ Profile details successfully save ho gayi!');
      } else {
        setErrorMsg(res.error || 'Profile update nahi ho payi.');
      }
    } catch {
      setErrorMsg('Profile update error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-md">
              {(activeUser?.full_name || activeUser?.username || 'Z').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">My Profile & Security</h3>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="font-bold">{activeUser?.full_name || activeUser?.username || 'User'}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.2 bg-orange-500/30 text-orange-300 rounded-md border border-orange-400/40">
                  {activeRole}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeProfileModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Identity Summary Banner */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 truncate">
            <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium">{activeShop?.name || 'Zain Footwear Store'}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {activeUser?.email || activeUser?.username}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab('PIN');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 px-2 text-xs font-black flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'PIN'
                ? 'border-[#ff6600] text-[#ff6600] bg-orange-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security PIN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('PASSWORD');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 px-2 text-xs font-black flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'PASSWORD'
                ? 'border-[#ff6600] text-[#ff6600] bg-orange-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('DETAILS');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 px-2 text-xs font-black flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'DETAILS'
                ? 'border-[#ff6600] text-[#ff6600] bg-orange-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Info</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 1: 4-DIGIT SECURITY PIN MANAGEMENT */}
          {/* ============================================================= */}
          {activeTab === 'PIN' && (
            <div className="space-y-4">
              {/* PIN Status Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  hasConfiguredPin
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-amber-50/80 border-amber-200'
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck
                      className={`w-5 h-5 ${hasConfiguredPin ? 'text-emerald-600' : 'text-amber-600'}`}
                    />
                    <span className="text-xs font-black text-slate-900">
                      {hasConfiguredPin ? '4-Digit Quick PIN Active' : 'No PIN Configured'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      hasConfiguredPin
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {hasConfiguredPin ? '•••• Active' : 'Action Required'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {hasConfiguredPin
                    ? 'Aapka 4-digit PIN active hai. Aap POS counter ya app ko kabhi bhi 1-tap me lock kar sakte hain.'
                    : 'Aapne abhi tak koi PIN set nahi kiya hai. Quick lock aur screen security ke liye 4-digit PIN banayein.'}
                </p>

                {hasConfiguredPin && !isChangingPin && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPin(true)}
                      className="py-1.5 px-3 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Change 4-Digit PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeProfileModal();
                        lockScreen();
                      }}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Screen Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Set / Change PIN Form */}
              {(!hasConfiguredPin || isChangingPin) && (
                <form onSubmit={handleSavePin} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                    {hasConfiguredPin ? 'Enter New 4-Digit PIN' : 'Set Your 4-Digit PIN'}
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                        New 4-Digit PIN *
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="••••"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full text-center tracking-[0.3em] py-2 px-3 bg-white border border-slate-300 rounded-xl text-base font-black font-mono text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
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
                        placeholder="••••"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full text-center tracking-[0.3em] py-2 px-3 bg-white border border-slate-300 rounded-xl text-base font-black font-mono text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || newPin.length !== 4 || confirmPin.length !== 4}
                      className="flex-1 py-2.5 bg-[#ff6600] hover:bg-orange-600 active:scale-98 text-white font-black rounded-xl text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {isSubmitting ? 'Saving...' : 'Save 4-Digit PIN'}
                    </button>
                    {isChangingPin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPin(false);
                          setNewPin('');
                          setConfirmPin('');
                        }}
                        className="py-2.5 px-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: PASSWORD CHANGE */}
          {/* ============================================================= */}
          {activeTab === 'PASSWORD' && (
            <form onSubmit={handleSavePassword} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Change Account Password
              </h4>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || !confirmPassword}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black rounded-xl text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isSubmitting ? 'Updating Password...' : 'Update Account Password'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* TAB 3: PROFILE DETAILS */}
          {/* ============================================================= */}
          {activeTab === 'DETAILS' && (
            <form onSubmit={handleSaveDetails} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Personal Staff Details
              </h4>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  Username (Fixed)
                </label>
                <input
                  type="text"
                  disabled
                  value={activeUser?.username || 'user'}
                  className="w-full py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  System Role
                </label>
                <input
                  type="text"
                  disabled
                  value={activeRole}
                  className="w-full py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !fullName.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-xl text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isSubmitting ? 'Saving Details...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Device & Session Actions */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-800">Persistent Device Login</p>
                <p className="text-[10px] text-slate-500">Auto-refresh enabled (no repeat login)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                closeProfileModal();
                logoutUser();
              }}
              className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
