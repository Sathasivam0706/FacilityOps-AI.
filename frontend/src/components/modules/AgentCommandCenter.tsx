import React, { useState } from 'react';
import { Bot, Sparkles, Send, Zap, Wrench, Activity, Terminal } from 'lucide-react';
import { queryAiAgentApi } from '../../api/client';

export const AgentCommandCenter: React.FC = () => {
  const [agentType, setAgentType] = useState<'energy' | 'maintenance' | 'general'>('general');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await queryAiAgentApi(prompt, agentType);
      setResponse(res.response || res.message || 'Analysis complete.');
    } catch (err) {
      setResponse('Agent query failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
            <Bot className="w-6 h-6 animate-pulse text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              Autonomous AI Agent Command Center
              <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded font-mono font-bold">
                Gemini 3.6 Flash
              </span>
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Query multi-agent operational reasoning models for Energy Optimization (M1) and Predictive Maintenance (M2).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            Agent Selector & Query
          </h2>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Target Specialized Agent:</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setAgentType('general')}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  agentType === 'general'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>General Facility Agent</span>
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-[10px] opacity-80 mt-1">Whole-facility operations synthesizer</div>
              </button>

              <button
                onClick={() => setAgentType('energy')}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  agentType === 'energy'
                    ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Energy Agent (Milestone 1)</span>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-[10px] opacity-80 mt-1">Load curve & peak tariff optimizer</div>
              </button>

              <button
                onClick={() => setAgentType('maintenance')}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  agentType === 'maintenance'
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Maintenance Agent (Milestone 2)</span>
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="text-[10px] opacity-80 mt-1">Vibration anomaly & RUL work order dispatcher</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleQuery} className="space-y-3 pt-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Enter prompt e.g., Assess Chiller 1 COP drop and estimate cost impact..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
            >
              <Send className="w-4 h-4 text-cyan-300" />
              <span>{loading ? 'Evaluating Model...' : 'Execute Agent Query'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Gemini Agent Diagnostic Response
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                SDK Connected
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-900 font-mono min-h-[220px]">
              {loading ? (
                <div className="flex items-center space-x-2 text-cyan-700 animate-pulse font-bold">
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Processing operational telemetry via Gemini 3.6 Flash...</span>
                </div>
              ) : response ? (
                <div>{response}</div>
              ) : (
                <div className="text-slate-500 italic">
                  Select an agent and execute a query to view real-time AI reasoning output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
