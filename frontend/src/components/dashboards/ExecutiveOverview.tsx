import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Wrench, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  Activity,
  CheckCircle2,
  RefreshCw,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TabType, Anomaly } from '../../types';
import { fetchAnomaliesApi, triggerAnomalyScanApi, acknowledgeAnomalyApi, remediateAnomalyApi } from '../../api/client';

interface ExecutiveOverviewProps {
  onSelectTab: (tab: TabType) => void;
  onOpenAiDrawer: () => void;
}

const POWER_TELEMETRY_DATA = [
  { time: '00:00', actualKw: 310, baselineKw: 280, peakThresholdKw: 900 },
  { time: '02:00', actualKw: 290, baselineKw: 270, peakThresholdKw: 900 },
  { time: '04:00', actualKw: 330, baselineKw: 300, peakThresholdKw: 900 },
  { time: '06:00', actualKw: 480, baselineKw: 410, peakThresholdKw: 900 },
  { time: '08:00', actualKw: 720, baselineKw: 650, peakThresholdKw: 900 },
  { time: '10:00', actualKw: 910, baselineKw: 800, peakThresholdKw: 900 },
  { time: '12:00', actualKw: 1120, baselineKw: 850, peakThresholdKw: 900 },
  { time: '14:00', actualKw: 1180, baselineKw: 880, peakThresholdKw: 900 },
  { time: '16:00', actualKw: 990, baselineKw: 820, peakThresholdKw: 900 },
  { time: '18:00', actualKw: 760, baselineKw: 690, peakThresholdKw: 900 },
  { time: '20:00', actualKw: 540, baselineKw: 490, peakThresholdKw: 900 },
  { time: '22:00', actualKw: 390, baselineKw: 350, peakThresholdKw: 900 },
];

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ onSelectTab, onOpenAiDrawer }) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState('IoT Statistical & Physics-Based Anomaly Engine');
  const [totalWastage, setTotalWastage] = useState(91.0);

  const loadAnomalies = async () => {
    try {
      const res = await fetchAnomaliesApi();
      if (res && res.anomalies && res.anomalies.length > 0) {
        setAnomalies(res.anomalies);
        if (res.engine) setEngineSource(res.engine);
        if (res.totalWastageUsdHr !== undefined) setTotalWastage(res.totalWastageUsdHr);
        if (!selectedAnomaly) setSelectedAnomaly(res.anomalies[0]);
      }
    } catch (err) {
      console.warn('Failed to load anomalies:', err);
    }
  };

  useEffect(() => {
    loadAnomalies();
    const interval = setInterval(loadAnomalies, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleScanTelemetry = async () => {
    setIsScanning(true);
    setActionSuccessMsg(null);
    try {
      const res = await triggerAnomalyScanApi();
      if (res && res.anomalies) {
        setAnomalies(res.anomalies);
        if (res.engine) setEngineSource(res.engine);
        if (res.totalWastageUsdHr !== undefined) setTotalWastage(res.totalWastageUsdHr);
        setActionSuccessMsg(`Live telemetry scan completed: ${res.anomalyCount} operational anomalies verified.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAnomalyApi(id);
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a))
    );
    if (selectedAnomaly && selectedAnomaly.id === id) {
      setSelectedAnomaly((prev) => (prev ? { ...prev, status: 'acknowledged' } : null));
    }
    setActionSuccessMsg(`Anomaly ${id} marked as acknowledged.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleRemediate = async (anomaly: Anomaly) => {
    const res = await remediateAnomalyApi(anomaly.id);
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomaly.id ? { ...a, status: 'mitigated' } : a))
    );
    if (selectedAnomaly && selectedAnomaly.id === anomaly.id) {
      setSelectedAnomaly((prev) => (prev ? { ...prev, status: 'mitigated' } : null));
    }
    setActionSuccessMsg(res.message || `Remediation executed for ${anomaly.id}.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const criticalCount = anomalies.filter((a) => a.severity === 'critical' && a.status === 'active').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Facility Main Header & Health Index */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase">
              Corporate Highrise
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-semibold">ID: apex-hq</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-semibold">4,50,000 sq ft</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Apex Tower HQ — Facility Operations Hub
          </h1>

          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-medium">
            Autonomous multi-agent intelligence orchestrating energy optimization, predictive asset health, building security, space utilization, and real-time anomaly detection.
          </p>
        </div>

        {/* Facility Health Index Circle Badge */}
        <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-emerald-500 bg-white text-2xl font-black text-slate-900 font-mono shadow-xs">
            88
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Facility Health Index</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span>Optimal State</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-mono font-semibold">
              Active: {anomalies.filter((a) => a.status === 'active').length} ({criticalCount} Critical)
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono font-bold flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* 3 Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Energy Anomaly Accuracy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs hover:border-amber-400 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500">Energy Anomaly Detection</div>
            <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
              96.4% <span className="text-xs text-amber-600 font-sans font-medium">(Verified Engine)</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Card 2: Predictive Equipment Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs hover:border-emerald-400 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500">Predictive Equipment Health</div>
            <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
              RUL Active <span className="text-xs text-emerald-600 font-sans font-medium">(18 Days Left)</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <Wrench className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Anomaly Wastage Burn Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs hover:border-rose-400 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-500">Active Anomaly OpEx Wastage</div>
            <div className="text-lg font-extrabold text-rose-700 mt-1 font-mono">
              ${totalWastage.toFixed(1)}/hr
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
            <DollarSign className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* 5 Agent Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Agent 1: ENERGY AGENT */}
        <div 
          onClick={() => onSelectTab('energy-agent')}
          className="bg-white border border-slate-200 hover:border-amber-400 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-amber-700">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Energy Agent</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">840 kW</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>COP: 4.1</span>
            <span className="text-amber-700 font-bold">Demand Anomaly</span>
          </div>
        </div>

        {/* Agent 2: MAINTENANCE */}
        <div 
          onClick={() => onSelectTab('predictive-health')}
          className="bg-white border border-slate-200 hover:border-emerald-400 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-emerald-700">
            <div className="flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>Maintenance</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">88%</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>Fleet Health</span>
            <span className="text-emerald-700 font-bold">CH-02 Degraded</span>
          </div>
        </div>

        {/* Agent 3: OCCUPANCY */}
        <div 
          onClick={() => onSelectTab('occupancy-agent')}
          className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-blue-700">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Occupancy & IAQ</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">79%</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>1420 / 1800</span>
            <span className="text-rose-700 font-bold">CO2 Peak</span>
          </div>
        </div>

        {/* Agent 4: SECURITY */}
        <div 
          onClick={() => onSelectTab('security-agent')}
          className="bg-white border border-slate-200 hover:border-purple-400 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-purple-700">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Security</span>
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">SECURE</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>Access Control</span>
            <span className="text-purple-700 font-bold">CCTV Active</span>
          </div>
        </div>

        {/* Agent 5: COST OPTIMIZER */}
        <div 
          onClick={() => onSelectTab('cost-optimizer')}
          className="bg-white border border-slate-200 hover:border-cyan-400 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-cyan-700">
            <div className="flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
              <span>Cost Optimizer</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">$48.2k <span className="text-xs font-sans text-slate-500 font-normal">/mo</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>Energy Spend</span>
            <span className="text-emerald-700 font-bold">-$5.4k Saved</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Box: Real-Time Power Telemetry Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Real-Time Power Demand Telemetry (kW) vs Baseline
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                IoT meter updates recorded hourly with physics-based anomaly threshold detection
              </p>
            </div>

            <button
              onClick={() => onSelectTab('energy-agent')}
              className="text-xs text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Energy Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={POWER_TELEMETRY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="actualKw" name="Live kW Power Demand" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="baselineKw" name="Baseline kW Profile" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBaseline)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">{engineSource}</span>
            </div>
            <div className="text-emerald-700 font-bold">Automated Synchronization to Alerts & AI Recommendations</div>
          </div>
        </div>

        {/* Right Box: Verified Anomaly Detection Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  Detected Anomalies ({anomalies.length})
                </h2>
              </div>
              <button
                onClick={handleScanTelemetry}
                disabled={isScanning}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1 rounded font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Trigger fresh statistical anomaly scan over all telemetry and sensor feeds"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-cyan-600' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Telemetry'}</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {anomalies.map((anom) => {
                const isSelected = selectedAnomaly?.id === anom.id;
                const isCritical = anom.severity === 'critical';
                const isMitigated = anom.status === 'mitigated';

                return (
                  <div
                    key={anom.id}
                    onClick={() => setSelectedAnomaly(anom)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'border-cyan-500 ring-2 ring-cyan-100 bg-cyan-50/30'
                        : isMitigated
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : isCritical
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                        : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold uppercase ${
                            isMitigated
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isMitigated ? 'Resolved' : anom.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{anom.id}</span>
                      </div>
                      <span className="text-[10px] bg-white text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">
                        ${anom.estimatedWastageUsdHr}/hr
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {anom.metric} — {anom.deviceOrEquipment}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                      <span>Value: <strong className={isCritical ? 'text-rose-700' : 'text-amber-800'}>{anom.currentValueDisplay}</strong></span>
                      <span>Baseline: <strong>{anom.expectedBaselineDisplay}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onOpenAiDrawer}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center justify-center space-x-2 mt-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Engage Multi-Agent Diagnostic Hub</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Anomaly Inspection & Remediation Drawer / Panel */}
      {selectedAnomaly && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl border ${
                selectedAnomaly.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    Anomaly Diagnostic Inspector: {selectedAnomaly.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    selectedAnomaly.status === 'mitigated'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : selectedAnomaly.severity === 'critical'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedAnomaly.status === 'mitigated' ? 'Mitigated' : selectedAnomaly.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Verified physics-based threshold condition derived from live telemetry & equipment stores
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedAnomaly.status !== 'acknowledged' && selectedAnomaly.status !== 'mitigated' && (
                <button
                  onClick={() => handleAcknowledge(selectedAnomaly.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-slate-600" />
                  <span>Acknowledge</span>
                </button>
              )}

              {selectedAnomaly.status !== 'mitigated' && (
                <button
                  onClick={() => handleRemediate(selectedAnomaly)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Execute Recommended Action</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Equipment</span>
              <span className="text-xs font-extrabold text-slate-900 block">{selectedAnomaly.deviceOrEquipment}</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: {selectedAnomaly.deviceId}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Monitored Metric</span>
              <span className="text-xs font-extrabold text-slate-900 block">{selectedAnomaly.metric}</span>
              <span className="text-[10px] text-slate-500 font-mono">Category: {selectedAnomaly.category.toUpperCase()}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current vs Baseline</span>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold">
                <span className="text-rose-700">{selectedAnomaly.currentValueDisplay}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700">{selectedAnomaly.expectedBaselineDisplay}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Timestamp: {selectedAnomaly.timestamp}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Financial Impact</span>
              <span className="text-xs font-extrabold text-rose-700 font-mono block">
                ${selectedAnomaly.estimatedWastageUsdHr.toFixed(2)} / hr
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ~${(selectedAnomaly.estimatedWastageUsdHr * 24 * 30).toFixed(0)} / mo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-600" />
                Root Cause Explanation & Engineering Analysis
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedAnomaly.explanation}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1.5">
              <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Prescribed Remediation Action
              </span>
              <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                {selectedAnomaly.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
