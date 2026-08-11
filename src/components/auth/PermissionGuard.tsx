import React, { ReactNode } from 'react';
import { useShop } from '../../context/ShopContext';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  requiredPermission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  children,
  fallback,
}) => {
  const { hasPermission } = useShop();

  if (!hasPermission(requiredPermission)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-3 bg-white border border-[#e1e3e5] rounded-xl shadow-2xs my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500">
          Your active staff role does not have permission to view or execute <code>{requiredPermission}</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
