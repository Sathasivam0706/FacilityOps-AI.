import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Filter,
  CheckCircle2,
  Sparkles,
  Zap,
  Wrench,
  Bot,
  RefreshCw,
  Trash2,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Printer,
  ChevronRight,
  Clock,
  HardDrive
} from 'lucide-react';
import { ReportItem, ReportPreviewData } from '../../types';
import {
  fetchReportsListApi,
  fetchReportPreviewApi,
  exportReportApi,
  deleteReportApi,
} from '../../api/client';

export const ReportsModule: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('daily');
  const [selectedFacility, setSelectedFacility] = useState<string>('Apex Tower HQ (New York)');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-14');

  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(true);
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'preview' | 'history'>('preview');

  // Compute effective dateRange string
  const getEffectiveDateRange = () => {
    if (selectedDatePreset === 'today') return '2026-08-14 (Today)';
    if (selectedDatePreset === 'yesterday') return '2026-08-13 (Yesterday)';
    if (selectedDatePreset === 'week') return '2026-08-07 to 2026-08-14 (Last 7 Days)';
    if (selectedDatePreset === 'month') return '2026-07-15 to 2026-08-14 (Last 30 Days)';
    return `${customStartDate} to ${customEndDate}`;
  };

  const loadPreview = async () => {
    setLoadingPreview(true);
    try {
      const dateRange = getEffectiveDateRange();
      const res = await fetchReportPreviewApi(selectedType, selectedFacility, dateRange);
      if (res.success && res.report) {
        setPreviewData(res.report);
      }
    } catch (err) {
      console.error('Failed to load report preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const loadReportsList = async () => {
    try {
      const res = await fetchReportsListApi();
      if (res.success && res.reports) {
        setReportsList(res.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports list:', err);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [selectedType, selectedFacility, selectedDatePreset, customStartDate, customEndDate]);

  useEffect(() => {
    loadReportsList();
  }, []);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setLoadingExport(true);
    setExportSuccess(null);
    try {
      const dateRange = getEffectiveDateRange();
      const res = await exportReportApi({
        type: selectedType,
        format,
        facility: selectedFacility,
        dateRange,
      });

      if (res.success) {
        // Trigger browser download
        if (format === 'pdf') {
          // Base64 to Blob PDF download
          const byteCharacters = atob(res.content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = res.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // CSV download
          const blob = new Blob([res.content], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = res.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

        setExportSuccess(`Successfully generated and downloaded ${res.filename}`);
        await loadReportsList();
        setTimeout(() => setExportSuccess(null), 5000);
      }
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      setLoadingExport(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this archived report?')) return;
    try {
      await deleteReportApi(id);
      setReportsList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleDownloadSavedReport = (report: ReportItem) => {
    if (report.format === 'pdf') {
      const byteCharacters = atob(report.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([report.content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const reportTypes = [
    { id: 'daily', name: 'Daily Telemetry & Energy', icon: Zap, color: 'text-amber-600', desc: 'Hourly energy demand, equipment runtime, peak kW, and anomalies' },
    { id: 'weekly', name: 'Weekly Efficiency Review', icon: TrendingUp, color: 'text-emerald-600', desc: '7-day load curve, average COP, peak tariff savings, and work orders' },
    { id: 'monthly', name: 'Monthly Executive Audit', icon: Building2, color: 'text-blue-600', desc: 'Total MWh, OpEx savings, carbon footprint (tCO2e), and MTTR' },
    { id: 'energy', name: 'Energy & Anomaly Report', icon: Zap, color: 'text-cyan-600', desc: 'Sub-metered distribution, COP degradation, and active ECMs' },
    { id: 'maintenance', name: 'Predictive Asset Health', icon: Wrench, color: 'text-rose-600', desc: 'ISO 10816 vibration, bearing heat, RUL ranking, and work orders' },
    { id: 'ai-analysis', name: 'AI Multi-Agent Intelligence', icon: Bot, color: 'text-indigo-600', desc: 'Autonomous decisions, model confidence scores, and setback ROI' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Reports & Operational Audits
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Verified Data
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Executive summaries, energy consumption curves, predictive asset reliability, and AI multi-agent audits
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Report Builder & Preview
            </button>
            <button
              onClick={() => setActiveViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeViewMode === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Archived Reports</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700 font-extrabold">
                {reportsList.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {activeViewMode === 'preview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter & Selector Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Category / Type Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  1. Select Report Type
                </span>
                <span className="text-[10px] text-slate-400 font-mono">6 Modules</span>
              </div>

              <div className="space-y-1.5">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-slate-800 text-cyan-400' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>{type.name}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {type.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scope & Date Filter Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  2. Facility & Timeframe
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Facility Selector */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-[11px]">Facility Campus:</label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option>Apex Tower HQ (New York)</option>
                    <option>Tech Park Campus B (Austin)</option>
                    <option>Innovation Lab Hub (San Francisco)</option>
                  </select>
                </div>

                {/* Preset Timeframe Selector */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-[11px]">Timeframe Range:</label>
                  <select
                    value={selectedDatePreset}
                    onChange={(e) => setSelectedDatePreset(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="today">Today (Real-Time Live Telemetry)</option>
                    <option value="yesterday">Yesterday (24-Hour Cycle)</option>
                    <option value="week">Last 7 Days (Weekly Optimization)</option>
                    <option value="month">Last 30 Days (Monthly Executive Billing)</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Custom Date Pickers */}
                {selectedDatePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={loadingExport || loadingPreview}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>{loadingExport ? 'Generating Document...' : 'Export Valid PDF Document'}</span>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  disabled={loadingExport || loadingPreview}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl shadow-2xs transition-all text-xs cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Structured CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Report Render Document (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              {/* Document Header Bar */}
              <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                      Official Operational Audit Document
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {previewData?.title || 'Loading Report...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadPreview}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    title="Refresh Preview Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPreview ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <div className="p-6 space-y-6">
                {loadingPreview ? (
                  <div className="py-16 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-mono">Aggregating telemetry, equipment health scores, and tariff data...</p>
                  </div>
                ) : previewData ? (
                  <>
                    {/* Meta Info Strip */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-2">
                      <div>
                        <span className="text-slate-400 font-bold">FACILITY:</span>{' '}
                        <span className="font-extrabold text-slate-900">{previewData.facility}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">PERIOD:</span>{' '}
                        <span className="font-extrabold text-slate-900">{previewData.dateRange}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">GENERATED:</span>{' '}
                        <span className="font-extrabold text-slate-900">{new Date(previewData.generatedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* KPI Metric Summary Card Grid */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-mono mb-2.5">
                        Executive KPI Summary
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(previewData.summaryStats).map(([key, val]) => (
                          <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </div>
                            <div className="text-base font-extrabold text-slate-900 font-sans">
                              {String(val)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Diagnostic Highlights */}
                    {previewData.aiFindings && previewData.aiFindings.length > 0 && (
                      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                        <div className="flex items-center space-x-2 text-teal-900 font-extrabold text-xs">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          <span>AI Multi-Agent Diagnostic Findings</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 font-medium list-disc list-inside">
                          {previewData.aiFindings.map((finding, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Data Tables */}
                    <div className="space-y-6">
                      {previewData.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-2.5">
                          <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-mono">
                              {section.title}
                            </h3>
                            {section.description && (
                              <p className="text-[11px] text-slate-500 font-medium">{section.description}</p>
                            )}
                          </div>

                          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse font-sans">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold font-mono text-[10px] uppercase tracking-wider">
                                  {section.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="p-2.5 whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {section.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5 whitespace-nowrap font-medium">
                                        {String(cell)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No report data generated.
                  </div>
                )}
              </div>

              {/* Document Sign-off Footer */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>FacilityOps AI Autonomous Certification Protocol</span>
                <span className="text-emerald-600 font-bold">100% Verified Telemetry & Data Integrity</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History View: Archived Reports */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Archived Audit Reports</h2>
              <p className="text-xs text-slate-500 font-medium">Previously generated CSV and PDF facility records</p>
            </div>
            <button
              onClick={loadReportsList}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Archive</span>
            </button>
          </div>

          {reportsList.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No archived reports found. Generate one in the builder!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reportsList.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl border ${report.format === 'pdf' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {report.format === 'pdf' ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-slate-900">{report.title}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          report.format === 'pdf' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {report.format.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Filename: <strong className="text-slate-700">{report.filename}</strong></span>
                        <span>•</span>
                        <span>Facility: <strong>{report.facilityName || 'Apex Tower HQ'}</strong></span>
                        <span>•</span>
                        <span>Generated: <strong>{new Date(report.generatedAt).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Size: <strong>{report.fileSizeKb || 12} KB</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleDownloadSavedReport(report)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
