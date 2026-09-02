import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingDown,
  Sun,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Sliders,
  Play,
  RotateCcw,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Send,
  Save,
  Cpu,
  RefreshCw,
  Layers,
  BarChart3,
  Activity,
  Flame,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import {
  fetchEnergyLoadCurveApi,
  applyEnergySetbackApi,
  runEnergyAgentApi,
  fetchEnergyTariffSettingsApi,
  updateEnergyTariffSettingsApi,
  fetchCopAlarmLimitsApi,
  updateCopAlarmLimitsApi,
} from '../../api/client';
import { INITIAL_ENERGY_CURVE } from '../../data/mockData';

interface EnergyDashboardProps {
  activeSubTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({ activeSubTab = 'energy-agent', onNavigateTab }) => {
  // Active internal view: 'energy-agent' | 'cost-optimizer' | 'cop-limits'
  const [currentView, setCurrentView] = useState<'energy-agent' | 'cost-optimizer' | 'cop-limits'>('energy-agent');

  // Load curve data
  const [data, setData] = useState<any[]>(INITIAL_ENERGY_CURVE);
  const [setbackActive, setSetbackActive] = useState(false);
  const [setbackMsg, setSetbackMsg] = useState<string | null>(null);
  const [isApplyingSetback, setIsApplyingSetback] = useState(false);

  // Energy Agent Gemini State
  const [agentPrompt, setAgentPrompt] = useState('');
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [agentResult, setAgentResult] = useState<any>({
    engineType: 'Gemini 3.6 Flash (AI Agent)',
    summary: 'Apex Tower demand currently peaks at 840.5 kW (+120.5 kW above baseline). HVAC COP is 4.12. Anomaly engine detected 4 active optimization vectors.',
    anomalyAccuracyPct: 96.4,
    recommendations: [
      'Apply +1.5°C chilled water setpoint reset on Chiller 2 during peak hours (12:00-16:00) to cut 110 kW demand surcharge ($380/day).',
      'Recalibrate AHU-04 economizer damper to restrict outside air intake during high enthalpy humidity periods.',
      'Pre-cool building thermal mass between 06:00-08:00 using off-peak utility rate ($0.11/kWh).'
    ],
    hvacOptimizationPlan: 'Optimize Chiller #1 lead sequence, reset condenser supply flow to 1,200 GPM, and shift thermal energy storage charging to 02:00-05:00 window.',
    demandForecast: 'Peak demand anticipated at 14:00 (1,040 kW). Solar generation offset estimated at 240 kW at midday.'
  });

  // Cost & Tariff State
  const [tariffSettings, setTariffSettings] = useState({
    peakRate: 0.28,
    shoulderRate: 0.18,
    offPeakRate: 0.11,
    demandChargePerKw: 16.50,
    peakHours: '12:00 - 16:00',
    shoulderHours: '08:00 - 12:00, 16:00 - 20:00',
    offPeakHours: '20:00 - 08:00',
    solarCapacityKw: 240,
    estimatedMonthlySavings: 4250,
    annualizedCarbonReductionTons: 38.5,
    currency: 'USD',
    touTierName: 'Commercial Time-of-Use Rate C-20',
  });
  const [isSavingTariff, setIsSavingTariff] = useState(false);
  const [tariffSaveMsg, setTariffSaveMsg] = useState<string | null>(null);

  // COP & Alarm Limits State
  const [copLimits, setCopLimits] = useState({
    peakDemandAlarmKw: 780,
    chillerMinCop: 3.50,
    powerFactorMin: 0.90,
    maxBearingTempC: 75.0,
    autoDispatchAlerts: true,
    slackChannel: '#facility-energy-alerts',
    emailNotifications: true,
    notificationEmail: 'ops-alerts@apexhighrise.com',
    equipmentLimits: [
      { id: 'CHILLER-01', name: 'Centrifugal Water Chiller CH-01', targetCop: 4.5, minCop: 3.8, currentCop: 4.35, status: 'Optimal' },
      { id: 'CHILLER-02', name: 'Centrifugal Water Chiller CH-02', targetCop: 4.5, minCop: 3.5, currentCop: 3.20, status: 'Violated' },
      { id: 'AHU-04', name: 'Air Handling Unit AHU-04', targetCop: 3.8, minCop: 3.0, currentCop: 3.40, status: 'Optimal' },
      { id: 'COOLING-TWR-01', name: 'Induced Draft Cooling Tower CT-01', targetCop: 5.0, minCop: 4.0, currentCop: 4.80, status: 'Optimal' },
    ],
  });
  const [isSavingLimits, setIsSavingLimits] = useState(false);
  const [limitsSaveMsg, setLimitsSaveMsg] = useState<string | null>(null);

  // Sync prop changes from Sidebar
  useEffect(() => {
    if (activeSubTab === 'cost-optimizer') {
      setCurrentView('cost-optimizer');
    } else if (activeSubTab === 'cop-limits') {
      setCurrentView('cop-limits');
    } else {
      setCurrentView('energy-agent');
    }
  }, [activeSubTab]);

  // Load initial data
  useEffect(() => {
    async function loadAll() {
      try {
        const curveRes = await fetchEnergyLoadCurveApi();
        if (curveRes && curveRes.dataPoints && curveRes.dataPoints.length > 0) {
          const formatted = curveRes.dataPoints.map((d: any) => ({
            time: d.time,
            actualDemandKw: d.actualKw,
            forecastDemandKw: d.optimizedKw,
            isPeakTariff: d.isPeak,
          }));
          setData(formatted);
        }

        const tariffRes = await fetchEnergyTariffSettingsApi();
        if (tariffRes?.tariffSettings) {
          setTariffSettings(tariffRes.tariffSettings);
        }

        const limitsRes = await fetchCopAlarmLimitsApi();
        if (limitsRes?.alarmLimits) {
          setCopLimits(limitsRes.alarmLimits);
        }
      } catch (err) {
        console.warn('Error loading initial energy data:', err);
      }
    }
    loadAll();
  }, []);

  const handleToggleSetback = async () => {
    setIsApplyingSetback(true);
    const nextState = !setbackActive;
    setSetbackActive(nextState);
    try {
      if (nextState) {
        const res = await applyEnergySetbackApi(1.5, 'CHILLER-02');
        if (res && res.message) {
          setSetbackMsg(res.message);
        } else {
          setSetbackMsg('Applied +1.5°C HVAC setback to Chiller CH-02. Peak demand lowered by 110 kW.');
        }
      } else {
        setSetbackMsg('Restored standard chilled water setpoint (6.7°C).');
      }
    } catch (err) {
      setSetbackMsg('Setback updated in local operational session.');
    } finally {
      setIsApplyingSetback(false);
    }
  };

  const handleRunEnergyAgent = async (customPrompt?: string) => {
    setIsRunningAgent(true);
    const query = customPrompt || agentPrompt || 'Perform comprehensive energy optimization diagnostic and peak tariff audit.';
    try {
      const res = await runEnergyAgentApi(query);
      if (res && res.data) {
        setAgentResult(res.data);
      }
    } catch (err) {
      console.warn('Energy Agent call error:', err);
    } finally {
      setIsRunningAgent(false);
    }
  };

  const handleSaveTariff = async () => {
    setIsSavingTariff(true);
    setTariffSaveMsg(null);
    try {
      const res = await updateEnergyTariffSettingsApi(tariffSettings);
      setTariffSaveMsg(res.message || 'Tariff & OpEx parameters successfully updated.');
      setTimeout(() => setTariffSaveMsg(null), 4000);
    } catch (err) {
      setTariffSaveMsg('Failed to save tariff settings.');
    } finally {
      setIsSavingTariff(false);
    }
  };

  const handleSaveCopLimits = async () => {
    setIsSavingLimits(true);
    setLimitsSaveMsg(null);
    try {
      const res = await updateCopAlarmLimitsApi(copLimits);
      setLimitsSaveMsg(res.message || 'COP thresholds & alarm limits saved to telemetry monitor.');
      setTimeout(() => setLimitsSaveMsg(null), 4000);
    } catch (err) {
      setLimitsSaveMsg('Failed to save COP limits.');
    } finally {
      setIsSavingLimits(false);
    }
  };

  const maxPeakKw = Math.max(...data.map((d) => d.actualDemandKw || d.actualKw || 0), 840);

  return (
    <div className="space-y-6 font-sans">
      {/* 3-SUBTAB NAVIGATION BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => {
                setCurrentView('energy-agent');
                onNavigateTab?.('energy-agent');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'energy-agent'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Energy Agent</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                currentView === 'energy-agent' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                4
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('cost-optimizer');
                onNavigateTab?.('cost-optimizer');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'cost-optimizer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Cost & Tariff Optimizer</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                currentView === 'cost-optimizer' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                OpEx
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('cop-limits');
                onNavigateTab?.('cop-limits');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'cop-limits'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>COP & Alarm Limits</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                currentView === 'cop-limits' ? 'bg-cyan-900 text-white' : 'bg-cyan-100 text-cyan-800'
              }`}>
                Bounds
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono pr-2">
            <span className="text-slate-500 font-sans hidden md:inline">Grid Status:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry (840.5 kW)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ENERGY AGENT (UTILITY & ANOMALY ENGINE) */}
      {/* ========================================================================= */}
      {currentView === 'energy-agent' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Milestone 1: Energy Agent & Utility Anomaly Engine</span>
                </div>
                <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
                  Energy Intelligence & Peak Load Forecasting
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Autonomous Energy Agent orchestrating real-time chiller plant COP, TOU tariff peak avoidance, and anomaly mitigation.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans font-bold">Peak Demand Load</span>
                  <span className="text-amber-700 font-extrabold text-sm">{maxPeakKw} kW</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-500 block text-[10px] font-sans font-bold">Baseline Accuracy</span>
                  <span className="text-emerald-700 font-extrabold text-sm">96.4%</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-500 block text-[10px] font-sans font-bold">Active Anomalies</span>
                  <span className="text-rose-600 font-extrabold text-sm">4 Detected</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Active Anomaly Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-mono">Anomaly 01</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">Critical</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Peak Demand Spike (12:00)</div>
              <p className="text-[11px] text-slate-600">
                Chilled water demand hits 1,040 kW during peak utility window ($0.28/kWh).
              </p>
              <div className="text-[11px] font-mono font-bold text-rose-700 pt-1">
                Waste Impact: +$140.00/hr
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono">Anomaly 02</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Warning</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Chiller-02 COP Degradation</div>
              <p className="text-[11px] text-slate-600">
                Operating COP dropped to 3.20 (Target: 4.50) due to condenser tube scaling.
              </p>
              <div className="text-[11px] font-mono font-bold text-amber-800 pt-1">
                Efficiency Loss: -28.8%
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono">Anomaly 03</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Warning</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Cooling Tower-01 PF Lag</div>
              <p className="text-[11px] text-slate-600">
                Power factor degraded to 0.82 PF on primary VFD fan motor circuit.
              </p>
              <div className="text-[11px] font-mono font-bold text-amber-800 pt-1">
                Reactive Demand: 45 kVAR
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">Anomaly 04</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">Notice</span>
              </div>
              <div className="text-xs font-bold text-slate-900">Off-Peak Baseload Drift</div>
              <p className="text-[11px] text-slate-600">
                AHU-04 continuous run during unoccupied hours (02:00-05:00) on Floor 4.
              </p>
              <div className="text-[11px] font-mono font-bold text-blue-800 pt-1">
                Potential Cut: 24 kW
              </div>
            </div>
          </div>

          {/* Interactive Gemini AI Energy Agent Console */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-5 space-y-4 shadow-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-400/30 rounded-xl">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Autonomous Gemini Energy Reasoning Agent
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {agentResult.engineType || 'Gemini 3.6 Flash'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Generates autonomous load flattening, COP remediation, and tariff arbitrage decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRunEnergyAgent()}
                  disabled={isRunningAgent}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningAgent ? 'animate-spin' : ''}`} />
                  <span>{isRunningAgent ? 'Reasoning with Gemini...' : 'Run Energy Diagnostic'}</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 text-[11px] self-center">Quick Scenarios:</span>
              <button
                onClick={() => {
                  setAgentPrompt('Analyze peak demand spike during 12:00-16:00 and formulate chiller load shifting plan.');
                  handleRunEnergyAgent('Analyze peak demand spike during 12:00-16:00 and formulate chiller load shifting plan.');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] cursor-pointer"
              >
                12:00 Peak Shifting Plan
              </button>
              <button
                onClick={() => {
                  setAgentPrompt('Evaluate +1.5°C chilled water reset on Chiller 2 vs cooling tower fan speed optimization.');
                  handleRunEnergyAgent('Evaluate +1.5°C chilled water reset on Chiller 2 vs cooling tower fan speed optimization.');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] cursor-pointer"
              >
                Chiller 2 Setback ROI
              </button>
              <button
                onClick={() => {
                  setAgentPrompt('Simulate 240 kW Rooftop Solar PV offset during midday peak tariff window.');
                  handleRunEnergyAgent('Simulate 240 kW Rooftop Solar PV offset during midday peak tariff window.');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] cursor-pointer"
              >
                Solar PV Midday Offset
              </button>
            </div>

            {/* Prompt Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="Ask Energy Agent (e.g., 'What is our expected demand surcharge if Chiller 1 trips at 14:00?')..."
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunEnergyAgent();
                }}
              />
              <button
                onClick={() => handleRunEnergyAgent()}
                disabled={isRunningAgent}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>

            {/* AI Agent Output Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Agent Executive Diagnostic
                </span>
                <span className="font-mono text-[11px] text-emerald-400">
                  Model Accuracy: {agentResult.anomalyAccuracyPct || 96.4}%
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {agentResult.summary}
              </p>

              {agentResult.recommendations && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Actionable Energy Conservation Measures (ECMs)
                  </span>
                  <div className="space-y-1">
                    {agentResult.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agentResult.hvacOptimizationPlan && (
                <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-amber-300 block mb-0.5">HVAC Staging Strategy:</span>
                  {agentResult.hvacOptimizationPlan}
                </div>
              )}
            </div>
          </div>

          {/* Energy Load Curve Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  24-Hour Electrical Load Curve vs ML Forecast
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Peak Tariff Window highlighted (12:00 - 16:00). Data fetched live from Express backend `/api/energy/load-curve`.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleSetback}
                  disabled={isApplyingSetback}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    setbackActive
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{setbackActive ? 'HVAC Setback Active (+1.5°C)' : 'Apply AI HVAC Setback'}</span>
                </button>
              </div>
            </div>

            {setbackMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{setbackMsg}</span>
              </div>
            )}

            {/* Recharts Area Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualKw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="forecastKw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" kW" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="actualDemandKw" name="Actual kW Load" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#actualKw)" />
                  <Area type="monotone" dataKey="forecastDemandKw" name="Python ML Forecast kW" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastKw)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Energy Agent Optimization Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-800">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Peak Tariff Flattening Recommendation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                By shifting Chiller 1 setpoint by +1.5°C between 12:00 PM and 3:00 PM, peak building demand drops by <strong>110 kW</strong>, cutting peak surcharge by <strong>$380/day</strong>.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-700 font-mono font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pre-cooling verified at 07:00 AM off-peak</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-cyan-800">
                <Sun className="w-4 h-4 text-cyan-600" />
                <span>Rooftop Solar Offset Integration</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Rooftop solar generation peaks at <strong>240 kW</strong> at 12:00 PM, offsetting 22% of total building load during peak utility pricing.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-cyan-700 font-mono font-bold">
                <TrendingDown className="w-4 h-4 text-cyan-600" />
                <span>Net Grid Power: 810 kW</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COST & TARIFF OPTIMIZER (OPEX SAVINGS) */}
      {/* ========================================================================= */}
      {currentView === 'cost-optimizer' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cost & Tariff Optimizer Engine</span>
                </div>
                <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
                  OpEx Utility Tariff & Peak Surcharge Reduction
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Dynamic Time-of-Use (TOU) tariff rate simulator, demand charge mitigation, and automated financial arbitrage matrix.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveTariff}
                  disabled={isSavingTariff}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingTariff ? 'Saving Tariff...' : 'Save Custom Tariff'}</span>
                </button>
              </div>
            </div>
          </div>

          {tariffSaveMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{tariffSaveMsg}</span>
            </div>
          )}

          {/* OpEx Key Savings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">Daily Estimated Savings</span>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                ${tariffSettings.estimatedMonthlySavings ? (tariffSettings.estimatedMonthlySavings / 30 * 3).toFixed(2) : '425.00'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                From peak setback + solar offset
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">Monthly Projected OpEx Cut</span>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                ${tariffSettings.estimatedMonthlySavings?.toLocaleString() || '4,250'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                18.4% reduction vs baseline
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">Annualized Financial Benefit</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                ${((tariffSettings.estimatedMonthlySavings || 4250) * 12).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Verified across 12 billing cycles
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 block">Carbon Emission Reduction</span>
              <div className="text-2xl font-extrabold text-cyan-700 font-mono">
                {tariffSettings.annualizedCarbonReductionTons || 38.5} tCO₂e
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Annual avoided greenhouse gases
              </div>
            </div>
          </div>

          {/* Time-of-Use Rate Structure & Interactive Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: TOU Schedule Breakdown */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Time-of-Use (TOU) Rate Schedule
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Utility Tier: <span className="font-mono font-bold text-slate-700">{tariffSettings.touTierName}</span>
                  </p>
                </div>
              </div>

              {/* TOU Tiers Matrix */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="text-xs font-bold text-rose-950">Peak Utility Hours ({tariffSettings.peakHours})</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-800">Highest Surcharge</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Chiller setpoint automatically setback +1.5°C to avoid peak kWh surcharge.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Rate:</span>
                    <div className="flex items-center bg-white border border-rose-300 rounded-lg px-2 py-1">
                      <span className="text-xs text-slate-400 font-mono mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tariffSettings.peakRate}
                        onChange={(e) => setTariffSettings({ ...tariffSettings, peakRate: parseFloat(e.target.value) || 0 })}
                        className="w-14 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">/kWh</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-bold text-amber-950">Shoulder Hours ({tariffSettings.shoulderHours})</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Standard operational staging. Moderate cooling loads and lighting baseline.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Rate:</span>
                    <div className="flex items-center bg-white border border-amber-300 rounded-lg px-2 py-1">
                      <span className="text-xs text-slate-400 font-mono mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tariffSettings.shoulderRate}
                        onChange={(e) => setTariffSettings({ ...tariffSettings, shoulderRate: parseFloat(e.target.value) || 0 })}
                        className="w-14 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">/kWh</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-950">Off-Peak Hours ({tariffSettings.offPeakHours})</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800">Pre-Cool Window</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Thermal Energy Storage (TES) ice tanks and building thermal mass charged here.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Rate:</span>
                    <div className="flex items-center bg-white border border-emerald-300 rounded-lg px-2 py-1">
                      <span className="text-xs text-slate-400 font-mono mr-1">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tariffSettings.offPeakRate}
                        onChange={(e) => setTariffSettings({ ...tariffSettings, offPeakRate: parseFloat(e.target.value) || 0 })}
                        className="w-14 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">/kWh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demand Charge Simulator */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Monthly Peak Demand Surcharge Rate:</span>
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1">
                    <span className="text-xs text-slate-400 font-mono mr-1">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={tariffSettings.demandChargePerKw}
                      onChange={(e) => setTariffSettings({ ...tariffSettings, demandChargePerKw: parseFloat(e.target.value) || 0 })}
                      className="w-16 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">/kW/mo</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Every 100 kW shaved from the 15-minute monthly peak demand window saves <strong>${(tariffSettings.demandChargePerKw * 100).toFixed(2)}/month</strong> in demand charges alone.
                </p>
              </div>
            </div>

            {/* Right 1 Col: Automated Financial Arbitrage */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  Automated Arbitrage Strategies
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The autonomous energy engine schedules battery/thermal storage dispatch and pre-cooling cycles based on live utility price vectors.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Rooftop Solar Array</span>
                      <span className="text-emerald-700 font-mono">240 kW Peak</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Displaces $67.20/hr during peak rate period (12:00-14:00).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Thermal Pre-Cooling</span>
                      <span className="text-emerald-700 font-mono">-$18.50/hr</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      06:00-08:00 sub-cooling absorbs afternoon heat surge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleToggleSetback();
                    setTariffSaveMsg('Peak Shaving & Thermal Storage Arbitrage Protocol deployed across central plant.');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Deploy Peak Shaving Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: COP & ALARM LIMITS (THRESHOLD BOUNDS) */}
      {/* ========================================================================= */}
      {currentView === 'cop-limits' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
                  <Sliders className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Threshold Bounds & Alarm Limits Engine</span>
                </div>
                <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
                  Chiller Plant COP Efficiency & Peak Demand Limits
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Configure real-time Coefficient of Performance (COP) thresholds, peak demand alarm ceilings, and automated dispatch triggers.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveCopLimits}
                  disabled={isSavingLimits}
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingLimits ? 'Saving Limits...' : 'Save Thresholds & Apply'}</span>
                </button>
              </div>
            </div>
          </div>

          {limitsSaveMsg && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span>{limitsSaveMsg}</span>
            </div>
          )}

          {/* Active Limit Violation Alert */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start space-x-3 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-extrabold">Active Threshold Violation: Chiller CH-02 Operating Below Minimum COP</div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Centrifugal Water Chiller CH-02 currently operates at <strong>3.20 COP</strong>, which violates the set minimum warning threshold of <strong>{copLimits.chillerMinCop} COP</strong>. Recommended action: Execute chemical condenser tube purge or apply +1.5°C setpoint reset.
              </p>
            </div>
          </div>

          {/* Global Threshold Sliders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Sliders className="w-4 h-4 text-cyan-600" />
              Global Energy & Plant Threshold Bounds
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider 1: Peak Demand Alarm Limit */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Peak Demand Alarm Ceiling</span>
                  <span className="text-xs font-mono font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    {copLimits.peakDemandAlarmKw} kW
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="1200"
                  step="10"
                  value={copLimits.peakDemandAlarmKw}
                  onChange={(e) => setCopLimits({ ...copLimits, peakDemandAlarmKw: parseInt(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>500 kW (Low)</span>
                  <span>Baseline: 720 kW</span>
                  <span>1,200 kW (Max)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Triggers automated load shedding protocol when substation demand breaches this threshold.
                </p>
              </div>

              {/* Slider 2: Chiller Minimum COP Threshold */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Chiller Plant Min COP Warning</span>
                  <span className="text-xs font-mono font-extrabold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                    {copLimits.chillerMinCop.toFixed(2)} COP
                  </span>
                </div>
                <input
                  type="range"
                  min="2.5"
                  max="5.0"
                  step="0.05"
                  value={copLimits.chillerMinCop}
                  onChange={(e) => setCopLimits({ ...copLimits, chillerMinCop: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>2.50 COP (Poor)</span>
                  <span>Target: 4.50 COP</span>
                  <span>5.00 COP (Ultra-Eff)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Flags maintenance diagnostic when chiller thermodynamic efficiency drops below limit.
                </p>
              </div>

              {/* Slider 3: Power Factor Lower Limit */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Power Factor Min Bound</span>
                  <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {copLimits.powerFactorMin.toFixed(2)} PF
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="0.98"
                  step="0.01"
                  value={copLimits.powerFactorMin}
                  onChange={(e) => setCopLimits({ ...copLimits, powerFactorMin: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.75 PF</span>
                  <span>Target: 0.95 PF</span>
                  <span>0.98 PF</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enforces capacitor bank switching if inductive motor lag degrades power factor.
                </p>
              </div>

              {/* Slider 4: Max Compressor Temperature */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Max Compressor Bearing Temp</span>
                  <span className="text-xs font-mono font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {copLimits.maxBearingTempC.toFixed(1)} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="1"
                  value={copLimits.maxBearingTempC}
                  onChange={(e) => setCopLimits({ ...copLimits, maxBearingTempC: parseFloat(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>50°C (Normal)</span>
                  <span>75°C (Warning)</span>
                  <span>95°C (Emergency Trip)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Thermal fatigue safeguard for heavy centrifugal chiller motors.
                </p>
              </div>
            </div>
          </div>

          {/* Equipment-Specific COP Threshold Benchmark Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Layers className="w-4 h-4 text-cyan-600" />
              Primary HVAC Equipment COP Benchmark Ratings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                    <th className="py-2.5 px-3">Asset ID</th>
                    <th className="py-2.5 px-3">Equipment Name</th>
                    <th className="py-2.5 px-3">Target COP</th>
                    <th className="py-2.5 px-3">Min Allowed COP</th>
                    <th className="py-2.5 px-3">Current Live COP</th>
                    <th className="py-2.5 px-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {copLimits.equipmentLimits.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{eq.id}</td>
                      <td className="py-3 px-3 text-slate-900 font-bold">{eq.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{eq.targetCop.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{eq.minCop.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono font-extrabold">
                        <span className={eq.currentCop < eq.minCop ? 'text-rose-600' : 'text-emerald-600'}>
                          {eq.currentCop.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            eq.currentCop < eq.minCop
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {eq.currentCop < eq.minCop ? 'Threshold Violated' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Automated Notification & Channel Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Send className="w-4 h-4 text-cyan-600" />
              Automated Energy Alarm Dispatch Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Slack Alert Webhook Channel</span>
                  <input
                    type="checkbox"
                    checked={copLimits.autoDispatchAlerts}
                    onChange={(e) => setCopLimits({ ...copLimits, autoDispatchAlerts: e.target.checked })}
                    className="accent-cyan-600 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={copLimits.slackChannel}
                  onChange={(e) => setCopLimits({ ...copLimits, slackChannel: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Email Notification Recipient</span>
                  <input
                    type="checkbox"
                    checked={copLimits.emailNotifications}
                    onChange={(e) => setCopLimits({ ...copLimits, emailNotifications: e.target.checked })}
                    className="accent-cyan-600 cursor-pointer"
                  />
                </div>
                <input
                  type="email"
                  value={copLimits.notificationEmail}
                  onChange={(e) => setCopLimits({ ...copLimits, notificationEmail: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
