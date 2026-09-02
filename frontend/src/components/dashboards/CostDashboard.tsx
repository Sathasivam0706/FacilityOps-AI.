import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers,
  FileText,
  Server,
  GitMerge,
  Bot,
  Sparkles,
  RefreshCw,
  Wallet,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { CostAgentView } from './cost/CostAgentView';
import { OperationalCostView } from './cost/OperationalCostView';
import { ResourceUtilizationView } from './cost/ResourceUtilizationView';
import { BudgetMonitoringView } from './cost/BudgetMonitoringView';
import { RoiAnalyticsView } from './cost/RoiAnalyticsView';
import { CostRecommendationsView } from './cost/CostRecommendationsView';
import { ExecutiveDashboardView } from './cost/ExecutiveDashboardView';
import { FacilityReportsView } from './cost/FacilityReportsView';
import { CrossAgentView } from './cost/CrossAgentView';
import { EnterpriseDeploymentView } from './cost/EnterpriseDeploymentView';
import {
  CostOverviewData,
  CostAnalyticsData,
  ResourceUtilizationData,
  BudgetMonitoringData,
  RoiAnalyticsData,
  CostSavingRecommendationItem,
  ExecutiveDashboardData,
  CrossAgentIntelligenceData,
  EnterpriseDeploymentData,
  TabType,
} from '../../types';
import {
  fetchCostOverviewApi,
  fetchCostAnalyticsApi,
  fetchResourceUtilizationApi,
  fetchBudgetMonitoringApi,
  fetchRoiAnalyticsApi,
  fetchCostRecommendationsApi,
  fetchExecutiveDashboardApi,
  fetchCrossAgentIntelligenceApi,
  fetchEnterpriseDeploymentApi,
} from '../../api/client';

export type CostSubTab =
  | 'cost-agent'
  | 'cost-analysis'
  | 'resource-utilization'
  | 'budget-monitoring'
  | 'roi-analytics'
  | 'cost-recommendations'
  | 'executive-dashboard'
  | 'facility-reports'
  | 'cross-agent'
  | 'enterprise-deployment';

interface CostDashboardProps {
  initialSubTab?: CostSubTab;
  onNavigateTab?: (tab: TabType) => void;
}

export const CostDashboard: React.FC<CostDashboardProps> = ({
  initialSubTab = 'cost-agent',
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CostSubTab>(initialSubTab);
  const [loading, setLoading] = useState(false);

  // Data states
  const [overview, setOverview] = useState<CostOverviewData | null>(null);
  const [analytics, setAnalytics] = useState<CostAnalyticsData | null>(null);
  const [resources, setResources] = useState<ResourceUtilizationData | null>(null);
  const [budget, setBudget] = useState<BudgetMonitoringData | null>(null);
  const [roi, setRoi] = useState<RoiAnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<CostSavingRecommendationItem[]>([]);
  const [executive, setExecutive] = useState<ExecutiveDashboardData | null>(null);
  const [crossAgent, setCrossAgent] = useState<CrossAgentIntelligenceData | null>(null);
  const [deployment, setDeployment] = useState<EnterpriseDeploymentData | null>(null);

  // Sync with initialSubTab prop if it changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        analyticsRes,
        resourcesRes,
        budgetRes,
        roiRes,
        recsRes,
        execRes,
        crossRes,
        deployRes,
      ] = await Promise.all([
        fetchCostOverviewApi(),
        fetchCostAnalyticsApi(),
        fetchResourceUtilizationApi(),
        fetchBudgetMonitoringApi(),
        fetchRoiAnalyticsApi(),
        fetchCostRecommendationsApi(),
        fetchExecutiveDashboardApi(),
        fetchCrossAgentIntelligenceApi(),
        fetchEnterpriseDeploymentApi(),
      ]);

      if (overviewRes && overviewRes.success) setOverview(overviewRes);
      if (analyticsRes && analyticsRes.success) setAnalytics(analyticsRes);
      if (resourcesRes && resourcesRes.success) setResources(resourcesRes);
      if (budgetRes && budgetRes.success) setBudget(budgetRes);
      if (roiRes && roiRes.success) setRoi(roiRes);
      if (recsRes && recsRes.success) setRecommendations(recsRes.recommendations || []);
      if (execRes && execRes.success) setExecutive(execRes);
      if (crossRes && crossRes.success) setCrossAgent(crossRes);
      if (deployRes && deployRes.success) setDeployment(deployRes);
    } catch (err) {
      console.error('Error loading Milestone 4 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const subTabsList: Array<{ id: CostSubTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'cost-agent', label: 'Cost Optimization Agent', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'cost-analysis', label: 'Operational Cost Analysis', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'resource-utilization', label: 'Resource Utilization', icon: <Layers className="w-4 h-4" /> },
    { id: 'budget-monitoring', label: 'Budget & Spending Monitoring', icon: <Wallet className="w-4 h-4" /> },
    { id: 'roi-analytics', label: 'ROI Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cost-recommendations', label: 'Cost Saving Recommendations', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'executive-dashboard', label: 'Executive Dashboard', icon: <Activity className="w-4 h-4" />, badge: 'C-Suite' },
    { id: 'facility-reports', label: 'Facility Intelligence Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'cross-agent', label: 'Cross-Agent Intelligence', icon: <GitMerge className="w-4 h-4" /> },
    { id: 'enterprise-deployment', label: 'Enterprise Deployment Status', icon: <Server className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
              MILESTONE 4
            </span>
            <span className="text-xs text-slate-400 font-mono">Apex Tower HQ</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Cost Optimization & Enterprise Deployment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Autonomous multi-agent financial governance, operational resource efficiency, and cluster telemetry.
          </p>
        </div>

        {/* Global Action Refresh */}
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {subTabsList.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  if (onNavigateTab) {
                    onNavigateTab(tab.id as TabType);
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Tab View Container */}
      <div className="transition-all">
        {activeSubTab === 'cost-agent' && (
          <CostAgentView
            overview={overview}
            recommendations={recommendations}
            onRefresh={loadAllData}
          />
        )}

        {activeSubTab === 'cost-analysis' && (
          <OperationalCostView analytics={analytics} />
        )}

        {activeSubTab === 'resource-utilization' && (
          <ResourceUtilizationView data={resources} onRefresh={loadAllData} />
        )}

        {activeSubTab === 'budget-monitoring' && (
          <BudgetMonitoringView data={budget} />
        )}

        {activeSubTab === 'roi-analytics' && (
          <RoiAnalyticsView data={roi} />
        )}

        {activeSubTab === 'cost-recommendations' && (
          <CostRecommendationsView
            recommendations={recommendations}
            onRefresh={loadAllData}
          />
        )}

        {activeSubTab === 'executive-dashboard' && (
          <ExecutiveDashboardView
            data={executive}
            onNavigateToTab={(tab) => {
              if (tab in subTabsList.map((t) => t.id)) {
                setActiveSubTab(tab as CostSubTab);
              }
            }}
          />
        )}

        {activeSubTab === 'facility-reports' && (
          <FacilityReportsView />
        )}

        {activeSubTab === 'cross-agent' && (
          <CrossAgentView data={crossAgent} onRefresh={loadAllData} />
        )}

        {activeSubTab === 'enterprise-deployment' && (
          <EnterpriseDeploymentView data={deployment} onRefresh={loadAllData} />
        )}
      </div>
    </div>
  );
};
