import React, { useState } from 'react';
import {
  Wallet,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { BudgetMonitoringData, BudgetDepartmentItem } from '../../../types';

interface BudgetMonitoringViewProps {
  data: BudgetMonitoringData | null;
}

export const BudgetMonitoringView: React.FC<BudgetMonitoringViewProps> = ({ data }) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NORMAL' | 'WARNING' | 'CRITICAL'>('ALL');
  const [search, setSearch] = useState('');

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading budget and spending monitoring...
      </div>
    );
  }

  const {
    totalBudget,
    currentSpending,
    remainingBudget,
    utilizationPct,
    forecastEndYear,
    varianceToBudget,
    overallStatus,
    departments,
    summary,
  } = data;

  const filteredDepts = departments.filter((dept) => {
    if (statusFilter !== 'ALL' && dept.status !== statusFilter) return false;
    if (search && !dept.department.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: BudgetDepartmentItem['status']) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 rounded-full uppercase tracking-wider">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>CRITICAL</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>WARNING</span>
          </span>
        );
      case 'NORMAL':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>NORMAL</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Level Budget Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Facility Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Annual Budget</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(totalBudget / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500">
            Fiscal Year 2026 Allocation
          </div>
        </div>

        {/* Current Year-to-Date Spend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Current YTD Spend</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(currentSpending / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {utilizationPct}% utilized
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining Buffer</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ${(remainingBudget / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500">
            Available for Q4 operations
          </div>
        </div>

        {/* Year-End Forecast */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Year-End Forecast</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(forecastEndYear / 1000000).toFixed(2)}M
          </div>
          <div className={`text-xs font-medium flex items-center space-x-1 ${varianceToBudget >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            <span>Variance: +${(varianceToBudget / 1000).toFixed(1)}k (+0.2%)</span>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Health Status</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 text-sm font-black rounded-lg uppercase font-mono ${
              overallStatus === 'NORMAL'
                ? 'bg-emerald-100 text-emerald-800'
                : overallStatus === 'WARNING'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {overallStatus}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {summary.criticalCount} Critical • {summary.warningCount} Warning • {summary.normalCount} Normal
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-56"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Alert Level:</span>
          {(['ALL', 'NORMAL', 'WARNING', 'CRITICAL'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setStatusFilter(lvl)}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === lvl
                  ? lvl === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : lvl === 'WARNING'
                    ? 'bg-amber-500 text-white'
                    : lvl === 'NORMAL'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Department Budget Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Department Budget Allocation & Variance Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring with automated status alerts based on monthly run rates and projected year-end variances.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Department</th>
                <th className="px-4 py-3">Total Budget</th>
                <th className="px-4 py-3">Current Spend</th>
                <th className="px-4 py-3">Utilization</th>
                <th className="px-4 py-3">Monthly Run Rate</th>
                <th className="px-4 py-3">Year-End Forecast</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3">Operational Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepts.map((dept) => {
                const isOverBudget = dept.varianceAmt > 0;
                const isCritical = dept.status === 'CRITICAL';
                const isWarning = dept.status === 'WARNING';

                return (
                  <tr
                    key={dept.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isCritical ? 'bg-rose-50/30' : isWarning ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div>{dept.department}</div>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">ID: {dept.id}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-medium">
                      ${(dept.totalBudget / 1000).toLocaleString()}k
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-bold">
                      ${(dept.currentSpending / 1000).toLocaleString()}k
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-[11px] font-mono font-bold">
                          <span className={dept.utilizationPct > 85 ? 'text-amber-600' : 'text-slate-700'}>
                            {dept.utilizationPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              dept.utilizationPct > 85
                                ? 'bg-rose-500'
                                : dept.utilizationPct > 75
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(dept.utilizationPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      ${(dept.monthlyRunRate / 1000).toFixed(1)}k/mo
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-bold">
                      ${(dept.forecastEndYear / 1000).toLocaleString()}k
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isOverBudget ? `+$${(dept.varianceAmt / 1000).toFixed(1)}k` : `-$${(Math.abs(dept.varianceAmt) / 1000).toFixed(1)}k`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(dept.status)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs text-[11px]">
                      {dept.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
