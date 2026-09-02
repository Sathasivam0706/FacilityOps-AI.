import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Wrench, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  LayoutDashboard, 
  Sliders, 
  Sparkles,
  Map,
  Building,
  Bell,
  ChevronDown,
  ChevronRight,
  Bot,
  Cpu,
  FileText,
  Eye,
  TrendingDown,
  TrendingUp,
  Server,
  GitMerge,
  Wallet
} from 'lucide-react';
import { TabType } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const [navMode, setNavMode] = useState<'dashboards' | 'core-ops'>('dashboards');
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    energy: true,
    maintenance: true,
    spatial: true,
    cost: true,
    automation: true,
  });

  // Auto detect mode and expand section when activeTab changes
  useEffect(() => {
    if (['work-orders', 'workorders', 'agent', 'alerts-workflows'].includes(activeTab)) {
      setNavMode('core-ops');
    } else {
      setNavMode('dashboards');
    }

    if (['energy-agent', 'energy', 'cost-optimizer', 'cop-limits'].includes(activeTab)) {
      setOpenSections((prev) => ({ ...prev, energy: true }));
    } else if (['predictive-health', 'maintenance', 'work-orders', 'workorders'].includes(activeTab)) {
      setOpenSections((prev) => ({ ...prev, maintenance: true }));
    } else if (['occupancy-agent', 'occupancy', 'occupancy-analytics', 'interactive-floorplan', 'security-agent', 'security', 'security-intelligence', 'access-monitoring', 'multi-site'].includes(activeTab)) {
      setOpenSections((prev) => ({ ...prev, spatial: true }));
    } else if ([
      'cost-optimization',
      'cost-agent',
      'cost-analysis',
      'resource-utilization',
      'budget-monitoring',
      'roi-analytics',
      'cost-recommendations',
      'executive-dashboard',
      'facility-reports',
      'cross-agent',
      'enterprise-deployment',
    ].includes(activeTab)) {
      setOpenSections((prev) => ({ ...prev, cost: true }));
    } else if (['agent', 'alerts-workflows'].includes(activeTab)) {
      setOpenSections((prev) => ({ ...prev, automation: true }));
    }
  }, [activeTab]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isTabActive = (tab: TabType) => {
    if (activeTab === tab) return true;
    if (tab === 'executive-hub' && activeTab === 'overview') return true;
    if (tab === 'energy-agent' && activeTab === 'energy') return true;
    if (tab === 'predictive-health' && activeTab === 'maintenance') return true;
    if (tab === 'work-orders' && activeTab === 'workorders') return true;
    if (tab === 'occupancy-agent' && activeTab === 'occupancy') return true;
    if (tab === 'security-agent' && (activeTab === 'security' || activeTab === 'security-intelligence')) return true;
    if (tab === 'access-monitoring' && activeTab === 'access-monitoring') return true;
    if (tab === 'agent' && activeTab === 'agent') return true;
    if (tab === 'reports' && (activeTab === 'reports' || activeTab === 'executive-reports')) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-slate-50/95 border-r border-slate-200 flex flex-col shrink-0 h-full overflow-y-auto text-xs font-sans">
      <div className="p-3 space-y-3">
        {/* Dashboard Navigation Title Header */}
        <div className="p-2 bg-slate-200/70 rounded-lg border border-slate-300/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 text-center">
          Dashboard Navigation
        </div>

        {/* Executive Hub */}
        <div>
          <button
            onClick={() => onSelectTab('executive-hub')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left ${
              isTabActive('executive-hub')
                ? 'bg-white text-slate-900 border-2 border-cyan-500 shadow-xs font-bold'
                : 'bg-white/70 hover:bg-white text-slate-800 border border-slate-200 font-medium'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-cyan-500/10 text-cyan-600 rounded-lg">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Executive Hub</div>
                <div className="text-[10px] text-slate-500 font-normal">Operations Overview</div>
              </div>
            </div>
            <span className="text-[9px] bg-cyan-900 text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase">
              HUB
            </span>
          </button>
        </div>

        {/* DOMAIN CATEGORY 1: ENERGY OPERATIONS */}
        <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-1.5 space-y-1">
          <button
            onClick={() => toggleSection('energy')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-slate-900 hover:text-amber-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-amber-500 text-white rounded-md">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-[11px] uppercase tracking-wider text-amber-900">
                  Energy Operations
                </div>
                <div className="text-[9px] text-amber-700 font-normal">Utility Data & Anomaly Engine</div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-amber-700 transition-transform ${openSections.energy ? '' : '-rotate-90'}`} />
          </button>

          {openSections.energy && (
            <div className="space-y-1 pl-1 pt-0.5">
              <button
                onClick={() => onSelectTab('energy-agent')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('energy-agent')
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className={`w-3.5 h-3.5 ${isTabActive('energy-agent') ? 'text-white' : 'text-amber-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Energy Agent</div>
                    <div className={`text-[9px] ${isTabActive('energy-agent') ? 'text-amber-100' : 'text-slate-500'}`}>
                      Utility & Anomaly Engine
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isTabActive('energy-agent') ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  4
                </span>
              </button>

              <button
                onClick={() => onSelectTab('cost-optimizer')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('cost-optimizer')
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-3.5 h-3.5 ${isTabActive('cost-optimizer') ? 'text-emerald-100' : 'text-emerald-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Cost & Tariff Optimizer</div>
                    <div className={`text-[9px] ${isTabActive('cost-optimizer') ? 'text-emerald-100' : 'text-slate-500'}`}>
                      OpEx Savings
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isTabActive('cost-optimizer') ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  TOU
                </span>
              </button>

              <button
                onClick={() => onSelectTab('cop-limits')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('cop-limits')
                    ? 'bg-cyan-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sliders className={`w-3.5 h-3.5 ${isTabActive('cop-limits') ? 'text-cyan-100' : 'text-cyan-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">COP & Alarm Limits</div>
                    <div className={`text-[9px] ${isTabActive('cop-limits') ? 'text-cyan-100' : 'text-slate-500'}`}>
                      Threshold Bounds
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isTabActive('cop-limits') ? 'bg-cyan-900 text-white' : 'bg-cyan-100 text-cyan-800'
                }`}>
                  LIM
                </span>
              </button>
            </div>
          )}
        </div>

        {/* DOMAIN CATEGORY 2: PREDICTIVE MAINTENANCE */}
        <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-2xl p-1.5 space-y-1">
          <button
            onClick={() => toggleSection('maintenance')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-slate-900 hover:text-emerald-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-emerald-600 text-white rounded-md">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-900">
                  Predictive Maintenance
                </div>
                <div className="text-[9px] text-emerald-700 font-normal">Predictive Asset Health & RUL</div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${openSections.maintenance ? '' : '-rotate-90'}`} />
          </button>

          {openSections.maintenance && (
            <div className="space-y-1 pl-1 pt-0.5">
              <button
                onClick={() => onSelectTab('predictive-health')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('predictive-health')
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className={`w-3.5 h-3.5 ${isTabActive('predictive-health') ? 'text-emerald-200' : 'text-emerald-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Predictive Health</div>
                    <div className={`text-[9px] ${isTabActive('predictive-health') ? 'text-emerald-100' : 'text-slate-500'}`}>
                      RUL & Health Scores
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('work-orders')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('work-orders')
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wrench className={`w-3.5 h-3.5 ${isTabActive('work-orders') ? 'text-white' : 'text-blue-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Work Orders & Tickets</div>
                    <div className={`text-[9px] ${isTabActive('work-orders') ? 'text-blue-100' : 'text-slate-500'}`}>
                      Technician Dispatch
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isTabActive('work-orders') ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  3
                </span>
              </button>
            </div>
          )}
        </div>

        {/* DOMAIN CATEGORY 3: OCCUPANCY & SECURITY INTELLIGENCE (MILESTONE 3) */}
        <div className="bg-blue-50/40 border border-blue-200/60 rounded-2xl p-1.5 space-y-1">
          <button
            onClick={() => toggleSection('spatial')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-slate-900 hover:text-blue-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-blue-600 text-white rounded-md">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-[11px] uppercase tracking-wider text-blue-950">
                  Occupancy & Security
                </div>
                <div className="text-[9px] text-blue-700 font-normal">Milestone 3 Intelligence</div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-700 transition-transform ${openSections.spatial ? '' : '-rotate-90'}`} />
          </button>

          {openSections.spatial && (
            <div className="space-y-1 pl-1 pt-0.5">
              <button
                onClick={() => onSelectTab('occupancy-agent')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('occupancy-agent')
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className={`w-3.5 h-3.5 ${isTabActive('occupancy-agent') ? 'text-blue-100' : 'text-blue-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Occupancy Agent</div>
                    <div className={`text-[9px] ${isTabActive('occupancy-agent') ? 'text-blue-100' : 'text-slate-500'}`}>
                      Space & Overcrowding
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  isTabActive('occupancy-agent') ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  M3
                </span>
              </button>

              <button
                onClick={() => onSelectTab('cnn-vision' as any)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'cnn-vision' || (activeTab as string) === 'cnn-occupancy'
                    ? 'bg-indigo-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Cpu className={`w-3.5 h-3.5 ${activeTab === 'cnn-vision' || (activeTab as string) === 'cnn-occupancy' ? 'text-indigo-200' : 'text-indigo-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">CNN Optical Vision</div>
                    <div className={`text-[9px] ${activeTab === 'cnn-vision' || (activeTab as string) === 'cnn-occupancy' ? 'text-indigo-100' : 'text-slate-500'}`}>
                      Neural Headcounting
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  activeTab === 'cnn-vision' || (activeTab as string) === 'cnn-occupancy' ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  CNN
                </span>
              </button>

              <button
                onClick={() => onSelectTab('occupancy-analytics')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'occupancy-analytics'
                    ? 'bg-sky-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className={`w-3.5 h-3.5 ${activeTab === 'occupancy-analytics' ? 'text-sky-100' : 'text-sky-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Occupancy Analytics</div>
                    <div className={`text-[9px] ${activeTab === 'occupancy-analytics' ? 'text-sky-100' : 'text-slate-500'}`}>
                      Trends & Space Curves
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('security-agent')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isTabActive('security-agent')
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className={`w-3.5 h-3.5 ${isTabActive('security-agent') ? 'text-purple-100' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Security Agent</div>
                    <div className={`text-[9px] ${isTabActive('security-agent') ? 'text-purple-100' : 'text-slate-500'}`}>
                      Access Threat Engine
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  isTabActive('security-agent') ? 'bg-purple-900 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  SOC
                </span>
              </button>

              <button
                onClick={() => onSelectTab('access-monitoring')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'access-monitoring'
                    ? 'bg-indigo-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Eye className={`w-3.5 h-3.5 ${activeTab === 'access-monitoring' ? 'text-indigo-100' : 'text-indigo-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Access Monitoring</div>
                    <div className={`text-[9px] ${activeTab === 'access-monitoring' ? 'text-indigo-100' : 'text-slate-500'}`}>
                      Live Events & Badging
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  activeTab === 'access-monitoring' ? 'bg-indigo-900 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  LIVE
                </span>
              </button>

              <button
                onClick={() => onSelectTab('interactive-floorplan')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'interactive-floorplan'
                    ? 'bg-cyan-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Map className={`w-3.5 h-3.5 ${activeTab === 'interactive-floorplan' ? 'text-white' : 'text-cyan-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Interactive Floorplan</div>
                    <div className={`text-[9px] ${activeTab === 'interactive-floorplan' ? 'text-cyan-100' : 'text-slate-500'}`}>
                      Density & Heatmaps
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('multi-site')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'multi-site'
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Building className={`w-3.5 h-3.5 ${activeTab === 'multi-site' ? 'text-white' : 'text-slate-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Multi-Site Portfolio</div>
                    <div className={`text-[9px] ${activeTab === 'multi-site' ? 'text-slate-200' : 'text-slate-500'}`}>
                      Cross-Building View
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* DOMAIN CATEGORY: COST OPTIMIZATION (MILESTONE 4) */}
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-1.5 space-y-1">
          <button
            onClick={() => toggleSection('cost')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-slate-900 hover:text-purple-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-purple-600 text-white rounded-md shadow-xs">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-[11px] uppercase tracking-wider text-purple-950">
                  Cost Optimization
                </div>
                <div className="text-[9px] text-purple-700 font-normal">Milestone 4 Enterprise</div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-purple-700 transition-transform ${openSections.cost ? '' : '-rotate-90'}`} />
          </button>

          {openSections.cost && (
            <div className="space-y-1 pl-1 pt-0.5">
              {/* 1. Cost Optimization Agent */}
              <button
                onClick={() => onSelectTab('cost-agent')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'cost-agent' || activeTab === 'cost-optimization'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bot className={`w-3.5 h-3.5 ${activeTab === 'cost-agent' || activeTab === 'cost-optimization' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Cost Optimization Agent</div>
                    <div className={`text-[9px] ${activeTab === 'cost-agent' || activeTab === 'cost-optimization' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Autonomous Financial AI
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  activeTab === 'cost-agent' || activeTab === 'cost-optimization' ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  M4
                </span>
              </button>

              {/* 2. Operational Cost Analysis */}
              <button
                onClick={() => onSelectTab('cost-analysis')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'cost-analysis'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-3.5 h-3.5 ${activeTab === 'cost-analysis' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Operational Cost Analysis</div>
                    <div className={`text-[9px] ${activeTab === 'cost-analysis' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Breakdowns & Trends
                    </div>
                  </div>
                </div>
              </button>

              {/* 3. Resource Utilization */}
              <button
                onClick={() => onSelectTab('resource-utilization')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'resource-utilization'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className={`w-3.5 h-3.5 ${activeTab === 'resource-utilization' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Resource Utilization</div>
                    <div className={`text-[9px] ${activeTab === 'resource-utilization' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Capacity & Waste Audits
                    </div>
                  </div>
                </div>
              </button>

              {/* 4. Budget & Spending Monitoring */}
              <button
                onClick={() => onSelectTab('budget-monitoring')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'budget-monitoring'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wallet className={`w-3.5 h-3.5 ${activeTab === 'budget-monitoring' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Budget & Spending Monitoring</div>
                    <div className={`text-[9px] ${activeTab === 'budget-monitoring' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Variance & Status Alerts
                    </div>
                  </div>
                </div>
              </button>

              {/* 5. ROI Analytics */}
              <button
                onClick={() => onSelectTab('roi-analytics')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'roi-analytics'
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'roi-analytics' ? 'text-white' : 'text-emerald-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">ROI Analytics</div>
                    <div className={`text-[9px] ${activeTab === 'roi-analytics' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Payback & Value Realization
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  activeTab === 'roi-analytics' ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  161%
                </span>
              </button>

              {/* 6. Cost Saving Recommendations */}
              <button
                onClick={() => onSelectTab('cost-recommendations')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'cost-recommendations'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'cost-recommendations' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Cost Recommendations</div>
                    <div className={`text-[9px] ${activeTab === 'cost-recommendations' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Actionable Setpoints
                    </div>
                  </div>
                </div>
              </button>

              {/* 7. Executive Dashboard */}
              <button
                onClick={() => onSelectTab('executive-dashboard')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'executive-dashboard'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className={`w-3.5 h-3.5 ${activeTab === 'executive-dashboard' ? 'text-cyan-300' : 'text-slate-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Executive Dashboard</div>
                    <div className={`text-[9px] ${activeTab === 'executive-dashboard' ? 'text-slate-200' : 'text-slate-500'}`}>
                      All 4 Milestones Synthesis
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  activeTab === 'executive-dashboard' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  CXO
                </span>
              </button>

              {/* 8. Facility Intelligence Reports */}
              <button
                onClick={() => onSelectTab('facility-reports')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'facility-reports'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className={`w-3.5 h-3.5 ${activeTab === 'facility-reports' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Facility Intelligence Reports</div>
                    <div className={`text-[9px] ${activeTab === 'facility-reports' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Executive PDF & CSV Previews
                    </div>
                  </div>
                </div>
              </button>

              {/* 9. Cross-Agent Intelligence */}
              <button
                onClick={() => onSelectTab('cross-agent')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'cross-agent'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GitMerge className={`w-3.5 h-3.5 ${activeTab === 'cross-agent' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Cross-Agent Intelligence</div>
                    <div className={`text-[9px] ${activeTab === 'cross-agent' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Shared Insights Layer
                    </div>
                  </div>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  activeTab === 'cross-agent' ? 'bg-purple-900 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  SYNC
                </span>
              </button>

              {/* 10. Enterprise Deployment Status */}
              <button
                onClick={() => onSelectTab('enterprise-deployment')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'enterprise-deployment'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Server className={`w-3.5 h-3.5 ${activeTab === 'enterprise-deployment' ? 'text-white' : 'text-purple-600'} shrink-0`} />
                  <div>
                    <div className="text-xs font-bold">Enterprise Deployment Status</div>
                    <div className={`text-[9px] ${activeTab === 'enterprise-deployment' ? 'text-purple-100' : 'text-slate-500'}`}>
                      Edge Gateways & SLA Health
                    </div>
                  </div>
                </div>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  99.9%
                </span>
              </button>
            </div>
          )}
        </div>

        {/* DOMAIN CATEGORY 4: SYSTEM AUTOMATION */}
        <div className="space-y-1">
          <div className="px-2 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
            System Automation & Hardware
          </div>
          <button
            onClick={() => onSelectTab('iot-telemetry' as any)}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === ('iot-telemetry' as any)
                ? 'bg-cyan-700 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
            }`}
          >
            <Cpu className={`w-4 h-4 ${activeTab === ('iot-telemetry' as any) ? 'text-white' : 'text-cyan-600'} shrink-0`} />
            <span className="text-xs font-bold">IoT Devices & Telemetry</span>
          </button>

          <button
            onClick={() => onSelectTab('agent')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'agent'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
            }`}
          >
            <Bot className={`w-4 h-4 ${activeTab === 'agent' ? 'text-white' : 'text-indigo-600'} shrink-0`} />
            <span className="text-xs font-bold">Multi-Agent Command</span>
          </button>

          <button
            onClick={() => onSelectTab('alerts-workflows')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
              activeTab === 'alerts-workflows'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
            }`}
          >
            <Bell className={`w-4 h-4 ${activeTab === 'alerts-workflows' ? 'text-white' : 'text-amber-600'} shrink-0`} />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs font-bold">Alerts & Workflows</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                activeTab === 'alerts-workflows' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                FLOW
              </span>
            </div>
          </button>
        </div>

        {/* DOMAIN CATEGORY 5: REPORTS & AUDITS */}
        <div className="space-y-1">
          <div className="px-2 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
            Executive & Audit Exports
          </div>
          <button
            onClick={() => onSelectTab('reports')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
              isTabActive('reports')
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-white/80 border border-transparent font-medium'
            }`}
          >
            <FileText className={`w-4 h-4 ${isTabActive('reports') ? 'text-cyan-400' : 'text-slate-600'} shrink-0`} />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs font-bold">Reports & Audits</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-900">
                PDF/CSV
              </span>
            </div>
          </button>
        </div>

        {/* Bottom System Health Status */}
        <div className="pt-2">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>System Health</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                OPTIMAL
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[96%]" />
            </div>

            <div className="space-y-1 text-[10px] font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Energy Anomaly Accuracy:</span>
                <span className="font-bold text-emerald-700">96.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Predictive Asset Health:</span>
                <span className="font-bold text-cyan-700">RUL Active (18d)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
