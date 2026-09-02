import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  Wrench,
  TrendingUp,
  Building2,
  Bot,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { exportReportApi } from '../../api/client';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'daily',
}) => {
  const [reportType, setReportType] = useState<string>(defaultType);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [timeframe, setTimeframe] = useState<string>('today');
  const [facility, setFacility] = useState<string>('Apex Tower HQ (New York)');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadedFilename, setDownloadedFilename] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setDownloading(true);
    setErrorMsg(null);

    const dateRange =
      timeframe === 'today'
        ? '2026-08-14 (Today)'
        : timeframe === 'week'
        ? 'Last 7 Days'
        : 'Last 30 Days';

    try {
      const res = await exportReportApi({
        type: reportType,
        format,
        facility,
        dateRange,
      });

      if (res.success) {
        if (format === 'pdf') {
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

        setDownloadedFilename(res.filename);
        setDownloaded(true);
        setTimeout(() => {
          setDownloaded(false);
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Failed to export report');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Export failed');
    } finally {
      setDownloading(false);
    }
  };

  const reportTypes = [
    { id: 'daily', name: 'Daily Telemetry & Load Curve', icon: Zap },
    { id: 'weekly', name: 'Weekly Efficiency & COP Review', icon: TrendingUp },
    { id: 'monthly', name: 'Monthly Executive Sustainability Audit', icon: Building2 },
    { id: 'energy', name: 'Energy & Anomaly Diagnostics', icon: Zap },
    { id: 'maintenance', name: 'Predictive Asset Health & ISO 10816', icon: Wrench },
    { id: 'ai-analysis', name: 'AI Multi-Agent Autonomous Audit', icon: Bot },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Generate Facility Operations Report</h2>
              <p className="text-[11px] text-slate-500 font-medium">Verified Operational Telemetry & Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3.5 text-xs">
          {/* Report Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">Report Type:</label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = reportType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setReportType(item.id)}
                    className={`text-left p-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'} shrink-0`} />
                    <span className="truncate">{item.name.split(' ')[0]} {item.name.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selector: PDF vs CSV */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">Export Format:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 font-bold cursor-pointer transition-all ${
                  format === 'pdf'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Executive PDF Document</span>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 font-bold cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Structured CSV Data</span>
              </button>
            </div>
          </div>

          {/* Timeframe & Facility */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="today">Today (Real-Time)</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Target Facility:</label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option>Apex Tower HQ (New York)</option>
                <option>Tech Park Campus B (Austin)</option>
                <option>Innovation Lab Hub (San Francisco)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={downloading || downloaded}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs transition-all text-xs cursor-pointer flex items-center space-x-2"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-cyan-300" />
                <span>{downloading ? `Compiling ${format.toUpperCase()}...` : `Download ${format.toUpperCase()} Report`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
