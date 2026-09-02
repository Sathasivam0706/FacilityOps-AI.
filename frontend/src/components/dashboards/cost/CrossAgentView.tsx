import React, { useState } from 'react';
import {
  GitMerge,
  Zap,
  Wrench,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Cpu,
} from 'lucide-react';
import { CrossAgentIntelligenceData, CrossAgentInsight } from '../../../types';
import { fetchCrossAgentIntelligenceApi } from '../../../api/client';

interface CrossAgentViewProps {
  data: CrossAgentIntelligenceData | null;
  onRefresh: () => void;
}

export const CrossAgentView: React.FC<CrossAgentViewProps> = ({ data, onRefresh }) => {
  const [simulating, setSimulating] = useState(false);
  const [simulatedEvent, setSimulatedEvent] = useState<CrossAgentInsight | null>(null);

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Connecting to Cross-Agent Neural Orchestration Bus...
      </div>
    );
  }

  const { status, engineModel, activeAgentsConnected, insights } = data;

  const handleSimulateCrossAgentEvent = () => {
    setSimulating(true);
    setTimeout(() => {
      const newInsight: CrossAgentInsight = {
        id: `SYNTH-${Math.floor(Math.random() * 9000 + 1000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sourceAgents: ['Occupancy Agent (CNN)', 'Energy Agent (HVAC)', 'Security Agent'],
        triggerEvent: 'Floor 7 Engineering Lab reached 0 occupants during active chill cycle',
        synthesisSummary: 'CNN vision confirmed complete vacancy while 4 VAV boxes were delivering 1,200 CFM. Security system locked door and Energy Agent stepped VAV airflow down to minimum setback.',
        financialImpact: 1350,
        actionTaken: 'Setback setpoint engaged, door magnetic lock engaged, $1,350/mo electricity waste averted.',
        status: 'Automated',
      };
      setSimulatedEvent(newInsight);
      setSimulating(false);
    }, 800);
  };

  const getAgentIcon = (name: string) => {
    if (name.includes('Energy')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (name.includes('Maintenance')) return <Wrench className="w-4 h-4 text-emerald-500" />;
    if (name.includes('Occupancy')) return <Users className="w-4 h-4 text-blue-500" />;
    if (name.includes('Security')) return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    return <Cpu className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-500/20 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
                <GitMerge className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Cross-Agent Orchestration & Intelligence Bus
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Unifying telemetry from Energy (M1), Maintenance (M2), CNN Occupancy (M3), and Security (M3). Agents synthesize joint decisions in real-time, eliminating operational silos.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSimulateCrossAgentEvent}
              disabled={simulating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Multi-Agent Event</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Architecture Flow Map */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs">
          {/* Agent 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-amber-400 font-bold flex items-center justify-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Energy Agent</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">kW, COP, Tariffs</div>
          </div>

          {/* Agent 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-emerald-400 font-bold flex items-center justify-center space-x-1">
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance Agent</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Vibration, RUL, Health</div>
          </div>

          {/* Agent 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-blue-400 font-bold flex items-center justify-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Occupancy Agent</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">CNN Optical Headcount</div>
          </div>

          {/* Agent 4 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-purple-400 font-bold flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security Agent</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Badges, Perimeter, Feeds</div>
          </div>

          {/* Core Synthesis Hub */}
          <div className="bg-indigo-600/30 border border-indigo-400/40 rounded-xl p-3 text-white">
            <div className="text-indigo-200 font-bold flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cost Orchestrator</span>
            </div>
            <div className="text-[10px] text-indigo-300 mt-1">Automated Governance</div>
          </div>
        </div>
      </div>

      {/* Simulated Event Banner */}
      {simulatedEvent && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900 uppercase">
                New Live Multi-Agent Synthesis Event ({simulatedEvent.id})
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              Impact: +${simulatedEvent.financialImpact}/mo
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            {simulatedEvent.synthesisSummary}
          </p>
          <div className="text-xs text-emerald-700 bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Automated Response Dispatched:</strong> {simulatedEvent.actionTaken}</span>
          </div>
        </div>
      )}

      {/* Connected Agents Stream Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeAgentsConnected.map((agent, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {getAgentIcon(agent.name)}
                </div>
                <span className="text-xs font-bold text-slate-900">{agent.name}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-mono text-emerald-600 font-semibold">{agent.status}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Telemetry Ingest:</span>
                <span className="font-mono text-slate-900 font-bold">{agent.telemetryRate}</span>
              </div>
              {agent.anomaliesActive !== undefined && (
                <div className="flex justify-between text-slate-500">
                  <span>Active Anomalies:</span>
                  <span className="font-mono text-amber-600 font-bold">{agent.anomaliesActive}</span>
                </div>
              )}
              {agent.equipmentMonitored !== undefined && (
                <div className="flex justify-between text-slate-500">
                  <span>Equipment Tracked:</span>
                  <span className="font-mono text-slate-900 font-bold">{agent.equipmentMonitored} Assets</span>
                </div>
              )}
              {agent.zonesMonitored !== undefined && (
                <div className="flex justify-between text-slate-500">
                  <span>Zones Monitored:</span>
                  <span className="font-mono text-slate-900 font-bold">{agent.zonesMonitored} Floorplates</span>
                </div>
              )}
              {agent.threatScore !== undefined && (
                <div className="flex justify-between text-slate-500">
                  <span>Threat Index:</span>
                  <span className="font-mono text-emerald-600 font-bold">{agent.threatScore}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Synthesis Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cross-Agent Multi-Pillar Correlated Events
            </h3>
            <p className="text-xs text-slate-500">
              Automated correlations produced by analyzing events across multiple independent operational agents.
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {insights.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.triggerEvent}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-slate-400">{item.timestamp}</span>
                  <span className="font-bold text-emerald-600">+${item.financialImpact.toLocaleString()}/mo Saved</span>
                </div>
              </div>

              {/* Source Agents Badge */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-medium">Correlated Sources:</span>
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {item.sourceAgents.map((src, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                      {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.synthesisSummary}
              </p>

              {/* Action Taken */}
              <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Automated Action:</strong> {item.actionTaken}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
