import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CostAnalyticsData } from '../../../types';

interface OperationalCostViewProps {
  analytics: CostAnalyticsData | null;
}

export const OperationalCostView: React.FC<OperationalCostViewProps> = ({ analytics }) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading operational cost analytics...
      </div>
    );
  }

  const {
    totalMonthlyCost,
    totalAnnualCost,
    totalAnnualSavings,
    costReductionPct,
    budgetUtilizationPct,
    categories,
    departmentCosts,
    monthlyTrends,
  } = analytics;

  // Chart data formatters
  const formattedMonthlyTrends = monthlyTrends.map((t) => ({
    ...t,
    actualK: Math.round(t.actualCost / 1000),
    baselineK: Math.round(t.predictedBaseline / 1000),
    aiOptimizedK: Math.round(t.aiOptimizedCost / 1000),
    savingsK: Math.round(t.savingsGenerated / 1000),
  }));

  const pieData = categories.map((c) => ({
    name: c.category,
    value: c.monthlyCost,
    color: c.color,
  }));

  return (
    <div className="space-y-6">
      {/* Top Analytical KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Monthly Operational Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Monthly Cost</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(totalMonthlyCost / 1000).toFixed(1)}k
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-13.2% vs Q3 Baseline</span>
          </div>
        </div>

        {/* Cost Reduction % */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost Reduction</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {costReductionPct}%
          </div>
          <div className="text-xs text-slate-500">
            Validated AI optimization rate
          </div>
        </div>

        {/* Estimated Annual Savings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Annual Savings</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(totalAnnualSavings / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-slate-500">
            Energy + Predictive Maint + Space
          </div>
        </div>

        {/* Annual Baseline Spend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Run Rate</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(totalAnnualCost / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500">
            Current annualized run projection
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Budget Utilization</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {budgetUtilizationPct}%
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
            <span>On target (Under allocation)</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Monthly Trend vs Baseline + Cost Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Operational Cost Trajectory & AI Forecast
              </h3>
              <p className="text-xs text-slate-500">
                Comparing historical actuals, unoptimized baseline trajectory, and autonomous AI-optimized cost curves ($ in Thousands).
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Baseline</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span>Actual / AI</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedMonthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiCostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} unit="k" domain={[300, 500]} />
                <Tooltip
                  formatter={(value: any, name: any) => [`$${value}k`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="baselineK"
                  name="Unoptimized Baseline"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  fill="url(#baselineGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="actualK"
                  name="AI Optimized Spend"
                  stroke="#4f46e5"
                  fill="url(#aiCostGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>Cost Category Distribution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Total monthly expenditure allocation ($375,000/mo).
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${(value / 1000).toFixed(1)}k`, 'Monthly']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Badges / Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span className="font-medium text-slate-700">{cat.category}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-slate-900">${(cat.monthlyCost / 1000).toFixed(1)}k</span>
                  <span className="text-[10px] text-slate-400 font-normal">({cat.percentageOfTotal}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Cost Breakdown Bar Chart + Detailed Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Cost Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Cost by Facility Department</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monthly cost & identified optimization headroom per operational team ($ in Thousands).
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={departmentCosts.map((d) => ({
                  name: d.department.split(' ')[0] + ' ' + (d.department.split(' ')[1] || ''),
                  monthlyK: Math.round(d.monthlyCost / 1000),
                  opportunityK: Math.round(d.savingsOpportunity / 1000),
                }))}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="k" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }} width={90} />
                <Tooltip
                  formatter={(value: any, name: any) => [`$${value}k`, name === 'monthlyK' ? 'Monthly Spend' : 'Savings Headroom']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="monthlyK" name="Monthly Spend" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                <Bar dataKey="opportunityK" name="Savings Headroom" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Category Subcomponent Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Granular Cost Categories & Sub-Item Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Verified operational ledgers showing savings trends and reduction percentages.
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat.id} className="py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span>{cat.category}</span>
                  </span>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="font-bold text-slate-800">${(cat.monthlyCost / 1000).toFixed(1)}k/mo</span>
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      -{cat.reductionPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pl-4">
                  {cat.subcategories.map((sub, idx) => (
                    <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <div className="truncate text-slate-700 font-medium" title={sub.name}>{sub.name}</div>
                      <div className="font-mono text-slate-900 font-bold">${(sub.cost / 1000).toFixed(1)}k</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
