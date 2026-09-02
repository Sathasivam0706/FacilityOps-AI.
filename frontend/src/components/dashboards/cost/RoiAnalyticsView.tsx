import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  Wrench,
  Layers,
  Calculator,
  ArrowRight,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { RoiAnalyticsData } from '../../../types';

interface RoiAnalyticsViewProps {
  data: RoiAnalyticsData | null;
}

export const RoiAnalyticsView: React.FC<RoiAnalyticsViewProps> = ({ data }) => {
  // Interactive Simulation state
  const [customInvestment, setCustomInvestment] = useState<number>(240000);
  const [customMonthlyEnergy, setCustomMonthlyEnergy] = useState<number>(16000);
  const [customMonthlyMaint, setCustomMonthlyMaint] = useState<number>(9860);
  const [customMonthlyOps, setCustomMonthlyOps] = useState<number>(6330);

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading ROI analytics and financial models...
      </div>
    );
  }

  const {
    investmentCost,
    totalAnnualSavings,
    annualEnergySavings,
    annualMaintenanceSavings,
    annualOperationalSavings,
    roiPct,
    paybackPeriodMonths,
    costAvoidance,
    projections,
    metrics,
  } = data;

  // Recalculated dynamic values from user's interactive adjustments
  const simulatedAnnualSavings = (customMonthlyEnergy + customMonthlyMaint + customMonthlyOps) * 12;
  const simulatedRoiPct = Math.round(((simulatedAnnualSavings - customInvestment) / customInvestment) * 100);
  const simulatedPaybackMonths = Number(((customInvestment / (simulatedAnnualSavings / 12))).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Top Level ROI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Initial Investment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Initial Deployment</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(investmentCost / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-slate-500">
            Hardware, IoT Gateways & AI Licenses
          </div>
        </div>

        {/* Validated Annual Savings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Savings Realized</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ${(totalAnnualSavings / 1000).toFixed(1)}k/yr
          </div>
          <div className="text-xs text-slate-500">
            Validated recurring operational savings
          </div>
        </div>

        {/* Return on Investment % */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Return on Investment</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {roiPct}%
          </div>
          <div className="text-xs text-emerald-600 font-medium">
            First Year Net Yield: +${((totalAnnualSavings - investmentCost) / 1000).toFixed(1)}k
          </div>
        </div>

        {/* Payback Period */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Payback Period</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {paybackPeriodMonths} Months
          </div>
          <div className="text-xs text-slate-500">
            Fully amortized by Month 8
          </div>
        </div>
      </div>

      {/* 3-Year Financial Projections & Cumulative Cash Flow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Cash Flow Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                3-Year Cumulative Cash Flow & Capital Recovery
              </h3>
              <p className="text-xs text-slate-500">
                Tracking initial platform capital expenditure against compounding multi-agent operational savings ($ in Thousands).
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Capex</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Cumulative Savings</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projections.map((p) => ({
                  ...p,
                  investmentK: Math.round(p.cumulativeInvestment / 1000),
                  savingsK: Math.round(p.cumulativeSavings / 1000),
                  netK: Math.round(p.netCashFlow / 1000),
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="capexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} unit="k" />
                <Tooltip
                  formatter={(value: any, name: any) => [`$${value}k`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="investmentK"
                  name="Cumulative Capex"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  fill="url(#capexGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="savingsK"
                  name="Cumulative Savings"
                  stroke="#10b981"
                  fill="url(#savingsGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Stream Attribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Savings by Operational Domain
            </h3>
            <p className="text-xs text-slate-500">
              Annualized distribution of the ${((annualEnergySavings + annualMaintenanceSavings + annualOperationalSavings) / 1000).toFixed(0)}k savings.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Energy Stream */}
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Energy & HVAC Shaving</span>
                </span>
                <span className="font-mono font-bold text-amber-900">
                  ${(annualEnergySavings / 1000).toFixed(0)}k/yr
                </span>
              </div>
              <p className="text-[11px] text-amber-700">
                Chiller pre-cooling, tariff arbitrage, and VAV airflow optimization.
              </p>
            </div>

            {/* Predictive Maintenance Stream */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Predictive Maintenance</span>
                </span>
                <span className="font-mono font-bold text-emerald-900">
                  ${(annualMaintenanceSavings / 1000).toFixed(0)}k/yr
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Avoidance of catastrophic motor burnouts and proactive bearing overhauls.
              </p>
            </div>

            {/* Space & Operations Stream */}
            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Space & Workforce Offset</span>
                </span>
                <span className="font-mono font-bold text-indigo-900">
                  ${(annualOperationalSavings / 1000).toFixed(0)}k/yr
                </span>
              </div>
              <p className="text-[11px] text-indigo-700">
                CNN occupancy zone setbacks and security perimeter patrol automation.
              </p>
            </div>

            {/* Cost Avoidance Extra */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">Unscheduled Outage Avoidance</span>
                <div className="text-[10px] text-slate-500">Business continuity protection</div>
              </div>
              <span className="font-mono font-bold text-slate-900">
                +${(costAvoidance / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive What-If ROI Scenario Simulator */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-500/20 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Calculator className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Interactive Financial Model</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Simulate What-If ROI & Amortization
            </h3>
            <p className="text-xs text-slate-300">
              Adjust investment scope and operational savings sliders to calculate your dynamic payback timeline and yield.
            </p>
          </div>

          {/* Dynamic Result Badges */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-xl p-4 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Simulated ROI</div>
              <div className="text-xl font-black text-indigo-300 font-mono">
                {simulatedRoiPct}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">Payback Period</div>
              <div className="text-xl font-black text-emerald-300 font-mono">
                {simulatedPaybackMonths} Mos
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-300">Annual Benefit</div>
              <div className="text-xl font-black text-amber-300 font-mono">
                ${(simulatedAnnualSavings / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 pt-4 border-t border-white/10 text-xs">
          {/* Capex */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Platform Capex</span>
              <span className="font-mono text-white font-bold">${(customInvestment / 1000).toFixed(0)}k</span>
            </div>
            <input
              type="range"
              min="100000"
              max="500000"
              step="10000"
              value={customInvestment}
              onChange={(e) => setCustomInvestment(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Energy Monthly */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Monthly Energy Savings</span>
              <span className="font-mono text-amber-300 font-bold">${customMonthlyEnergy.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="5000"
              max="40000"
              step="1000"
              value={customMonthlyEnergy}
              onChange={(e) => setCustomMonthlyEnergy(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Maint Monthly */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Monthly Maint Savings</span>
              <span className="font-mono text-emerald-300 font-bold">${customMonthlyMaint.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="3000"
              max="30000"
              step="1000"
              value={customMonthlyMaint}
              onChange={(e) => setCustomMonthlyMaint(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Space & Ops Monthly */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Monthly Ops Savings</span>
              <span className="font-mono text-indigo-300 font-bold">${customMonthlyOps.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={customMonthlyOps}
              onChange={(e) => setCustomMonthlyOps(Number(e.target.value))}
              className="w-full accent-indigo-300 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
