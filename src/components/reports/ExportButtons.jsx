import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

export default function ExportButtons({ onExportCSV, onExportPDF, loading }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 ml-2" />
          )}
          تصدير التقرير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onExportCSV}>
          <FileSpreadsheet className="h-4 w-4 ml-2" />
          تصدير CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="h-4 w-4 ml-2" />
          تصدير PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Utility functions for export
export const exportToCSV = (data, filename, headers) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h.key] ?? '').join(','))
  ].join('\n');

  // Add BOM for Arabic support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const generatePDFContent = (title, data, summary) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { font-family: 'Cairo', sans-serif; }
        body { padding: 40px; direction: rtl; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; }
        .header h1 { color: #1e3a5f; margin: 0; }
        .header p { color: #64748b; margin-top: 10px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0; color: #64748b; font-size: 14px; }
        .summary-card p { margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #1e3a5f; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: right; }
        th { background: #1e3a5f; color: white; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
      </div>
      ${summary}
      ${data}
      <div class="footer">
        <p>تم إنشاء هذا التقرير بواسطة نظام إدارة العقارات</p>
      </div>
    </body>
    </html>
  `;
};

export const printPDF = (content) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};