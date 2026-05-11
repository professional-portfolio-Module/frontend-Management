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
      <div className="flex justify-center items-center h-64">
        <div className="space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 shadow-elevation-1 ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3.5 text-left font-semibold text-gray-900 tracking-tight ${column.width || ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="space-y-2">
                  <p className="text-gray-400 text-lg">📋</p>
                  <p className="text-gray-500 font-medium">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`transition-all duration-200 ${
                  onRowClick
                    ? "cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-gray-900">
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
