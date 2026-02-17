import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobileLabel?: string;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  keyField = 'id',
}) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {data.map((row) => (
          <div
            key={row[keyField]}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3"
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {column.mobileLabel || column.label}
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};