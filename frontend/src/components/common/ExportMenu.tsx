import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import Button from './Button';

interface ExportMenuProps {
  data: any[];
  filename: string;
  columns?: { header: string; dataKey: string }[];
  title?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ data, filename, columns, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    const { exportTableData } = await import('../../utils/export');
    exportTableData(data, format, filename, columns, title);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left rounded-t-lg"
            >
              <File className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">Export as Excel</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left rounded-b-lg"
            >
              <FileText className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-900 dark:text-white">Export as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;