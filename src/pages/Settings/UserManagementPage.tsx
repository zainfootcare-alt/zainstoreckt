import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { UserProfile, SystemRole, Shop } from '../../types/database.types';
import {
  Users,
  Shield,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  User,
  ShieldCheck,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  Sparkles,
  Store,
  MapPin,
  Phone,
  AlertCircle,
  Loader2,
  Save,
  CheckSquare,
  Lock,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    activeRole,
    shops,
    addShop,
    updateShop,
    activeShop,
    checkSalesTimeAllowed,
  } = useShop();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') === 'store' ? 'STORE' : 'USERS';

  const [activeTab, setActiveTab] = useState<'USERS' | 'STORE'>(initialTab);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [roleInput, setRoleInput] = useState<SystemRole>('CASHIER');
  const [shopIdInput, setShopIdInput] = useState<string>(shops[0]?.id || '');
  const [statusInput, setStatusInput] = useState<'Active' | 'Inactive'>('Active');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<SystemRole>('CASHIER');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editName, setEditName] = useState<string>('');

  // -------------------------------------------------------------
  // Store Profile, Address, GST & Operating Hours State
  // -------------------------------------------------------------
  const targetShop = activeShop || shops[0];
  const [storeName, setStoreName] = useState<string>(targetShop?.name || 'Zain Footwear (Main Store)');
  const [storeCode, setStoreCode] = useState<string>(targetShop?.code || 'ZAIN-01');
  const [storePhone, setStorePhone] = useState<string>(targetShop?.phone || '+91 98200 12345');
  const [storeEmail, setStoreEmail] = useState<string>(targetShop?.email || 'contact@zainfootwear.com');
  const [storeGstin, setStoreGstin] = useState<string>(targetShop?.gstin || '27AAACZ9999F1Z5');
  const [storeAddress1, setStoreAddress1] = useState<string>(targetShop?.address_line_1 || 'Shop #12, Fashion Plaza, Linking Road');
  const [storeAddress2, setStoreAddress2] = useState<string>(targetShop?.address_line_2 || 'Bandra West');
  const [storeCity, setStoreCity] = useState<string>(targetShop?.city || 'Mumbai');
  const [storeState, setStoreState] = useState<string>(targetShop?.state || 'Maharashtra');
  const [storePostcode, setStorePostcode] = useState<string>(targetShop?.postcode || '400050');

  // Operating Hours & User/Role Assignment State
  const [storeRestrictionEnabled, setStoreRestrictionEnabled] = useState<boolean>(
    targetShop?.sales_time_restriction_enabled ?? false
  );
  const [storeStartTime, setStoreStartTime] = useState<string>(targetShop?.sales_start_time || '10:00');
  const [storeEndTime, setStoreEndTime] = useState<string>(targetShop?.sales_end_time || '22:00');
  const [restrictedRoles, setRestrictedRoles] = useState<string[]>(
    targetShop?.restricted_sales_roles || ['CASHIER', 'SALES', 'cashier']
  );
  const [restrictedUserIds, setRestrictedUserIds] = useState<string[]>(
    targetShop?.restricted_user_ids || []
  );

  // Sync state when targetShop changes
  useEffect(() => {
    if (targetShop) {
      setStoreName(targetShop.name || '');
      setStoreCode(targetShop.code || '');
      setStorePhone(targetShop.phone || '');
      setStoreEmail(targetShop.email || '');
      setStoreGstin(targetShop.gstin || '');
      setStoreAddress1(targetShop.address_line_1 || '');
      setStoreAddress2(targetShop.address_line_2 || '');
      setStoreCity(targetShop.city || '');
      setStoreState(targetShop.state || '');
      setStorePostcode(targetShop.postcode || '');
      setStoreRestrictionEnabled(targetShop.sales_time_restriction_enabled ?? false);
      setStoreStartTime(targetShop.sales_start_time || '10:00');
      setStoreEndTime(targetShop.sales_end_time || '22:00');
      setRestrictedRoles(targetShop.restricted_sales_roles || ['CASHIER', 'SALES', 'cashier']);
      setRestrictedUserIds(targetShop.restricted_user_ids || []);
    }
  }, [targetShop]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  // Handle Save Store Profile & Operating Hours
  const handleSaveStoreProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetShop) return;

    if (!storeName.trim()) {
      showToast('error', 'Store Name cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateShop(targetShop.id, {
        name: storeName.trim(),
        code: storeCode.trim(),
        phone: storePhone.trim(),
        email: storeEmail.trim(),
        gstin: storeGstin.trim(),
        address_line_1: storeAddress1.trim(),
        address_line_2: storeAddress2.trim(),
        city: storeCity.trim(),
        state: storeState.trim(),
        postcode: storePostcode.trim(),
        sales_time_restriction_enabled: storeRestrictionEnabled,
        sales_start_time: storeStartTime,
        sales_end_time: storeEndTime,
        restricted_sales_roles: restrictedRoles,
        restricted_user_ids: restrictedUserIds,
      });
      showToast('success', '✅ Store information, GST, address & operating hours saved successfully!');
    } catch (err: any) {
      console.error('Save store error:', err);
      showToast('error', `Failed to save store settings: ${err?.message || 'Database error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Role Assignment Toggle
  const toggleRestrictedRole = (role: string) => {
    setRestrictedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Handle User Assignment Toggle
  const toggleRestrictedUser = (userId: string) => {
    setRestrictedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Handle Add User Submit
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanName = nameInput.trim();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanUsername = usernameInput.trim().toLowerCase() || cleanEmail.split('@')[0];

    if (!cleanName || !cleanEmail) {
      setModalError('Full name and email are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addUser({
        organization_id: 'a1000000-0000-0000-0000-000000000001',
        full_name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        role: roleInput,
        default_shop_id: shopIdInput || shops[0]?.id || undefined,
        status: statusInput,
      });

      // Reset Form
      setNameInput('');
      setEmailInput('');
      setUsernameInput('');
      setIsAddModalOpen(false);
      showToast('success', `User account for "${cleanName}" created successfully!`);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      const errMsg = err?.message || err?.details || 'Failed to create user.';
      setModalError(`Error creating user: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.full_name || '');
    setEditRole(user.role || 'CASHIER');
    setEditStatus(user.status || 'Active');
    setModalError(null);
  };

  const handleSaveUserEdits = async () => {
    if (!editingUser) return;
    try {
      setIsSubmitting(true);
      await updateUser(editingUser.id, {
        full_name: editName.trim(),
        role: editRole,
        status: editStatus,
      });
      setEditingUser(null);
      showToast('success', 'User account details updated successfully!');
    } catch (err: any) {
      console.error('Failed to update user:', err);
      showToast('error', `Failed to update user: ${err?.message || 'Database error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to delete user account "${user.full_name || user.email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser(user.id);
      showToast('success', `User account "${user.full_name || user.email}" deleted.`);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      showToast('error', `Failed to delete user: ${err?.message || 'Database error'}`);
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MANAGER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CASHIER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FINANCE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const timeCheck = checkSalesTimeAllowed();

  return (
    <PermissionGuard requiredPermission="settings:manage">
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans px-3 sm:px-6 py-4">
        {/* TOAST ALERT */}
        {toastMsg && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 ${
              toastMsg.type === 'success'
                ? 'bg-slate-900 text-white border border-emerald-500/50'
                : 'bg-rose-900 text-white border border-rose-500/50'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Administration Settings
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {targetShop?.name || 'Zain Footwear'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#ff6600]" /> Store Profile & Access Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage store name, address, GSTIN, operating sales hours, and assign user restrictions.
            </p>
          </div>

          {/* MAIN TABS SWITCHER */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('STORE')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'STORE'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-orange-600" />
              <span>Store Info & Hours</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'USERS'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Staff Accounts ({users.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: STORE PROFILE, ADDRESS, GST & OPERATING HOURS */}
        {/* ========================================================================= */}
        {activeTab === 'STORE' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveStoreProfile} className="space-y-6">
              {/* Card 1: Store Basic Info & GST */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff6600] flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">Store Information & GSTIN</h2>
                      <p className="text-xs text-slate-500">
                        Official shop identity displayed on POS receipts, tax invoices, and customer communications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Zain Footwear (Main Store)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Store Code
                    </label>
                    <input
                      type="text"
                      value={storeCode}
                      onChange={(e) => setStoreCode(e.target.value)}
                      placeholder="ZAIN-01"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      GSTIN Tax Registration Number
                    </label>
                    <input
                      type="text"
                      value={storeGstin}
                      onChange={(e) => setStoreGstin(e.target.value)}
                      placeholder="27AAACZ9999F1Z5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Store Phone / Mobile
                    </label>
                    <input
                      type="text"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Store Email Address
                    </label>
                    <input
                      type="email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      placeholder="contact@zainfootwear.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Full Address Block */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> Physical Store Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-bold text-slate-700">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                        Address Line 1 (Shop No, Building, Street)
                      </label>
                      <input
                        type="text"
                        value={storeAddress1}
                        onChange={(e) => setStoreAddress1(e.target.value)}
                        placeholder="Shop #12, Fashion Plaza, Linking Road"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                        Address Line 2 (Area, Landmark)
                      </label>
                      <input
                        type="text"
                        value={storeAddress2}
                        onChange={(e) => setStoreAddress2(e.target.value)}
                        placeholder="Bandra West"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">City</label>
                      <input
                        type="text"
                        value={storeCity}
                        onChange={(e) => setStoreCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">State</label>
                      <input
                        type="text"
                        value={storeState}
                        onChange={(e) => setStoreState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Pincode</label>
                      <input
                        type="text"
                        value={storePostcode}
                        onChange={(e) => setStorePostcode(e.target.value)}
                        placeholder="400050"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Operating Hours & User Restriction Assignment */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900">Store Operating Hours & Sales Access</h2>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          Admin Security Rule
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        When enabled, assigned sales users only see the dashboard and counter POS during operating hours.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        storeRestrictionEnabled
                          ? timeCheck.isWithinWindow
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {storeRestrictionEnabled
                        ? timeCheck.isWithinWindow
                          ? '● Store Open'
                          : '● Outside Operating Hours'
                        : '○ 24/7 Access (Unlocked)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setStoreRestrictionEnabled(!storeRestrictionEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        storeRestrictionEnabled
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {storeRestrictionEnabled ? 'Turn OFF Lock' : 'Enable Store Hours Lock'}
                    </button>
                  </div>
                </div>

                {/* Opening and Closing Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">
                      Store Opening / Sales Start Time
                    </label>
                    <input
                      type="time"
                      value={storeStartTime}
                      onChange={(e) => setStoreStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-[10px] text-slate-400">Sales dashboard unlocks at this time</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">
                      Store Closing / Sales End Time
                    </label>
                    <input
                      type="time"
                      value={storeEndTime}
                      onChange={(e) => setStoreEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-[10px] text-slate-400">Sales dashboard locks after this time</p>
                  </div>
                </div>

                {/* USER & ROLE ASSIGNMENT (किस किस यूजर पर अप्लाई होगा ये एडमिन असाइन करे) */}
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                      Assign Restriction: System Roles
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select which user roles are restricted to store hours. <strong>Admin role is always 24/7 unrestricted.</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { role: 'CASHIER', label: 'Cashier / Sales', desc: 'POS Counter Billing' },
                      { role: 'SALES', label: 'Sales Staff', desc: 'Floor Sales Staff' },
                      { role: 'MANAGER', label: 'Store Manager', desc: 'Branch Supervisor' },
                      { role: 'FINANCE', label: 'Finance Staff', desc: 'Accounts & Ledger' },
                    ].map((item) => {
                      const isSelected = restrictedRoles.some((r) => r.toUpperCase() === item.role);
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => toggleRestrictedRole(item.role)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50/80 border-orange-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 pointer-events-none"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                          <span
                            className={`text-[9px] font-black uppercase mt-2 inline-block px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-orange-200/70 text-orange-900' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isSelected ? 'Restricted to Hours' : 'Exempt'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Individual Staff Assignment */}
                  <div className="pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Assign Restriction: Specific Staff Accounts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {users.map((u) => {
                        const isRestrictedByRole = restrictedRoles.some(
                          (r) => r.toUpperCase() === String(u.role).toUpperCase()
                        );
                        const isRestrictedByUser = restrictedUserIds.includes(u.id);
                        const isRestricted = isRestrictedByRole || isRestrictedByUser;
                        const isSystemAdmin = u.role === 'ADMIN';

                        return (
                          <div
                            key={u.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between ${
                              isSystemAdmin
                                ? 'bg-slate-50/50 border-slate-200/60 opacity-60'
                                : isRestricted
                                ? 'bg-orange-50/50 border-orange-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-extrabold text-slate-900 truncate">
                                {u.full_name || u.email}
                              </p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                <span className="font-bold">{u.role}</span>
                                {isSystemAdmin && (
                                  <span className="text-[9px] font-black text-slate-400 uppercase">
                                    (24/7 Always Open)
                                  </span>
                                )}
                              </p>
                            </div>

                            {!isSystemAdmin && (
                              <button
                                type="button"
                                onClick={() => toggleRestrictedUser(u.id)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                                  isRestricted
                                    ? 'bg-[#ff6600] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {isRestricted ? 'Restricted' : 'Allow 24/7'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Action Bar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Store Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Store Information & Access Rules</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STAFF & USER ACCOUNTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'USERS' && (
          <div className="space-y-6">
            {/* Role Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-black">
                  {users.filter((u) => u.role === 'ADMIN').length}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">System Admins</p>
                  <p className="text-xs font-extrabold text-slate-900">Full Access (24/7)</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black">
                  {users.filter((u) => u.role === 'MANAGER').length}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Store Managers</p>
                  <p className="text-xs font-extrabold text-slate-900">Ops & Staff</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-black">
                  {users.filter((u) => u.role === 'CASHIER').length}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">POS Cashiers</p>
                  <p className="text-xs font-extrabold text-slate-900">Sales & Billing</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-black">
                  {users.filter((u) => u.role === 'FINANCE').length}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Finance Officers</p>
                  <p className="text-xs font-extrabold text-slate-900">Accounts & Ledger</p>
                </div>
              </div>
            </div>

            {/* CONTROLS: SEARCH & ROLE FILTER & ADD BUTTON */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff name or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
                <div className="flex items-center space-x-1.5">
                  {['ALL', 'ADMIN', 'MANAGER', 'CASHIER', 'FINANCE'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                        roleFilter === r
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Staff User</span>
                </button>
              </div>
            </div>

            {/* USERS DIRECTORY TABLE (NO PIN COLUMN) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] bg-slate-50/50">
                      <th className="py-3.5 px-5">Staff Member</th>
                      <th className="py-3.5 px-5">System Role</th>
                      <th className="py-3.5 px-5">Store Hours Policy</th>
                      <th className="py-3.5 px-5">Account Status</th>
                      <th className="py-3.5 px-5">Last Sign In</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isRestrictedRole = restrictedRoles.some(
                        (r) => r.toUpperCase() === String(user.role).toUpperCase()
                      );
                      const isRestrictedUser = restrictedUserIds.includes(user.id);
                      const hasHourLock = user.role !== 'ADMIN' && (isRestrictedRole || isRestrictedUser);

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs border border-slate-700">
                                {user.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs">{user.full_name}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getRoleBadgeStyle(user.role)}`}>
                              {user.role}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            {user.role === 'ADMIN' ? (
                              <span className="text-[10px] font-bold text-slate-400">24/7 Full Access</span>
                            ) : hasHourLock ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Clock className="w-3 h-3" /> Store Hours Only ({storeStartTime} - {storeEndTime})
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Unrestricted (24/7)
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                user.status !== 'Inactive'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {user.status !== 'Inactive' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" /> Deactivated
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-slate-500 font-medium text-[11px]">
                            {user.last_login ? new Date(user.last_login).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                          </td>

                          <td className="py-4 px-5 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                            {user.role !== 'ADMIN' && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden p-4 space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-xs">
                          {user.full_name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs">{user.full_name}</h4>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-200">
                      <span className="text-slate-500 text-[11px]">
                        Status: <strong className={user.status !== 'Inactive' ? 'text-emerald-600' : 'text-rose-600'}>{user.status || 'Active'}</strong>
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 font-bold rounded-lg text-[11px]"
                        >
                          Edit
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg text-[11px]"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW USER (NO PIN) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleAddUser}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Add New Staff Account</h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="rahul@zainfootwear.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value as SystemRole)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="CASHIER">CASHIER (POS Billing)</option>
                      <option value="MANAGER">MANAGER (Ops & Staff)</option>
                      <option value="ADMIN">ADMIN (Full Control)</option>
                      <option value="FINANCE">FINANCE (Accounts)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value as 'Active' | 'Inactive')}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Deactivated</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black rounded-2xl text-xs shadow-md transition-all mt-2 cursor-pointer"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* MODAL: EDIT USER DETAILS (NO PIN) */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Edit Staff Account</h3>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as SystemRole)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="FINANCE">FINANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Deactivated</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveUserEdits}
                className="w-full py-3.5 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default UserManagementPage;
