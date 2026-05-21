import React from "react";

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  className?: string;
  onRowClick?: (row: any) => void;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  className = "",
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm text-slate-500 font-medium">Loading data…</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200/80 ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${column.width || ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-100 ${
                  onRowClick
                    ? "cursor-pointer hover:bg-primary-50/50 active:bg-primary-50"
                    : "hover:bg-slate-50/50"
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
