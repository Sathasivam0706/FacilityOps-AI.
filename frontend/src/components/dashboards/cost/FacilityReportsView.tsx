import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  RefreshCw,
  Zap,
  Wrench,
  Users,
  ShieldCheck,
  DollarSign,
  Activity,
} from 'lucide-react';
import { FacilityIntelligenceReportData } from '../../../types';
import { generateFacilityReportApi } from '../../../api/client';

export const FacilityReportsView: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [facility, setFacility] = useState('Apex Tower HQ');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FacilityIntelligenceReportData | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await generateFacilityReportApi(period, facility);
      if (res && res.report) {
        setReport(res.report);
      }
    } catch (err) {
      console.error('Error fetching facility report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, facility]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!report) return;
    const csvRows = [
      ['Metric Category', 'Metric Name', 'Value'],
      ['Energy', 'Current Demand (kW)', report.energyPerformance.currentDemandKw],
      ['Energy', 'COP Efficiency', report.energyPerformance.copEfficiency],
      ['Energy', 'Cost Avoidance', report.energyPerformance.costAvoidance],
      ['Maintenance', 'Equipment Monitored', report.maintenanceStatus.totalEquipment],
      ['Maintenance', 'Average RUL (Days)', report.maintenanceStatus.averageRulDays],
      ['Occupancy', 'Active Headcount', report.occupancyInsights.totalOccupants],
      ['Occupancy', 'Capacity %', report.occupancyInsights.capacityPct],
      ['Security', 'Threat Level', report.securityOverview.threatLevel],
      ['Financial', 'Monthly Spend', report.costAnalysis.monthlyRunRate],
      ['Financial', 'Annual Savings Realized', report.costAnalysis.annualSavingsRealized],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.reportId}_FacilityIntelligence.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Facility Intelligence Reports
            </h3>
            <p className="text-xs text-slate-500">
              Automated executive summary compiling all four platform milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  period === p ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-500 font-mono">
          Compiling multi-agent facility report...
        </div>
      )}

      {/* Rendered Professional Document Container */}
      {report && !loading && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 md:p-12 max-w-5xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  ENTERPRISE AUDIT RECORD
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {report.reportId}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {report.title}
              </h1>
              <div className="flex items-center space-x-4 text-xs text-slate-500">
                <span>Facility: <strong>{report.facilityName}</strong></span>
                <span>•</span>
                <span>Frequency: <strong className="capitalize">{report.period}</strong></span>
                <span>•</span>
                <span>Generated: {report.displayDate}</span>
              </div>
            </div>

            {/* Health Score Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">Facility Health</div>
              <div className="text-3xl font-black font-mono text-emerald-600">
                {report.facilityHealthScore.score}
              </div>
              <div className="text-xs font-bold text-emerald-700">
                {report.facilityHealthScore.status}
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>1. Executive Operational Summary</span>
            </h3>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium">
              {report.executiveSummary}
            </div>
          </div>

          {/* Section 2: Four Pillar Operational Performance Matrix */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>2. Multi-Milestone Operational Performance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Energy Pillar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Energy & Demand Optimization (Milestone 1)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Current Demand:</span>
                    <div className="font-mono font-bold text-slate-900">{report.energyPerformance.currentDemandKw} kW</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Chiller COP:</span>
                    <div className="font-mono font-bold text-slate-900">{report.energyPerformance.copEfficiency}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Baseline Demand:</span>
                    <div className="font-mono font-bold text-slate-900">{report.energyPerformance.baselineDemandKw} kW</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Cost Avoidance:</span>
                    <div className="font-mono font-bold text-emerald-600">{report.energyPerformance.costAvoidance}</div>
                  </div>
                </div>
              </div>

              {/* Maintenance Pillar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                  <Wrench className="w-4 h-4" />
                  <span>Predictive Maintenance (Milestone 2)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Total Assets Monitored:</span>
                    <div className="font-mono font-bold text-slate-900">{report.maintenanceStatus.totalEquipment} Units</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Mean Remaining Life:</span>
                    <div className="font-mono font-bold text-slate-900">{report.maintenanceStatus.averageRulDays} Days</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Scheduled Work Orders:</span>
                    <div className="font-mono font-bold text-slate-900">{report.maintenanceStatus.scheduledRepairs} Active</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Key Attention Asset:</span>
                    <div className="font-mono font-bold text-amber-600">{report.maintenanceStatus.criticalAsset}</div>
                  </div>
                </div>
              </div>

              {/* Occupancy Pillar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
                  <Users className="w-4 h-4" />
                  <span>CNN Occupancy & Space Intelligence (Milestone 3)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Current Occupants:</span>
                    <div className="font-mono font-bold text-slate-900">{report.occupancyInsights.totalOccupants} People</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Floorplate Load:</span>
                    <div className="font-mono font-bold text-slate-900">{report.occupancyInsights.capacityPct}% Capacity</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Overcrowded Zones:</span>
                    <div className="font-mono font-bold text-slate-900">{report.occupancyInsights.overcrowdedZonesCount} Detected</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Automated Action:</span>
                    <div className="font-medium text-slate-700">{report.occupancyInsights.primaryAction}</div>
                  </div>
                </div>
              </div>

              {/* Security & Financial Pillar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security & Cost Governance (Milestones 3 & 4)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Threat Assessment:</span>
                    <div className="font-mono font-bold text-emerald-600">{report.securityOverview.threatLevel}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Patrol Hours Offset:</span>
                    <div className="font-mono font-bold text-slate-900">+{report.securityOverview.mannedOvertimeReducedHrs} hrs/mo</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Monthly Spending:</span>
                    <div className="font-mono font-bold text-slate-900">${(report.costAnalysis.monthlyRunRate / 1000).toFixed(1)}k</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Realized Annual Savings:</span>
                    <div className="font-mono font-bold text-emerald-600">${(report.costAnalysis.annualSavingsRealized / 1000).toFixed(1)}k/yr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: High Priority Recommendations Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>3. Top Autonomous AI Recommendations</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Recommendation</th>
                    <th className="p-3">Source Agent</th>
                    <th className="p-3">Monthly Savings</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.topRecommendations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          rec.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{rec.title}</div>
                        <div className="text-[11px] text-slate-500">{rec.suggestedAction}</div>
                      </td>
                      <td className="p-3 font-mono text-indigo-700">{rec.relatedAgent}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+${rec.estimatedSavings.toLocaleString()}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 font-mono">
            <div>Agentic FacilityOps AI Engine • Certified Autonomous Operational Record</div>
            <div>Verification Hash: SHA256-8F29A3...</div>
          </div>
        </div>
      )}
    </div>
  );
};
