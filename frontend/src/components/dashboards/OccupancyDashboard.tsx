import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  Building2,
  MapPin,
  Compass,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Wind,
  Plus,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Sliders,
  Cpu,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  fetchOccupancyZonesApi,
  fetchOccupancySummaryApi,
  fetchOccupancyTrendsApi,
  addOccupancyZoneApi,
  adjustZoneVentilationApi,
  runOccupancyAgentApi,
} from '../../api/client';
import { OccupancyZoneItem, OccupancySummary, OccupancyTrendData } from '../../types';
import { CnnVisionModule } from './CnnVisionModule';

interface OccupancyDashboardProps {
  activeSubTab?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const OccupancyDashboard: React.FC<OccupancyDashboardProps> = ({ activeSubTab, onNavigateToTab }) => {
  const [internalTab, setInternalTab] = useState<string>(activeSubTab || 'space-overview');
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [zones, setZones] = useState<OccupancyZoneItem[]>([]);
  const [summary, setSummary] = useState<OccupancySummary | null>(null);
  const [trends, setTrends] = useState<OccupancyTrendData[]>([]);
  const [portfolioSites, setPortfolioSites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync internalTab when activeSubTab changes
  useEffect(() => {
    if (activeSubTab) {
      setInternalTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Ventilation action state
  const [adjustingZoneId, setAdjustingZoneId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Agent AI State
  const [agentAnalysis, setAgentAnalysis] = useState<any>(null);
  const [agentPrompt, setAgentPrompt] = useState<string>('');
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);

  // Add Zone Modal State
  const [isAddZoneOpen, setIsAddZoneOpen] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneFloor, setNewZoneFloor] = useState<number>(2);
  const [newZoneCapacity, setNewZoneCapacity] = useState<number>(80);
  const [newZoneOccupancy, setNewZoneOccupancy] = useState<number>(45);
  const [newZoneCo2, setNewZoneCo2] = useState<number>(580);
  const [newZoneTemp, setNewZoneTemp] = useState<number>(22.5);

  const loadData = async () => {
    setLoading(true);
    try {
      const [zonesRes, summaryRes, trendsRes] = await Promise.all([
        fetchOccupancyZonesApi(),
        fetchOccupancySummaryApi(),
        fetchOccupancyTrendsApi(),
      ]);

      if (zonesRes && zonesRes.zones) {
        setZones(zonesRes.zones);
        if (zonesRes.portfolioSites) {
          setPortfolioSites(zonesRes.portfolioSites);
        }
      }
      if (summaryRes && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (trendsRes && trendsRes.data) {
        setTrends(trendsRes.data);
      }
    } catch (err) {
      console.warn('Occupancy telemetry fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVentilationAdjust = async (zoneId: string, airflowBoost: number = 25) => {
    setAdjustingZoneId(zoneId);
    setActionSuccessMsg(null);
    try {
      const res = await adjustZoneVentilationApi(zoneId, 650);
      if (res && res.success) {
        setActionSuccessMsg(`Ventilation boost (+${airflowBoost}%) applied. CO2 target calibrated to 650 PPM.`);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjustingZoneId(null);
    }
  };

  const handleRunOccupancyAgent = async () => {
    setIsAgentRunning(true);
    try {
      const res = await runOccupancyAgentApi(agentPrompt || undefined);
      if (res && res.data) {
        setAgentAnalysis(res.data);
      }
    } catch (err) {
      console.error('Occupancy agent run error:', err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZoneCapacity) return;

    try {
      const res = await addOccupancyZoneApi({
        name: newZoneName,
        floor: newZoneFloor,
        maxCapacity: newZoneCapacity,
        capacity: newZoneCapacity,
        currentOccupancy: newZoneOccupancy,
        occupantCount: newZoneOccupancy,
        co2Ppm: newZoneCo2,
        tempC: newZoneTemp,
        humidityPct: 48,
        status: newZoneOccupancy > newZoneCapacity ? 'Overcrowded' : newZoneOccupancy >= newZoneCapacity * 0.85 ? 'High' : 'Normal',
      });

      if (res && res.success) {
        setActionSuccessMsg(`Zone "${newZoneName}" added successfully.`);
        setIsAddZoneOpen(false);
        setNewZoneName('');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // SUB-NAV BAR HELPER
  // ----------------------------------------------------
  const renderSubNavBar = () => (
    <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
      <button
        onClick={() => {
          setInternalTab('space-overview');
          onNavigateToTab?.('occupancy-agent');
        }}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
          internalTab === 'space-overview' || internalTab === 'occupancy-agent' || internalTab === 'occupancy'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        <span>Space & Overcrowding</span>
      </button>

      <button
        onClick={() => {
          setInternalTab('cnn-vision');
          onNavigateToTab?.('cnn-vision');
        }}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
          internalTab === 'cnn-vision' || internalTab === 'cnn-occupancy'
            ? 'bg-indigo-700 text-white shadow-xs ring-2 ring-indigo-400/30'
            : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 text-indigo-500" />
        <span>CNN Optical Vision</span>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-extrabold uppercase">
          Deep ML
        </span>
      </button>

      <button
        onClick={() => {
          setInternalTab('occupancy-analytics');
          onNavigateToTab?.('occupancy-analytics');
        }}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
          internalTab === 'occupancy-analytics' || internalTab === 'overcrowding-detection'
            ? 'bg-sky-700 text-white shadow-xs'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Activity className="w-3.5 h-3.5" />
        <span>Occupancy Analytics</span>
      </button>

      <button
        onClick={() => {
          setInternalTab('interactive-floorplan');
          onNavigateToTab?.('interactive-floorplan');
        }}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
          internalTab === 'interactive-floorplan'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span>Floorplan & Heatmap</span>
      </button>

      <button
        onClick={() => {
          setInternalTab('multi-site');
          onNavigateToTab?.('multi-site');
        }}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
          internalTab === 'multi-site'
            ? 'bg-emerald-700 text-white shadow-xs'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Multi-Site Portfolio</span>
      </button>
    </div>
  );

  // ----------------------------------------------------
  // SUBTAB: CNN CONVOLUTIONAL NEURAL NETWORK VISION
  // ----------------------------------------------------
  if (internalTab === 'cnn-vision' || internalTab === 'cnn-occupancy') {
    return (
      <div className="space-y-6 font-sans">
        {renderSubNavBar()}
        <CnnVisionModule onNavigateToTab={onNavigateToTab} />
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBTAB: OCCUPANCY ANALYTICS & TRENDS
  // ----------------------------------------------------
  if (internalTab === 'occupancy-analytics' || internalTab === 'overcrowding-detection') {
    return (
      <div className="space-y-6 font-sans">
        {renderSubNavBar()}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>Space Dynamics Analytics</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 mt-1">Occupancy Trends & Peak Density Curves</h1>
            <p className="text-xs text-slate-600 font-medium">Hourly space utilization profiles, peak load forecasting, and air quality correlations.</p>
          </div>

          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Occupancy vs Forecast */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Diurnal Occupancy vs Forecast Curve</h3>
                <span className="text-xs text-slate-500 font-mono">Actual Headcount vs AI Forecast (Headcount / Hour)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">PEAK: 12:00 - 14:00</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.length > 0 ? trends : [
                  { time: '08:00', occupancy: 320, forecast: 340, capacity: 1475 },
                  { time: '10:00', occupancy: 890, forecast: 850, capacity: 1475 },
                  { time: '12:00', occupancy: 1205, forecast: 1180, capacity: 1475 },
                  { time: '14:00', occupancy: 1046, forecast: 1080, capacity: 1475 },
                  { time: '16:00', occupancy: 780, forecast: 790, capacity: 1475 },
                  { time: '18:00', occupancy: 210, forecast: 230, capacity: 1475 },
                  { time: '20:00', occupancy: 85, forecast: 90, capacity: 1475 },
                ]}>
                  <defs>
                    <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="occupancy" name="Actual Occupancy" stroke="#0284c7" fillOpacity={1} fill="url(#occGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="forecast" name="AI Forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Density Utilization Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Zone Utilization & Density Breakdown</h3>
                <span className="text-xs text-slate-500 font-mono">% Capacity Utilized per Key Zone</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">1 OVERCROWDED</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={zones.map((z) => ({
                    name: z.name.replace('Floor', 'Fl').replace('Conference', 'Conf').substring(0, 16),
                    utilization: z.occupancyPercentage || Math.round(((z.currentOccupancy || z.occupantCount) / (z.capacity || z.maxCapacity)) * 100),
                  }))}
                  layout="vertical"
                >
                  <XAxis type="number" domain={[0, 120]} fontSize={11} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" width={110} fontSize={10} stroke="#64748b" />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar
                    dataKey="utilization"
                    name="% Capacity"
                    fill="#0284c7"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Spatial Efficiency Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Most Density-Constrained Zone</span>
            <div className="text-base font-extrabold text-rose-600">Conference Hall A (108%)</div>
            <div className="text-[11px] text-slate-600 font-mono">108 Occupants / 100 Cap • CO2: 1280 PPM</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Capacity Reservoir</span>
            <div className="text-base font-extrabold text-emerald-600">{summary?.availableCapacity ?? 429} Seats Available</div>
            <div className="text-[11px] text-slate-600 font-mono">Conference Hub B (15%) • Cleanroom Lab (70%)</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Space Utilization</span>
            <div className="text-base font-extrabold text-slate-900">{summary?.occupancyPercentage ?? 71}% Portfolio Load</div>
            <div className="text-[11px] text-slate-600 font-mono">Within ASHRAE 62.1 commercial target (65-80%)</div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBTAB: INTERACTIVE FLOORPLAN
  // ----------------------------------------------------
  if (internalTab === 'interactive-floorplan') {
    const floorZones = zones.filter((z) => Number(z.floor) === selectedFloor || (!z.floor && selectedFloor === 2));

    return (
      <div className="space-y-6 font-sans">
        {renderSubNavBar()}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
              <Compass className="w-3.5 h-3.5 text-cyan-600" />
              <span>Spatial Intelligence</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 mt-1">Interactive Building Floorplan & Heatmap</h1>
            <p className="text-xs text-slate-600 font-medium">Real-time room occupancy density, thermal distribution, and fresh air airflow vectors.</p>
          </div>

          {/* Multi-floor selector */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 12].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedFloor === f
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        {/* Floorplan Layout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Apex Tower HQ — Floor {selectedFloor} Zone Density Map
            </h2>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Optimal (&lt;70%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (70-85%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overcrowded / Purge (&gt;85%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 min-h-[360px] flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {floorZones.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-xs">
                    No active zones configured on Floor {selectedFloor}. Showing all available zones.
                  </div>
                ) : (
                  floorZones.map((z) => {
                    const occ = z.currentOccupancy ?? z.occupantCount ?? 0;
                    const cap = z.capacity ?? z.maxCapacity ?? 100;
                    const pct = z.occupancyPercentage ?? Math.round((occ / cap) * 100);
                    const isOvercrowded = pct > 100 || z.status === 'Overcrowded';
                    const isHigh = pct >= 85 && pct <= 100;

                    return (
                      <div
                        key={z.id}
                        className={`p-4 rounded-xl border space-y-2 relative transition-all ${
                          isOvercrowded
                            ? 'bg-rose-100/80 border-rose-300 ring-2 ring-rose-500/20'
                            : isHigh
                            ? 'bg-amber-100/70 border-amber-300'
                            : 'bg-emerald-100/70 border-emerald-300'
                        }`}
                      >
                        <span
                          className={`absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isOvercrowded
                              ? 'bg-rose-600 text-white'
                              : isHigh
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {pct}% Load
                        </span>
                        <div className="text-xs font-extrabold text-slate-900">{z.name}</div>
                        <div className="text-[11px] font-mono text-slate-700">
                          {occ} / {cap} Occupants
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-slate-800 flex items-center gap-3">
                          <span className={z.co2Ppm > 1000 ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                            CO2: {z.co2Ppm} PPM
                          </span>
                          <span>Temp: {z.tempC}°C</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">{z.id}</span>
                          {z.co2Ppm > 1000 && (
                            <button
                              onClick={() => handleVentilationAdjust(z.id)}
                              disabled={adjustingZoneId === z.id}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              {adjustingZoneId === z.id ? 'Purging...' : 'Purge CO2'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 flex items-center justify-between">
                <span>AI Airflow Optimization: VAV Damper position auto-adjusting based on occupant density.</span>
                <span className="text-blue-700 font-bold">98.4% IAQ Score</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Floor {selectedFloor} Telemetry Health</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex justify-between">
                  <span>IoT CO2 Sensors</span>
                  <span className="text-emerald-700 font-bold">12 / 12 Online</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex justify-between">
                  <span>Occupancy Optics</span>
                  <span className="text-emerald-700 font-bold">8 / 8 Online</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex justify-between">
                  <span>VAV Actuators</span>
                  <span className="text-emerald-700 font-bold">16 / 16 Calibrated</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex justify-between">
                  <span>Fresh Air Intake</span>
                  <span className="text-sky-700 font-bold">2,400 CFM Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBTAB: MULTI-SITE PORTFOLIO
  // ----------------------------------------------------
  if (internalTab === 'multi-site') {
    return (
      <div className="space-y-6 font-sans">
        {renderSubNavBar()}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Portfolio Intelligence</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 mt-1">Multi-Site Portfolio Command</h1>
          <p className="text-xs text-slate-600 font-medium">Cross-building energy consumption, health index, and unified facility management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolioSites.map((site) => (
            <div key={site.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-extrabold text-slate-900">{site.name}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${site.status === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {site.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Floor Area</span>
                  <span className="text-slate-900 font-bold">{site.sqft ? site.sqft.toLocaleString() : site.sqft} sq ft</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Occupants</span>
                  <span className="text-slate-900 font-bold">{site.occupantCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Live Demand</span>
                  <span className="text-amber-700 font-bold">{site.activeDemandKw} kW</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Health Score</span>
                  <span className="text-emerald-700 font-bold">{site.healthScore} / 100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // DEFAULT: OCCUPANCY AGENT & ZONE SPATIAL OVERVIEW
  // ----------------------------------------------------
  const overcrowdedZones = zones.filter(
    (z) =>
      (z.occupancyPercentage || ((z.currentOccupancy || z.occupantCount) / (z.capacity || z.maxCapacity)) * 100) > 100 ||
      z.status === 'Overcrowded'
  );

  return (
    <div className="space-y-6 font-sans">
      {renderSubNavBar()}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Milestone 3 Spatial Intelligence</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
            Occupancy Agent & Space Utilization Engine
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Automated space density optimization, overcrowding detection, IAQ CO2 purge matching, and occupant redirection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddZoneOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zone</span>
          </button>
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleRunOccupancyAgent}
            disabled={isAgentRunning}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
            <span>{isAgentRunning ? 'Evaluating...' : 'Run Space Agent'}</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Facility Occupants</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{summary?.currentOccupancy ?? 1046}</span>
            <span className="text-xs text-slate-500 font-mono">/ {summary?.totalCapacity ?? 1475}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {summary?.occupancyPercentage ?? 71}% Overall Utilization
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overcrowding Risk</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-rose-600">{overcrowdedZones.length}</span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
              {overcrowdedZones.length > 0 ? 'ACTION REQUIRED' : 'NORMAL'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {overcrowdedZones.length > 0 ? 'Conference Hall A (>100%)' : '0 Zones Over Limit'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Capacity</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-600">{summary?.availableCapacity ?? 429}</span>
            <span className="text-xs text-slate-500 font-mono">Desks & Seats</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Ready for workload redistribution</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peak Time Window</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-slate-900">12:00 - 14:00</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Est. Peak: {summary?.peakOccupancy ?? 1205} occupants</div>
        </div>
      </div>

      {/* NEW: CNN Optical Neural Network Feature Showcase Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>NEW DEEP LEARNING FEATURE: CNN VISION HEADCOUNTING</span>
          </div>
          <h2 className="text-lg font-extrabold text-white">
            Convolutional Neural Network (CNN) Optical Camera Vision
          </h2>
          <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
            Real-time multi-scale Conv2D & Dilated Kernel spatial crowd estimation. Runs YOLOv8-CrowdNet and CSRNet models across 4 optical sensor streams to detect unbadged visitors and crowd clustering.
          </p>
          <div className="flex items-center space-x-4 pt-1 text-xs font-mono text-indigo-300">
            <span>444 Visual Headcount</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">+23 Untracked Delta</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">98.9% Precision</span>
          </div>
        </div>

        <button
          onClick={() => {
            setInternalTab('cnn-vision');
            onNavigateToTab?.('cnn-vision');
          }}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 shrink-0 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <Eye className="w-4 h-4" />
          <span>Launch CNN Optical Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* OVERCROWDING & IAQ ACTION BANNER (When overcrowding or high CO2 detected) */}
      {overcrowdedZones.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-rose-600 text-white rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-rose-950">Overcrowding Alert Detected: Conference Hall A</h3>
                <span className="text-xs text-rose-700 font-medium">108 occupants (108% capacity) • CO2 reading at 1,280 PPM (Threshold: 1,000 PPM)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 uppercase">
              CRITICAL IAQ OVERRUN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 border border-rose-200 rounded-xl p-3 space-y-2">
              <span className="font-bold text-slate-900 block font-sans">Automated AI Space Balancing Recommendation:</span>
              <p className="text-slate-700 leading-relaxed">
                Redirect overflow participants to adjacent <strong>Conference Hub B</strong> (Floor 12, currently at 15% capacity).
              </p>
              <button
                onClick={() => setActionSuccessMsg('Redirection notices sent to hallway signage displays and digital event monitors.')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Execute Attendee Redirection
              </button>
            </div>

            <div className="bg-white/80 border border-rose-200 rounded-xl p-3 space-y-2">
              <span className="font-bold text-slate-900 block font-sans">Dynamic HVAC Ventilation Purge:</span>
              <p className="text-slate-700 leading-relaxed">
                Boost AHU-02 supply airflow (+25%) and modulate outdoor air dampers to flush CO2 levels below 800 PPM.
              </p>
              <button
                onClick={() => handleVentilationAdjust('ZONE-CONF-HALL-A', 25)}
                disabled={adjustingZoneId === 'ZONE-CONF-HALL-A'}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
              >
                {adjustingZoneId === 'ZONE-CONF-HALL-A' ? 'Purging...' : 'Boost Airflow & Purge CO2'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Occupancy Agent Diagnostic Card */}
      {agentAnalysis && (
        <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-blue-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-700 rounded-lg">
                <Sparkles className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">AI Space Utilization Assessment</h3>
                <span className="text-[10px] text-blue-300 font-mono">Engine: {agentAnalysis.engineType || 'Autonomous Occupancy Reasoning'}</span>
              </div>
            </div>
            <button
              onClick={() => setAgentAnalysis(null)}
              className="text-xs text-blue-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-blue-100 leading-relaxed font-medium">{agentAnalysis.summary}</p>
            {agentAnalysis.overcrowdingDiagnostic && (
              <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-xl text-blue-200">
                <span className="font-bold text-amber-300 block mb-1">Overcrowding & IAQ Diagnostic:</span>
                {agentAnalysis.overcrowdingDiagnostic}
              </div>
            )}
          </div>

          {agentAnalysis.recommendations && (
            <div className="space-y-2 pt-2 border-t border-blue-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 font-mono">Actionable Space & HVAC Directives:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {agentAnalysis.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-blue-800/60 rounded-lg text-xs text-blue-100 border border-blue-700 flex items-start gap-2">
                    <span className="text-blue-300 font-bold font-mono">{idx + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of Monitored Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {zones.map((z) => {
          const occ = z.currentOccupancy ?? z.occupantCount ?? 0;
          const cap = z.capacity ?? z.maxCapacity ?? 100;
          const percentage = z.occupancyPercentage ?? Math.round((occ / cap) * 100);
          const isOvercrowded = percentage > 100 || z.status === 'Overcrowded';
          const isHigh = percentage >= 85 && percentage <= 100;
          const isVentRequired = z.co2Ppm > 1000 || isOvercrowded;

          return (
            <div
              key={z.id}
              className={`bg-white border rounded-xl p-5 space-y-4 shadow-2xs transition-all ${
                isOvercrowded
                  ? 'border-rose-300 bg-rose-50/20'
                  : isHigh
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-slate-900">{z.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200">
                      Floor {z.floor || 1}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{z.location || 'Main Highrise'}</div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                    isOvercrowded
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : isHigh
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {z.status || (isOvercrowded ? 'Overcrowded' : isHigh ? 'High' : 'Normal')}
                </span>
              </div>

              {/* Density Progress Bar */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 font-sans font-bold">Occupant Density:</span>
                  <span className={`font-bold ${isOvercrowded ? 'text-rose-700' : isHigh ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {occ} / {cap} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOvercrowded ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
              </div>

              {/* Environmental Metrics */}
              <div className="grid grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Occupants</span>
                  <span className="text-slate-900 font-bold">{occ}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Indoor Temp</span>
                  <span className="text-slate-900 font-bold">{z.tempC}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">CO2 Reading</span>
                  <span className={z.co2Ppm > 1000 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {z.co2Ppm} PPM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">HVAC Load</span>
                  <span className="text-slate-900 font-bold">{z.hvacLoadPct || 50}%</span>
                </div>
              </div>

              {/* Historical Sparkline */}
              {z.historical && z.historical.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">Historical Density (Today)</div>
                  <div className="h-20 w-full bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={z.historical}>
                        <XAxis dataKey="time" fontSize={9} stroke="#64748b" />
                        <YAxis fontSize={9} stroke="#64748b" />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                        <Line type="monotone" dataKey="occupantCount" name="Occupants" stroke="#0284c7" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>Updated: {z.timestamp ? new Date(z.timestamp).toLocaleTimeString() : 'Live'}</span>
                {isVentRequired && (
                  <button
                    onClick={() => handleVentilationAdjust(z.id)}
                    disabled={adjustingZoneId === z.id}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs"
                  >
                    {adjustingZoneId === z.id ? 'Calibrating...' : 'Boost Fresh Air'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zone Modal */}
      {isAddZoneOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Monitored Space / Zone</h3>
              <button
                onClick={() => setIsAddZoneOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Innovation Lounge 3C"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Floor</label>
                  <input
                    type="number"
                    value={newZoneFloor}
                    onChange={(e) => setNewZoneFloor(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    required
                    value={newZoneCapacity}
                    onChange={(e) => setNewZoneCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Headcount</label>
                  <input
                    type="number"
                    value={newZoneOccupancy}
                    onChange={(e) => setNewZoneOccupancy(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">CO2 (PPM)</label>
                  <input
                    type="number"
                    value={newZoneCo2}
                    onChange={(e) => setNewZoneCo2(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newZoneTemp}
                    onChange={(e) => setNewZoneTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddZoneOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
