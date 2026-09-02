import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock,
  ArrowRight,
  RefreshCw,
  Building,
  Cpu,
  Zap,
  Briefcase,
} from 'lucide-react';
import { ResourceUtilizationData, ResourceItem } from '../../../types';

interface ResourceUtilizationViewProps {
  data: ResourceUtilizationData | null;
  onRefresh: () => void;
}

export const ResourceUtilizationView: React.FC<ResourceUtilizationViewProps> = ({
  data,
  onRefresh,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading resource utilization telemetry...
      </div>
    );
  }

  const { resources, summary } = data;

  const handleExecuteAction = (item: ResourceItem) => {
    setExecutingId(item.id);
    setTimeout(() => {
      setExecutingId(null);
      setActionSuccess(`Dispatched optimization: "${item.actionableStep}" for ${item.name}`);
      setTimeout(() => setActionSuccess(null), 4000);
    }, 600);
  };

  const filteredResources = resources.filter((r) => {
    if (filterCategory !== 'all' && r.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    if (filterStatus !== 'all' && r.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: ResourceItem['status']) => {
    switch (status) {
      case 'Underutilized':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Overutilized':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Wasted':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Optimal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: ResourceItem['category']) => {
    switch (category) {
      case 'Energy':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Equipment':
        return <Cpu className="w-4 h-4 text-indigo-500" />;
      case 'Workspace':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'Operational':
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top High-Level Resource Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Average Utilization */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Utilization</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {summary.averageUtilizationPct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Across {summary.totalResourcesTracked} tracked assets
          </div>
        </div>

        {/* Monthly Waste Cost */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Monthly Waste</div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            ${(summary.totalMonthlyWasteCost / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Unused HVAC & idle zones
          </div>
        </div>

        {/* Potential Monthly Savings */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Potential Savings</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            +${(summary.totalPotentialSavings / 1000).toFixed(1)}k/mo
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Recoverable via AI actions
          </div>
        </div>

        {/* Underutilized Assets */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Underutilized</div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {summary.underutilizedCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Running &lt;40% capacity
          </div>
        </div>

        {/* Overutilized Assets */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Overutilized</div>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">
            {summary.overutilizedCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Operating &gt;90% threshold
          </div>
        </div>

        {/* Annual Avoidance */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Annual Avoidance</div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
            ${(summary.annualWasteAvoidance / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Annualized efficiency target
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          {['all', 'energy', 'equipment', 'workspace', 'operational'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize cursor-pointer transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          {['all', 'underutilized', 'optimal', 'overutilized', 'wasted'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Utilization Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((item) => {
          const isUnder = item.status === 'Underutilized';
          const isOver = item.status === 'Overutilized';
          const isWasted = item.status === 'Wasted';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.id} • {item.category}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Utilization:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.currentUsage} / {item.capacity} {item.unit} ({item.utilizationPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isWasted
                          ? 'bg-rose-500'
                          : isUnder
                          ? 'bg-amber-500'
                          : isOver
                          ? 'bg-purple-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(item.utilizationPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Waste Cost vs Estimated Savings */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Monthly Waste</div>
                    <div className="font-mono font-bold text-rose-600">
                      ${item.monthlyWasteCost.toLocaleString()}/mo
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Savings Impact</div>
                    <div className="font-mono font-bold text-emerald-600">
                      +${item.estimatedSavings.toLocaleString()}/mo
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="text-xs text-slate-600 bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100/50">
                  <span className="font-bold text-indigo-900">AI Strategy: </span>
                  {item.recommendation}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 truncate mr-2" title={item.actionableStep}>
                  {item.actionableStep}
                </div>
                <button
                  onClick={() => handleExecuteAction(item)}
                  disabled={executingId === item.id}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
                >
                  {executingId === item.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Apply</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
