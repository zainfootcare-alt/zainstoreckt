import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { IndexTable } from '../../components/common/IndexTable';
import { FilterBar } from '../../components/common/FilterBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { financeService } from '../../services/financeService';
import { Expense } from '../../types/database.types';
import { Plus, Receipt, IndianRupee } from 'lucide-react';

export const ExpensesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    financeService.getExpenses().then(setExpenses);
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !categoryFilter || e.category_name === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <PermissionGuard requiredPermission="finance:view">
      <div className="space-y-6">
        <PageHeader
          title="Footwear Operational Expenses (INR ₹)"
          subtitle="Record store rent, electricity, shoe packaging boxes, staff salaries, and GST utility bills"
          breadcrumbs={[{ label: 'Home', href: '/app/dashboard' }, { label: 'Expenses' }]}
          primaryAction={{
            label: 'Record New Expense (₹)',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => navigate('/app/expenses/new'),
          }}
        />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search expense title or category..."
        />

        <IndexTable
          data={filteredExpenses}
          keyExtractor={(e) => e.id}
          columns={[
            { header: 'Date', accessorKey: 'business_date', width: '120px' },
            { header: 'Expense Title', accessorKey: 'title' },
            { header: 'Category', accessorKey: 'category_name' },
            { header: 'Payment Method', accessorKey: 'payment_method' },
            {
              header: 'Amount (₹)',
              align: 'right',
              cell: (r) => <span className="font-bold font-mono text-rose-600 text-sm">₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
            },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </div>
    </PermissionGuard>
  );
};
