import React from 'react';
import {
  ShieldCheck,
  Zap,
  Wrench,
  Users,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  PieChart as PieIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExecutiveDashboardData } from '../../../types';

interface ExecutiveDashboardViewProps {
  data: ExecutiveDashboardData | null;
  onNavigateToTab?: (tab: string) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  data,
  onNavigateToTab,
}) => {
  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading Executive C-Suite Dashboard...
      </div>
    );
  }

  const { facilityName, reportingPeriod, facilityHealth, kpis, costDistribution, topAiRecommendations, activeAnomalies, savingsOpportunities } = data;

  return (
    <div className="space-y-6">
      {/* C-Suite Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-500/20 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full">
                EXECUTIVE INTELLIGENCE HUB
              </span>
              <span className="text-xs text-slate-400 font-mono">{reportingPeriod}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              {facilityName} • Autonomous Operational Governance
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Cross-pillar executive overview synthesizing Energy (M1), Predictive Maintenance (M2), CNN Occupancy & Security (M3), and Cost Optimization (M4).
            </p>
          </div>

          {/* Unified Facility Health Score Big Badge */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-4 shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center">
                <span className="text-2xl font-black font-mono text-emerald-300">
                  {facilityHealth.score}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Facility Health Score</div>
              <div className="text-base font-bold text-emerald-400">{facilityHealth.status}</div>
              <div className="text-[10px] text-slate-400 font-mono">Weighted across 5 operational pillars</div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Primary Executive KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Cost Reduction */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Cost Reduction</div>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1">{kpis.costReductionPct}%</div>
          <div className="text-[10px] text-emerald-600 font-medium">M4 Active</div>
        </div>

        {/* ROI Generated */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">ROI Generated</div>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">{kpis.roiGeneratedPct}%</div>
          <div className="text-[10px] text-slate-500">7.4 Mo Payback</div>
        </div>

        {/* Health Score */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Health Index</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{kpis.facilityHealthScore}/100</div>
          <div className="text-[10px] text-emerald-600 font-medium">Top Quartile</div>
        </div>

        {/* Energy Demand */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Energy Demand</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{kpis.totalMonthlyEnergyKw} kW</div>
          <div className="text-[10px] text-slate-500 font-mono">COP 4.10 (M1)</div>
        </div>

        {/* Equipment Health */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Equip. Health</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{kpis.equipmentHealthAvg}%</div>
          <div className="text-[10px] text-slate-500">0 Outages (M2)</div>
        </div>

        {/* Security Threat */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Security Index</div>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">Normal</div>
          <div className="text-[10px] text-slate-500 font-mono">0 Breaches (M3)</div>
        </div>

        {/* Occupancy Efficiency */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Occupancy Load</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">{kpis.occupancyEfficiencyPct}%</div>
          <div className="text-[10px] text-slate-500">CNN Headcount (M3)</div>
        </div>

        {/* Opportunities */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Savings Pipeline</div>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">${(savingsOpportunities.annualTotalProjection / 1000).toFixed(0)}k</div>
          <div className="text-[10px] text-slate-500 font-mono">Annualized</div>
        </div>
      </div>

      {/* 5-Pillar Facility Health Score Breakdown Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Facility Health Score — 5-Pillar Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated based on Energy, Predictive Maintenance, Space Occupancy, Perimeter Security, and Financial Governance.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Updated every 60 seconds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {facilityHealth.breakdown.map((item, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{item.category}</span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.weightPct}% Wt</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-slate-900">{item.score}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-600">{item.status}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Section: Top AI Recommendations + Active Multi-Agent Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top AI Recommendations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Prioritized Cross-Agent Actions</span>
            </h3>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              +${(savingsOpportunities.immediateAvailableMonthly / 1000).toFixed(1)}k/mo Available
            </span>
          </div>

          <div className="space-y-3">
            {topAiRecommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {rec.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    +${rec.estimatedSavings.toLocaleString()}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-600">{rec.suggestedAction}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Source: {rec.relatedAgent}</span>
                  <span>Confidence: {rec.confidenceScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Multi-Agent Anomalies */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Multi-Agent Live Incident Ledger</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {activeAnomalies.length} Active Items
            </span>
          </div>

          <div className="space-y-3">
            {activeAnomalies.map((anom, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{anom.title}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                      {anom.agent}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{anom.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
