import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { UserProfile, SystemRole, Shop } from '../../types/database.types';
import {
  Users,
  Shield,
  Plus,
  KeyRound,
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
  Lock,
  ChevronRight,
  Sparkles,
  Store,
  MapPin,
  Phone,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, activeRole, shops, addShop, updateShop } = useShop();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [roleInput, setRoleInput] = useState<SystemRole>('CASHIER');
  const [pinInput, setPinInput] = useState<string>('');
  const [shopIdInput, setShopIdInput] = useState<string>(shops[0]?.id || '');
  const [statusInput, setStatusInput] = useState<'Active' | 'Inactive'>('Active');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<SystemRole>('CASHIER');
  const [editPin, setEditPin] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editName, setEditName] = useState<string>('');

  // Shop Details Modal State
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState<boolean>(false);
  const [newShopName, setNewShopName] = useState<string>('');
  const [newShopCode, setNewShopCode] = useState<string>('');
  const [newShopCity, setNewShopCity] = useState<string>('Mumbai');
  const [newShopPhone, setNewShopPhone] = useState<string>('');
  const [newShopAddress, setNewShopAddress] = useState<string>('');
  const [newShopGstin, setNewShopGstin] = useState<string>('27AAACZ9999F1Z5');

  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editShopName, setEditShopName] = useState<string>('');
  const [editShopCode, setEditShopCode] = useState<string>('');
  const [editShopCity, setEditShopCity] = useState<string>('');
  const [editShopPhone, setEditShopPhone] = useState<string>('');
  const [editShopAddress, setEditShopAddress] = useState<string>('');
  const [editShopGstin, setEditShopGstin] = useState<string>('');

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput) return;

    addUser({
      full_name: nameInput,
      email: emailInput,
      username: usernameInput || emailInput.split('@')[0],
      role: roleInput,
      pin: pinInput || '1234',
      default_shop_id: shopIdInput,
      status: statusInput,
      organization_id: 'org-footwear-101',
      is_onboarded: true,
    });

    // Reset Form
    setNameInput('');
    setEmailInput('');
    setUsernameInput('');
    setPinInput('');
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.full_name || '');
    setEditRole(user.role || 'CASHIER');
    setEditPin(user.pin || '1234');
    setEditStatus(user.status || 'Active');
  };

  const handleSaveUserEdits = () => {
    if (!editingUser) return;
    updateUser(editingUser.id, {
      full_name: editName,
      role: editRole,
      pin: editPin,
      status: editStatus,
    });
    setEditingUser(null);
  };

  // Shop Outlets Actions
  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName) return;

    addShop({
      organization_id: 'org-footwear-101',
      name: newShopName,
      code: newShopCode || `ZAIN-0${shops.length + 1}`,
      city: newShopCity,
      phone: newShopPhone,
      address_line_1: newShopAddress,
      gstin: newShopGstin,
      is_active: true,
    });

    setIsAddShopModalOpen(false);
    setNewShopName('');
    setNewShopCode('');
    setNewShopPhone('');
    setNewShopAddress('');
  };

  const handleOpenEditShopModal = (shop: Shop) => {
    setEditingShop(shop);
    setEditShopName(shop.name);
    setEditShopCode(shop.code);
    setEditShopCity(shop.city || '');
    setEditShopPhone(shop.phone || '');
    setEditShopAddress(shop.address_line_1 || '');
    setEditShopGstin(shop.gstin || '27AAACZ9999F1Z5');
  };

  const handleSaveShopEdits = () => {
    if (!editingShop) return;
    updateShop(editingShop.id, {
      name: editShopName,
      code: editShopCode,
      city: editShopCity,
      phone: editShopPhone,
      address_line_1: editShopAddress,
      gstin: editShopGstin,
    });
    setEditingShop(null);
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CASHIER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'FINANCE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <PermissionGuard requiredPermission="settings:manage">
      <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-orange-600" /> User Management & Store Settings
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage system staff accounts, shop outlet details, RBAC roles (Admin, Manager, Cashier, Finance), & reset login PINs
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#ff6600] hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New System User</span>
          </button>
        </div>

        {/* STORE OUTLETS & SHOP INFORMATION SECTION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-600" /> Store Outlets & Shop Information
              </h3>
              <p className="text-xs text-slate-500 font-medium">Manage store name, address, phone number & register new store outlets</p>
            </div>
            <button
              onClick={() => setIsAddShopModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-orange-400" /> Add Store Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shops.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs border border-orange-200">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{s.name}</h4>
                      <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">STORE CODE: {s.code}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEditShopModal(s)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-500 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-orange-600" /> Edit Store Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-200">
                  <div><span className="text-slate-400 font-bold">City:</span> {s.city || 'Mumbai'}</div>
                  <div><span className="text-slate-400 font-bold">Phone:</span> {s.phone || '+91 98200 12345'}</div>
                  <div className="col-span-2 truncate"><span className="text-slate-400 font-bold">Address:</span> {s.address_line_1 || 'Main Market Road'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROLE METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-black">
              {users.filter((u) => u.role === 'ADMIN').length}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">System Admins</p>
              <p className="text-xs font-extrabold text-slate-900">Full Access</p>
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

        {/* CONTROLS: SEARCH & ROLE FILTER */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 whitespace-nowrap">Filter Role:</span>
            {['ALL', 'ADMIN', 'MANAGER', 'CASHIER', 'FINANCE'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SYSTEM USERS DIRECTORY TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-5">User Account</th>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-5">Security PIN</th>
                  <th className="py-3.5 px-5">Account Status</th>
                  <th className="py-3.5 px-5">Last Sign In</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
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

                    <td className="py-4 px-5 font-mono text-slate-700 font-bold">
                      <div className="flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{user.pin || '1234'}</span>
                      </div>
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
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>

                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1 border border-rose-200"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
                  <span className="text-slate-500 font-mono">PIN: {user.pin || '1234'}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 font-bold rounded-lg text-[11px]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROLE PERMISSION MATRIX REFERENCE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" /> System Role Permissions Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-2">
              <span className="font-extrabold text-orange-800 uppercase text-[11px] block">ADMIN ROLE</span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li>✓ Full system configuration</li>
                <li>✓ Store name & branch management</li>
                <li>✓ User creation & role management</li>
                <li>✓ Financial reports & accounts</li>
                <li>✓ Cash session management & voiding</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
              <span className="font-extrabold text-blue-800 uppercase text-[11px] block">MANAGER ROLE</span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li>✓ Store operations & sales</li>
                <li>✓ Purchase order creation</li>
                <li>✓ Vendor management</li>
                <li>✓ Attendance tracking & shifts</li>
                <li>✓ Daily cash shift counter close</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
              <span className="font-extrabold text-emerald-800 uppercase text-[11px] block">CASHIER ROLE</span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li>✓ Quick POS Calculator billing</li>
                <li>✓ Cash & UPI sales entry</li>
                <li>✓ Personal attendance check-in</li>
                <li>✓ View vendor list & inventory</li>
                <li>✗ Restricted from financial settings</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-2">
              <span className="font-extrabold text-purple-800 uppercase text-[11px] block">FINANCE ROLE</span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li>✓ Accounts & bank balances</li>
                <li>✓ Expense approval & payments</li>
                <li>✓ Party supplier payments</li>
                <li>✓ Staff payroll disbursement</li>
                <li>✓ P&L and GST sales reports</li>
              </ul>
            </div>
          </div>
        </div>

        {/* MODAL: ADD NEW USER */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateUser}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-lg">Create System User Account</h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ramesh@zainfootwear.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Security PIN (4 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">System Role *</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value as SystemRole)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="ADMIN">ADMIN (Full Access)</option>
                      <option value="MANAGER">MANAGER (Ops & Staff)</option>
                      <option value="CASHIER">CASHIER (POS Billing)</option>
                      <option value="FINANCE">FINANCE (Accounts & Payroll)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Account Status</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value as 'Active' | 'Inactive')}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Deactivated</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-2xl text-xs shadow-md transition-all mt-2"
              >
                Create Account & Assign Role
              </button>
            </form>
          </div>
        )}

        {/* MODAL: EDIT USER */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Edit User Account & Role</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Assigned System Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as SystemRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="FINANCE">FINANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Security PIN</label>
                  <input
                    type="text"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Deactivated</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveUserEdits}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-extrabold rounded-2xl text-xs shadow-md transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW STORE BRANCH */}
        {isAddShopModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateShop}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Add New Store Branch</h3>
                <button
                  type="button"
                  onClick={() => setIsAddShopModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Store / Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Zain Footwear (Bandra Branch)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Store Code</label>
                    <input
                      type="text"
                      value={newShopCode}
                      onChange={(e) => setNewShopCode(e.target.value)}
                      placeholder="ZAIN-02"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={newShopCity}
                      onChange={(e) => setNewShopCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Store Phone Number</label>
                  <input
                    type="text"
                    value={newShopPhone}
                    onChange={(e) => setNewShopPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    placeholder="Linking Road, Bandra"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#ff6600] hover:bg-orange-600 text-white font-black rounded-2xl text-xs shadow-md transition-all mt-2"
              >
                Save Store Branch
              </button>
            </form>
          </div>
        )}

        {/* MODAL: EDIT STORE DETAILS */}
        {editingShop && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-base">Edit Store Details</h3>
                <button onClick={() => setEditingShop(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Store / Shop Name</label>
                  <input
                    type="text"
                    value={editShopName}
                    onChange={(e) => setEditShopName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Store Code</label>
                    <input
                      type="text"
                      value={editShopCode}
                      onChange={(e) => setEditShopCode(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={editShopCity}
                      onChange={(e) => setEditShopCity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editShopPhone}
                    onChange={(e) => setEditShopPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    value={editShopAddress}
                    onChange={(e) => setEditShopAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">GSTIN Registration Number</label>
                  <input
                    type="text"
                    value={editShopGstin}
                    onChange={(e) => setEditShopGstin(e.target.value)}
                    placeholder="27AAACZ9999F1Z5"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveShopEdits}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-extrabold rounded-2xl text-xs shadow-md transition-all mt-2"
              >
                Save Store Information
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default UserManagementPage;
