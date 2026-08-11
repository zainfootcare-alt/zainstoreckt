import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { IndexTable } from '../../components/common/IndexTable';
import { FilterBar } from '../../components/common/FilterBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { inventoryService } from '../../services/inventoryService';
import { Product } from '../../types/database.types';
import { Plus, Footprints } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    inventoryService.getProducts().then(setProducts);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <PermissionGuard requiredPermission="inventory:view">
      <div className="space-y-6">
        <PageHeader
          title="Footwear Products & Sizes Catalog"
          subtitle="Manage formal shoes, sneakers, boots, loafers, UK/IND sizes (6-11), and supplier costs (INR ₹)"
          breadcrumbs={[
            { label: 'Home', href: '/app/dashboard' },
            { label: 'Inventory', href: '/app/inventory/products' },
            { label: 'Footwear Products' },
          ]}
          primaryAction={{
            label: 'Add Footwear Product',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => alert('Add Footwear Product Wizard'),
          }}
        />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by shoe name, SKU, or brand..."
          filters={[
            {
              key: 'category',
              label: 'Category',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: 'Formal Shoes', value: 'Formal Shoes' },
                { label: 'Sports & Running Shoes', value: 'Sports & Running Shoes' },
                { label: 'Sneakers & Casuals', value: 'Sneakers & Casuals' },
                { label: 'Boots & Leather', value: 'Boots & Leather' },
                { label: 'Accessories & Care', value: 'Accessories & Care' },
              ],
            },
          ]}
        />

        <IndexTable
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          columns={[
            { header: 'SKU', accessorKey: 'sku', width: '130px' },
            { header: 'Footwear Product Name', accessorKey: 'name' },
            { header: 'Category', accessorKey: 'category' },
            {
              header: 'Size (UK/IND)',
              cell: (r) => (
                <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-xs">
                  {r.size_uk_ind}
                </span>
              ),
            },
            { header: 'Reorder Level', accessorKey: 'reorder_level', align: 'center' },
            {
              header: 'Available Stock',
              align: 'center',
              cell: (r) => (
                <span
                  className={`font-bold ${
                    (r.on_hand || 0) <= r.reorder_level ? 'text-rose-600 font-mono' : 'text-slate-900 font-mono'
                  }`}
                >
                  {r.on_hand} pairs ({r.available} avail)
                </span>
              ),
            },
            { header: 'Cost Price (₹)', align: 'right', cell: (r) => <span>₹{r.cost_price.toFixed(2)}</span> },
            { header: 'M.R.P / Sale Price (₹)', align: 'right', cell: (r) => <span className="font-bold text-[#008060]">₹{r.sale_price.toFixed(2)}</span> },
          ]}
        />
      </div>
    </PermissionGuard>
  );
};
