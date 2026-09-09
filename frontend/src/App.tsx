import React, { useState, useEffect } from 'react';
import { TabType, WorkOrder, AlertNotification, EquipmentHealth } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AiAssistantDrawer } from './components/layout/AiAssistantDrawer';
import { ReportExportModal } from './components/modals/ReportExportModal';
import { SimulateModal } from './components/modals/SimulateModal';
import { AuthModal } from './components/modals/AuthModal';
import { ProfileSettingsModal } from './components/modals/ProfileSettingsModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { ExecutiveOverview } from './components/dashboards/ExecutiveOverview';
import { EnergyDashboard } from './components/dashboards/EnergyDashboard';
import { MaintenanceDashboard } from './components/dashboards/MaintenanceDashboard';
import { OccupancyDashboard } from './components/dashboards/OccupancyDashboard';
import { SecurityDashboard } from './components/dashboards/SecurityDashboard';
import { IotTelemetryDashboard } from './components/dashboards/IotTelemetryDashboard';
import { WorkOrdersModule } from './components/modules/WorkOrdersModule';
import { AgentCommandCenter } from './components/modules/AgentCommandCenter';
import { ReportsModule } from './components/modules/ReportsModule';
import { AlertsWorkflowsModule } from './components/modules/AlertsWorkflowsModule';
import { CostDashboard, CostSubTab } from './components/dashboards/CostDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { fetchWorkOrders, fetchHealthStatus, fetchMeApi, logoutApi, fetchAlertsApi } from './api/client';
import { INITIAL_EQUIPMENT, INITIAL_ALERTS, INITIAL_WORK_ORDERS } from './data/mockData';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('executive-hub');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('Apex Tower HQ');

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    const saved = localStorage.getItem('facilityops_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [equipmentList] = useState<EquipmentHealth[]>(INITIAL_EQUIPMENT);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);

  const handleLogout = () => {
    logoutApi();
    setUser(null);
    setIsProfileSettingsModalOpen(false);
  };

  const loadBackendData = async () => {
    try {
      const [orders, fetchedAlertsRes] = await Promise.all([
        fetchWorkOrders(),
        fetchAlertsApi(),
      ]);
      if (orders && orders.length > 0) {
        setWorkOrders(orders);
      }
      if (fetchedAlertsRes) {
        const alertList = (fetchedAlertsRes as any).alerts || fetchedAlertsRes;
        if (Array.isArray(alertList)) {
          setAlerts(alertList);
        }
      }
    } catch (err) {
      console.warn('Backend API connection offline, using fallback state.');
    }
  };

  useEffect(() => {
    loadBackendData();
    fetchHealthStatus().catch(() => {});
    fetchMeApi().then((u) => {
      if (u) setUser(u);
    }).catch(() => {});
  }, []);

  // Real Dedicated Full-Page Login Portal
  if (!user || activeTab === 'login') {
    return (
      <div className="relative min-h-screen bg-slate-950">
        {user && (
          <div className="bg-slate-900 border-b border-slate-800 text-xs px-6 py-2.5 flex items-center justify-between text-slate-300 z-50">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Active Session:</span>
              <span className="text-cyan-400 font-semibold">{user.name}</span>
              <span className="text-slate-500">({user.role})</span>
            </div>
            <button
              onClick={() => setActiveTab('executive-hub')}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1.5 shadow-xs"
            >
              <span>Return to Facility Dashboard</span>
              <span>&rarr;</span>
            </button>
          </div>
        )}
        <LoginPage
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setActiveTab('executive-hub');
          }}
          onExploreDemo={() => {
            const guestUser = {
              name: 'Sarah Jenkins',
              email: 's.jenkins@apexhighrise.com',
              role: 'Facility Manager',
            };
            localStorage.setItem('facilityops_user', JSON.stringify(guestUser));
            setUser(guestUser);
            setActiveTab('executive-hub');
          }}
          currentFacility={selectedFacility}
          onSelectFacility={setSelectedFacility}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* Top App Bar Header */}
      <Header
        alerts={alerts}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onOpenNotificationsDrawer={() => setIsNotificationsDrawerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileSettingsModal={() => setIsProfileSettingsModalOpen(true)}
        user={user}
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
        onLogout={handleLogout}
        onNavigateToLogin={() => setActiveTab('login')}
      />

      {/* Main Body Layout with Independent Scrolling Columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => setActiveTab(tab)} 
          user={user}
          onLogout={handleLogout}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50 h-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {(activeTab === 'executive-hub' || activeTab === 'overview') && (
              <ExecutiveOverview
                onSelectTab={setActiveTab}
                onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
              />
            )}

            {(activeTab === 'energy-agent' || activeTab === 'energy' || activeTab === 'cost-optimizer' || activeTab === 'cop-limits') && (
              <EnergyDashboard activeSubTab={activeTab} onNavigateTab={setActiveTab} />
            )}

            {(activeTab === 'predictive-health' || activeTab === 'maintenance') && (
              <MaintenanceDashboard onWorkOrderCreated={loadBackendData} />
            )}

            {(activeTab === 'work-orders' || activeTab === 'workorders') && (
              <WorkOrdersModule workOrders={workOrders} onRefresh={loadBackendData} />
            )}

            {(activeTab === 'occupancy-agent' || activeTab === 'occupancy' || activeTab === 'occupancy-analytics' || activeTab === 'overcrowding-detection' || activeTab === 'interactive-floorplan' || activeTab === 'multi-site' || activeTab === 'cnn-vision' || activeTab === 'cnn-occupancy') && (
              <OccupancyDashboard activeSubTab={activeTab} onNavigateToTab={setActiveTab} />
            )}

            {(activeTab === 'security-agent' || activeTab === 'security' || activeTab === 'security-intelligence' || activeTab === 'access-monitoring') && (
              <SecurityDashboard
                activeSubTab={activeTab}
                onNavigateTab={setActiveTab}
                onNavigateToOccupancy={() => setActiveTab('occupancy-agent')}
              />
            )}

            {[
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
            ].includes(activeTab) && (
              <CostDashboard
                initialSubTab={
                  activeTab === 'cost-optimization' ? 'cost-agent' : (activeTab as CostSubTab)
                }
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'agent' && (
              <AgentCommandCenter />
            )}

            {activeTab === 'alerts-workflows' && (
              <AlertsWorkflowsModule
                onRefreshGlobalData={loadBackendData}
                onNavigateToWorkOrders={() => setActiveTab('work-orders')}
              />
            )}

            {activeTab === 'iot-telemetry' && (
              <IotTelemetryDashboard />
            )}

            {(activeTab === 'reports' || activeTab === 'executive-reports') && (
              <ReportsModule />
            )}
          </div>

          {/* Bottom Footer Banner */}
          <footer className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Agentic FacilityOps AI Platform — Autonomous Infrastructure & Energy Intelligence</span>
            <span className="text-emerald-600 font-semibold">Energy Anomaly Engine: 96.2% Accuracy • Predictive Asset Health & Dispatch Active</span>
          </footer>
        </main>
      </div>

      {/* Slide-over AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onWorkOrderCreated={loadBackendData}
      />

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Simulation Scenario Modal */}
      <SimulateModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {/* Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsModalOpen}
        onClose={() => setIsProfileSettingsModalOpen(false)}
        user={user}
        onLogout={handleLogout}
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        alerts={alerts}
        onRefreshAlerts={loadBackendData}
        onNavigateToAlertsModule={() => setActiveTab('alerts-workflows')}
      />
    </div>
  );
};

export default App;
