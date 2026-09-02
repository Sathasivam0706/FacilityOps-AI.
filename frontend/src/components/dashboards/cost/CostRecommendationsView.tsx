import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { CostSavingRecommendationItem } from '../../../types';
import { applyCostRecommendationApi } from '../../../api/client';

interface CostRecommendationsViewProps {
  recommendations: CostSavingRecommendationItem[];
  onRefresh: () => void;
}

export const CostRecommendationsView: React.FC<CostRecommendationsViewProps> = ({
  recommendations,
  onRefresh,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApply = async (rec: CostSavingRecommendationItem) => {
    setApplyingId(rec.id);
    try {
      const res = await applyCostRecommendationApi(rec.id);
      if (res && res.success) {
        setActionSuccess(`Applied action: "${rec.suggestedAction}"`);
        onRefresh();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error applying recommendation:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = recommendations.filter((r) => {
    if (categoryFilter !== 'all' && r.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (priorityFilter !== 'all' && r.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.problem.toLowerCase().includes(q) ||
        r.relatedAgent.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAvailableMonthly = recommendations
    .filter((r) => r.status === 'Pending')
    .reduce((acc, r) => acc + r.estimatedSavings, 0);

  const totalAppliedMonthly = recommendations
    .filter((r) => r.status === 'Applied')
    .reduce((acc, r) => acc + r.estimatedSavings, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs uppercase font-bold text-slate-400">Actionable Opportunities</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {recommendations.filter((r) => r.status === 'Pending').length} Available
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across 4 operational domains
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs uppercase font-bold text-emerald-600">Pending Monthly Savings</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            +${totalAvailableMonthly.toLocaleString()}/mo
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ${(totalAvailableMonthly * 12).toLocaleString()}/yr unrealized potential
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs uppercase font-bold text-indigo-600">Realized Monthly Savings</div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
            +${totalAppliedMonthly.toLocaleString()}/mo
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Validated by automated setpoints
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search suggestions by title, problem, or agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {['all', 'Pending', 'Applied'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">Category:</span>
            {['all', 'Energy', 'Maintenance', 'Space', 'Operations'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">Priority:</span>
            {['all', 'Critical', 'High', 'Medium', 'Low'].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  priorityFilter === pr
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
            No recommendations match your current filter criteria.
          </div>
        ) : (
          filtered.map((rec) => {
            const isApplied = rec.status === 'Applied';
            const isCritical = rec.priority === 'Critical';

            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isApplied
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : isCritical
                    ? 'bg-white border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        rec.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {rec.id}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full">
                        {rec.relatedAgent}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                        {rec.category}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {rec.title}
                    </h4>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Problem: </span>
                      {rec.problem}
                    </div>

                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Estimated Impact: </span>
                      {rec.estimatedImpact}
                    </div>

                    <div className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/60">
                      <span className="font-bold">Suggested Automated Action: </span>
                      {rec.suggestedAction}
                    </div>
                  </div>

                  {/* Right Side: Financial Returns and Trigger CTA */}
                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-emerald-600">
                        +${rec.estimatedSavings.toLocaleString()}/mo
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        ${rec.annualSavings.toLocaleString()}/yr
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Confidence: <strong>{rec.confidenceScore}%</strong>
                      </div>
                    </div>

                    {isApplied ? (
                      <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(rec)}
                        disabled={applyingId === rec.id}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {applyingId === rec.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Executing...</span>
                          </>
                        ) : (
                          <>
                            <span>Execute Action</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
