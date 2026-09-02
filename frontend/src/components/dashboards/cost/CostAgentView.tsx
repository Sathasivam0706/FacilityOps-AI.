import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Wrench,
  Users,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Sliders,
  Send,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { CostSavingRecommendationItem, CostOverviewData } from '../../../types';
import { runCostOptimizationAgentApi, applyCostRecommendationApi } from '../../../api/client';

interface CostAgentViewProps {
  overview: CostOverviewData | null;
  recommendations: CostSavingRecommendationItem[];
  onRefresh: () => void;
}

export const CostAgentView: React.FC<CostAgentViewProps> = ({
  overview,
  recommendations,
  onRefresh,
}) => {
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [focusCategory, setFocusCategory] = useState<'all' | 'energy' | 'maintenance' | 'space' | 'operations'>('all');
  const [agentOutput, setAgentOutput] = useState<any>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleRunAgent = async (overridePrompt?: string) => {
    setIsRunning(true);
    setActionSuccessMsg(null);
    try {
      const res = await runCostOptimizationAgentApi({
        facilityName: 'Apex Tower HQ',
        focusCategory,
        userQuery: overridePrompt || query || undefined,
      });
      if (res && res.result) {
        setAgentOutput(res.result);
        onRefresh();
      }
    } catch (err) {
      console.error('Agent run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplyRec = async (recId: string, title: string) => {
    setApplyingId(recId);
    try {
      const res = await applyCostRecommendationApi(recId);
      if (res && res.success) {
        setActionSuccessMsg(`Successfully executed setpoint action for: "${title}"`);
        onRefresh();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const pendingRecs = recommendations.filter((r) => r.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Top Banner / Agent Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-purple-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-2xl text-purple-300">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">Autonomous Cost Optimization Agent</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full">
                  MILESTONE 4
                </span>
                <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ONLINE</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Continuously correlates real-time telemetry from Energy, Maintenance, CNN Occupancy, and Security agents to eliminate operational waste and maximize facility ROI.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Monthly Run Rate</div>
              <div className="text-lg font-bold text-white font-mono">
                ${overview ? (overview.totalMonthlyCost / 1000).toFixed(1) : '375.0'}k
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Validated Savings</div>
              <div className="text-lg font-bold text-emerald-300 font-mono">
                ${overview ? (overview.totalAnnualSavings / 1000).toFixed(1) : '456.9'}k/yr
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300">Cost Reduction</div>
              <div className="text-lg font-bold text-purple-200 font-mono">
                {overview ? overview.costReductionPct : '11.8'}%
              </div>
            </div>
          </div>
        </div>

        {/* 4 Agent Telemetry Streams */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Energy Agent</div>
              <div className="text-[10px] text-amber-300 font-mono">840 kW Demand • COP 4.1</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/5">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Maintenance Agent</div>
              <div className="text-[10px] text-emerald-300 font-mono">Chiller #2 Overhaul Req</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/5">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Occupancy Agent</div>
              <div className="text-[10px] text-blue-300 font-mono">1,046 Active • 71% Load</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/5">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Security Agent</div>
              <div className="text-[10px] text-purple-300 font-mono">Zero Critical Breaches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Interactive Agent Query & Trigger Console */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Prompt Cost Optimization Agent</span>
            </h3>
            <p className="text-xs text-slate-500">
              Query the LLM agent or select a high-impact pre-engineered cost evaluation scenario.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'energy', 'maintenance', 'space', 'operations'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFocusCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize transition-colors cursor-pointer ${
                  focusCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAgent()}
            placeholder="Ask agent: e.g. Analyze evening HVAC setback potential on Floors 5 & 6..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleRunAgent()}
            disabled={isRunning}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Run Agent</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Quick Scenarios:</span>
          <button
            onClick={() => handleRunAgent('Cross-correlate Chiller #2 vibration harmonics with summer energy tariff penalties')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            ⚡ Chiller #2 Preventive ROI
          </button>
          <button
            onClick={() => handleRunAgent('Identify after-hours low occupancy zones and calculate setback savings')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            🌙 Night Setback Analysis
          </button>
          <button
            onClick={() => handleRunAgent('Simulate pre-cooling thermal storage peak demand shaving ($24.50/kW tariff)')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            📉 Peak Demand Shaving
          </button>
          <button
            onClick={() => handleRunAgent('Replace manual manned perimeter patrols with CNN optical vision geofencing')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            👁️ CNN Security Overtime Offset
          </button>
        </div>

        {/* Live Agent Output Panel */}
        {agentOutput && (
          <div className="mt-4 p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Agent Synthesis Results ({agentOutput.engineType})
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-700">
                Efficiency Index: <strong>{agentOutput.efficiencyScore || 89}%</strong>
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {agentOutput.summary}
            </p>

            {agentOutput.crossAgentSynthesis && (
              <div className="bg-white/80 p-3 rounded-lg text-xs text-slate-700 border border-indigo-100">
                <span className="font-bold text-indigo-950">Multi-Agent Correlation: </span>
                {agentOutput.crossAgentSynthesis}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prioritized Recommendations generated by Agent */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Optimization Recommendations ({pendingRecs.length} Actionable)
            </h3>
            <p className="text-xs text-slate-500">
              Generated by cross-referencing all 4 AI agents. Click "Execute Action" to dispatch setpoints or generate maintenance work orders.
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Refresh Recommendations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isCritical = rec.priority === 'Critical';
            const isApplied = rec.status === 'Applied';

            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isApplied
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : isCritical
                    ? 'bg-white border-rose-200 shadow-xs hover:border-rose-300'
                    : 'bg-white border-slate-200 shadow-xs hover:border-indigo-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        rec.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {rec.id}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {rec.relatedAgent}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {rec.title}
                    </h4>
                  </div>

                  {/* Monthly Savings Tag */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-extrabold text-emerald-600">
                      +${rec.estimatedSavings.toLocaleString()}/mo
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ${(rec.annualSavings || rec.estimatedSavings * 12).toLocaleString()}/yr
                    </div>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <span className="font-semibold text-slate-700">Problem Detected: </span>
                  {rec.problem}
                </div>

                {/* Estimated Impact */}
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Estimated Impact: </span>
                  {rec.estimatedImpact}
                </div>

                {/* Suggested Action Bar & Trigger Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                    <span>Confidence: </span>
                    <strong className="text-indigo-600">{rec.confidenceScore}%</strong>
                  </div>

                  {isApplied ? (
                    <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Action Applied</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyRec(rec.id, rec.title)}
                      disabled={applyingId === rec.id}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {applyingId === rec.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
