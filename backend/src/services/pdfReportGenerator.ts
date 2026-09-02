import { jsPDF } from 'jspdf';

export interface ReportGenerationInput {
  title: string;
  reportType: string;
  facility: string;
  dateRange: string;
  generatedAt: string;
  generatedBy?: string;
  summaryStats: Record<string, any>;
  sections: Array<{
    title: string;
    description?: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
  aiFindings?: string[];
}

export function generatePdfReport(data: ReportGenerationInput): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 16;

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(10, y - 6, pageWidth - 20, 26, 'F');

  // Brand and Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FACILITYOPS AI — AUTONOMOUS OPERATIONS REPORT', 15, y + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(`${data.title.toUpperCase()} | FACILITY: ${data.facility.toUpperCase()}`, 15, y + 8);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${data.generatedAt} | Period: ${data.dateRange}`, 15, y + 14);

  y += 28;

  // Executive Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, y, pageWidth - 20, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE OPERATIONS & EFFICIENCY KPI SUMMARY', 15, y + 6);

  // 4 Stats in 4 columns
  const statKeys = Object.keys(data.summaryStats).slice(0, 4);
  const colWidth = (pageWidth - 30) / Math.max(statKeys.length, 1);

  statKeys.forEach((key, index) => {
    const x = 15 + index * colWidth;
    const value = String(data.summaryStats[key]);
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .toUpperCase();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(value, x, y + 23);
  });

  y += 38;

  // AI Autonomous Intelligence Findings (if present)
  if (data.aiFindings && data.aiFindings.length > 0) {
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(204, 251, 241);
    doc.roundedRect(10, y, pageWidth - 20, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text('AI MULTI-AGENT DIAGNOSTIC HIGHLIGHTS', 15, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    data.aiFindings.slice(0, 2).forEach((finding, idx) => {
      doc.text(`* ${finding}`, 15, y + 11 + idx * 5.5);
    });

    y += 28;
  }

  // Render Table Sections
  data.sections.forEach((section) => {
    // Check page break
    if (y + 40 > pageHeight - 20) {
      doc.addPage();
      y = 16;
    }

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(section.title.toUpperCase(), 10, y + 4);
    y += 8;

    if (section.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(section.description, 10, y);
      y += 5;
    }

    // Table Header
    const headers = section.headers;
    const tableWidth = pageWidth - 20;
    const cellWidth = tableWidth / headers.length;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(10, y, tableWidth, 6.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    headers.forEach((h, hIdx) => {
      doc.text(String(h).toUpperCase(), 12 + hIdx * cellWidth, y + 4.5);
    });

    y += 6.5;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    section.rows.forEach((row, rIdx) => {
      if (y + 10 > pageHeight - 20) {
        doc.addPage();
        y = 16;
      }

      const isEven = rIdx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(10, y, tableWidth, 6, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y + 6, 10 + tableWidth, y + 6);

      doc.setTextColor(51, 65, 85);
      row.forEach((cell, cIdx) => {
        const text = String(cell);
        const truncated = text.length > 28 ? text.substring(0, 26) + '...' : text;
        doc.text(truncated, 12 + cIdx * cellWidth, y + 4.2);
      });

      y += 6;
    });

    y += 8;
  });

  // Footer on last page or all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FacilityOps AI Verified Operational Audit • Page ${i} of ${totalPages} • Compliant with ASHRAE & ISO 10816 Standards`,
      10,
      pageHeight - 8
    );
  }

  // Convert array buffer to Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
