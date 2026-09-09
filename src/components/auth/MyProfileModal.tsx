import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  User,
  Lock,
  Check,
  X,
  AlertCircle,
  Store,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const MyProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    closeProfileModal,
    userProfile,
    lastAccount,
    updateUserProfile,
    logoutUser,
    activeShop,
    activeRole,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PASSWORD'>('DETAILS');

  // Edit details state
  const [fullName, setFullName] = useState<string>(userProfile?.full_name || '');

  // Password Change State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isProfileModalOpen) return null;

  const activeUser = userProfile || lastAccount;

  // Handle Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword.trim() || newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({ password: newPassword });
      if (res.success) {
        setSuccessMsg('✅ Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
      }
    } catch {
      setErrorMsg('Error updating password.');
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
      setErrorMsg('Full Name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({ full_name: fullName.trim() });
      if (res.success) {
        setSuccessMsg('✅ Profile details updated successfully!');
      } else {
        setErrorMsg(res.error || 'Failed to update profile.');
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
        <div className="grid grid-cols-2 border-b border-slate-200 bg-white">
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
            <span>Profile Details</span>
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
            <Lock className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Alert Notifications */}
        <div className="p-4 pb-0 space-y-2">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'DETAILS' && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={activeUser?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  System Role
                </label>
                <input
                  type="text"
                  disabled
                  value={activeRole}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 uppercase cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'PASSWORD' && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword}
                  className="w-full py-3 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">
            Zain POS v2.0
          </span>
          <button
            type="button"
            onClick={() => {
              closeProfileModal();
              logoutUser();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfileModal;
