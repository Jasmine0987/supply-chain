import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.csv`);
};

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string,
  title: string
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Table
  autoTable(doc, {
    startY: 35,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey])),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
};

export const exportTableData = (
  data: any[],
  format: 'csv' | 'excel' | 'pdf',
  filename: string,
  columns?: { header: string; dataKey: string }[],
  title?: string
) => {
  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename);
      break;
    case 'pdf':
      if (columns && title) {
        exportToPDF(data, columns, filename, title);
      }
      break;
  }
};