import React, { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface IndexTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyText?: string;
  isLoading?: boolean;
}

export function IndexTable<T>({
  data,
  columns,
  keyExtractor,
  emptyText = 'No records found',
  isLoading = false,
}: IndexTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e1e3e5] rounded-xl p-8 text-center text-xs font-semibold text-slate-500 shadow-2xs">
        Loading Footwear records...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#e1e3e5] rounded-xl p-8 text-center text-xs font-semibold text-slate-500 shadow-2xs">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#f6f6f7] text-slate-600 uppercase font-bold border-b border-[#e1e3e5]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className={`p-3 font-bold tracking-wider ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`p-3 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? (row[col.accessorKey] as ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
