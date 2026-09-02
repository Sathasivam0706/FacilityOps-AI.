import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Sparkles,
  Filter,
  Search,
  Check,
  CheckCheck,
  Plus,
  RefreshCw,
  Wrench,
  Activity,
  ArrowRight,
  Clock,
  Send,
  Zap,
  Bot,
  Users,
  Shield,
  Trash2,
  Cpu,
  Layers,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import { AlertNotification, AlertCounts, AlertStats, WorkOrder } from '../../types';
import {
  fetchAlertsApi,
  sendAlertApi,
  acknowledgeAlertApi,
  resolveAlertApi,
  createWorkOrderFromAlertApi,
  deleteAlertApi,
  bulkAlertActionApi,
  triggerTelemetryDetectionApi,
  fetchAlertStatsApi,
  queryAiAgentApi,
} from '../../api/client';

interface AlertsWorkflowsModuleProps {
  onRefreshGlobalData?: () => void;
  onNavigateToWorkOrders?: () => void;
}

export const AlertsWorkflowsModule: React.FC<AlertsWorkflowsModuleProps> = ({
  onRefreshGlobalData,
  onNavigateToWorkOrders,
}) => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [counts, setCounts] = useState<AlertCounts>({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
    unacknowledged: 0,
  });
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertNotification | null>(null);

  // AI Diagnostic State
  const [aiDiagnosis, setAiDiagnosis] = useState<{ alertId: string; response: string } | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // New alert form state
  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    message: '',
    severity: 'warning' as 'critical' | 'warning' | 'info' | 'resolved',
    category: 'maintenance' as 'energy' | 'maintenance' | 'occupancy' | 'security',
    equipmentId: 'CHILLER-02',
    equipmentName: 'Centrifugal Water Chiller CH-02',
    channel: 'Slack #facility-alerts & Push Notification',
    recipient: 'Operations Center Lead',
  });

  // Resolve form state
  const [resolveForm, setResolveForm] = useState({
    notes: '',
    resolvedBy: 'Sarah Jenkins (Facility Manager)',
  });

  // Work order form state
  const [workOrderForm, setWorkOrderForm] = useState({
    assignedTechnician: 'Marcus Vance (Senior HVAC Specialist)',
    priority: 'High',
    customInstructions: '',
  });

  const loadAlertsData = async () => {
    setLoading(true);
    try {
      const [alertsRes, statsRes] = await Promise.all([
        fetchAlertsApi({
          severity: selectedSeverity,
          category: selectedCategory,
          search: searchQuery,
        }),
        fetchAlertStatsApi(),
      ]);

      if (alertsRes) {
        setAlerts(alertsRes.alerts);
        setCounts(alertsRes.counts);
      }
      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }
    } catch (e) {
      console.warn('Failed loading alerts data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, [selectedSeverity, selectedCategory, searchQuery]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlertApi(id);
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (e) {
      console.warn('Acknowledge failed', e);
    }
  };

  const handleOpenResolveModal = (alert: AlertNotification) => {
    setSelectedAlert(alert);
    setResolveForm({
      notes: `Inspected ${alert.equipmentName || alert.equipmentId}. Operational parameters confirmed within normal threshold limits.`,
      resolvedBy: 'Sarah Jenkins (Facility Manager)',
    });
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      await resolveAlertApi(selectedAlert.id, {
        notes: resolveForm.notes,
        resolvedBy: resolveForm.resolvedBy,
      });
      setIsResolveModalOpen(false);
      setSelectedAlert(null);
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (e) {
      console.warn('Resolve failed', e);
    }
  };

  const handleOpenWorkOrderModal = (alert: AlertNotification) => {
    setSelectedAlert(alert);
    setWorkOrderForm({
      assignedTechnician: 'Marcus Vance (Chief Engineer)',
      priority: alert.severity === 'critical' ? 'Urgent' : 'High',
      customInstructions: `Inspect sensor triggers for ${alert.equipmentName}. Remediate root cause: ${alert.title}.`,
    });
    setIsWorkOrderModalOpen(true);
  };

  const handleConfirmWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      await createWorkOrderFromAlertApi(selectedAlert.id, workOrderForm);
      setIsWorkOrderModalOpen(false);
      setSelectedAlert(null);
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (e) {
      console.warn('Work order dispatch failed', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlertApi(id);
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (e) {
      console.warn('Delete alert failed', e);
    }
  };

  const handleBulkAction = async (action: 'acknowledge_all' | 'resolve_all' | 'clear_resolved') => {
    try {
      await bulkAlertActionApi(action);
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (e) {
      console.warn('Bulk action failed', e);
    }
  };

  const handleTriggerDetection = async () => {
    setIsScanning(true);
    try {
      await triggerTelemetryDetectionApi();
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendAlertApi({
        title: newAlertForm.title,
        message: newAlertForm.message,
        severity: newAlertForm.severity,
        category: newAlertForm.category,
        equipmentId: newAlertForm.equipmentId,
        equipmentName: newAlertForm.equipmentName,
        channel: newAlertForm.channel,
        recipient: newAlertForm.recipient,
        detectionSource: 'Manual Operator Dispatch',
        metricTrigger: 'Condition alert flagged from console',
      });
      setIsCreateModalOpen(false);
      setNewAlertForm({
        title: '',
        message: '',
        severity: 'warning',
        category: 'maintenance',
        equipmentId: 'CHILLER-02',
        equipmentName: 'Centrifugal Water Chiller CH-02',
        channel: 'Slack #facility-alerts & Push Notification',
        recipient: 'Operations Center Lead',
      });
      await loadAlertsData();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (e) {
      console.warn('Create alert failed', e);
    }
  };

  const handleRunAiDiagnosis = async (alert: AlertNotification) => {
    setIsDiagnosing(true);
    try {
      const prompt = `Analyze this facility alert and provide immediate diagnostic root cause and recommended remediation:
Equipment: ${alert.equipmentName} (${alert.equipmentId})
Severity: ${alert.severity}
Trigger Metric: ${alert.metricTrigger || alert.title}
Detail: ${alert.message || alert.body}
Category: ${alert.category}`;

      const res = await queryAiAgentApi(prompt, alert.category === 'energy' ? 'energy' : 'maintenance');
      setAiDiagnosis({
        alertId: alert.id,
        response: res.response || res.message || 'AI root-cause evaluation generated successfully.',
      });
    } catch (e) {
      setAiDiagnosis({
        alertId: alert.id,
        response: 'AI diagnostics could not complete evaluation. Check backend connection.',
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Bell className="w-6 h-6 animate-pulse text-amber-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Alerts & Workflow Automation Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                  End-to-End Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Live sensor anomaly detection, multi-channel broadcast dispatch, technician workflows, and resolution audits.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleTriggerDetection}
              disabled={isScanning}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              <Activity className={`w-4 h-4 text-indigo-200 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Telemetry...' : 'Run Telemetry Detection'}</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              <span>Dispatch Alert</span>
            </button>

            <button
              onClick={loadAlertsData}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Flow Visualization Banner: Telemetry/Data -> Detection -> Alert -> Notification -> User Action -> Resolution */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>Autonomous Closed-Loop Operational Lifecycle</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">ISO 10816 & ASHRAE Standard Compliance</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Step 1: Telemetry */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>STEP 1</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Telemetry Data</div>
              <div className="text-[10px] text-slate-400 mt-0.5">24 Sensor Streams</div>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
              Vibration • CO2 • kW
            </div>
          </div>

          {/* Step 2: Detection */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>STEP 2</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Anomaly Detection</div>
              <div className="text-[10px] text-slate-400 mt-0.5">FFT & Threshold Limits</div>
            </div>
            <div className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
              98.4% Precision
            </div>
          </div>

          {/* Step 3: Alert */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>STEP 3</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Alert Classification</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Critical, Warning, Info</div>
            </div>
            <div className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
              {counts.total} Recorded
            </div>
          </div>

          {/* Step 4: Notification */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>STEP 4</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Dispatch Broadcast</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Slack, SMS, Email, Push</div>
            </div>
            <div className="text-[10px] text-blue-300 font-mono font-bold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">
              100% Delivery Rate
            </div>
          </div>

          {/* Step 5: User Action */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>STEP 5</span>
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Operator Action</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Acknowledge / Dispatch WO</div>
            </div>
            <div className="text-[10px] text-purple-300 font-mono font-bold bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
              Assigned Tickets
            </div>
          </div>

          {/* Step 6: Resolution */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>STEP 6</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-xs">Audit & Resolution</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Root Cause Closure</div>
            </div>
            <div className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              MTTR: 24.5 mins
            </div>
          </div>
        </div>
      </div>

      {/* 3. Severity Counters & Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Critical */}
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedSeverity === 'critical'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-102'
              : 'bg-rose-50/80 hover:bg-rose-100/70 border-rose-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono uppercase">
            <span className={selectedSeverity === 'critical' ? 'text-rose-100' : 'text-rose-700'}>
              Critical
            </span>
            <ShieldAlert className={`w-4 h-4 ${selectedSeverity === 'critical' ? 'text-white' : 'text-rose-600 animate-pulse'}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-1">{counts.critical}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${selectedSeverity === 'critical' ? 'text-rose-100' : 'text-rose-600'}`}>
            Requires immediate response
          </div>
        </div>

        {/* Warning */}
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'warning' ? 'all' : 'warning')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedSeverity === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-102 font-bold'
              : 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono uppercase">
            <span className={selectedSeverity === 'warning' ? 'text-amber-950' : 'text-amber-700'}>
              Warning
            </span>
            <AlertTriangle className={`w-4 h-4 ${selectedSeverity === 'warning' ? 'text-slate-950' : 'text-amber-600'}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-1">{counts.warning}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${selectedSeverity === 'warning' ? 'text-amber-900' : 'text-amber-600'}`}>
            Threshold deviation
          </div>
        </div>

        {/* Info */}
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'info' ? 'all' : 'info')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedSeverity === 'info'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-102'
              : 'bg-blue-50/80 hover:bg-blue-100/70 border-blue-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono uppercase">
            <span className={selectedSeverity === 'info' ? 'text-blue-100' : 'text-blue-700'}>
              Info
            </span>
            <Info className={`w-4 h-4 ${selectedSeverity === 'info' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-1">{counts.info}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${selectedSeverity === 'info' ? 'text-blue-100' : 'text-blue-600'}`}>
            Advisory & setpoint shifts
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'resolved' ? 'all' : 'resolved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedSeverity === 'resolved'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102'
              : 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono uppercase">
            <span className={selectedSeverity === 'resolved' ? 'text-emerald-100' : 'text-emerald-700'}>
              Resolved
            </span>
            <CheckCircle2 className={`w-4 h-4 ${selectedSeverity === 'resolved' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-1">{counts.resolved}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${selectedSeverity === 'resolved' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Verified & closed out
          </div>
        </div>

        {/* Unacknowledged */}
        <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-900">
          <div className="flex items-center justify-between text-xs font-bold font-mono uppercase text-slate-500">
            <span>Pending Ack</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-cyan-700">{counts.unacknowledged}</div>
          <div className="text-[10px] font-medium mt-0.5 text-slate-500">
            Awaiting operator review
          </div>
        </div>

        {/* MTTR */}
        <div className="p-4 rounded-xl border bg-slate-900 text-white border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold font-mono uppercase text-slate-400">
            <span>Avg MTTR</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-cyan-300">24.5m</div>
          <div className="text-[10px] font-medium mt-0.5 text-slate-400">
            Mean resolution time
          </div>
        </div>
      </div>

      {/* 4. Controls: Search, Filters & Bulk Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ALERTS, EQUIPMENT ID, SENSOR TRIGGERS, CHANNELS..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 font-mono uppercase placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {counts.unacknowledged > 0 && (
              <button
                onClick={() => handleBulkAction('acknowledge_all')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Acknowledge All</span>
              </button>
            )}

            <button
              onClick={() => handleBulkAction('clear_resolved')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Resolved</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">
              Severity:
            </span>
            {(['all', 'critical', 'warning', 'info', 'resolved'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">
              Category:
            </span>
            {(['all', 'maintenance', 'energy', 'occupancy', 'security'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Alerts Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-mono text-xs">
            <Activity className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-2" />
            <div>Synchronizing alert streams and telemetry logs...</div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-mono text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-700 text-sm">No Active Alerts Found</div>
            <div className="text-slate-400 mt-1">
              All facility equipment and energy loops are operating within nominal thresholds.
            </div>
          </div>
        ) : (
          alerts.map((alert) => {
            const isResolved = alert.severity === 'resolved' || alert.resolved || alert.status === 'Resolved';
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl p-5 transition-all space-y-4 shadow-2xs ${
                  isResolved
                    ? 'border-slate-200/80 bg-slate-50/50'
                    : isCritical
                    ? 'border-rose-300 shadow-xs'
                    : isWarning
                    ? 'border-amber-300'
                    : 'border-blue-300'
                }`}
              >
                {/* Top Row: Severity, ID, Category, Timestamp, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCritical
                          ? 'bg-rose-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isResolved ? 'Resolved' : alert.severity}
                    </span>

                    <span className="font-mono text-xs font-black text-slate-900">
                      #{alert.id}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {alert.category || 'Maintenance'}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                      {alert.status || (alert.acknowledged ? 'Acknowledged' : 'Active')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{alert.timestamp}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete Alert Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left 2 Cols: Title, Message, Detection Source & Triggers */}
                  <div className="lg:col-span-2 space-y-2.5">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      {alert.title || alert.subject}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {alert.message || alert.body}
                    </p>

                    {/* Sensor Trigger Context */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold text-slate-900">
                          ⚙️ {alert.equipmentName || alert.equipmentId}
                        </span>
                        <span className="text-slate-500">{alert.detectionSource || 'Live Telemetry Engine'}</span>
                      </div>

                      {alert.metricTrigger && (
                        <div className="text-rose-700 font-bold">
                          🎯 Threshold Trigger: {alert.metricTrigger}
                        </div>
                      )}

                      <div className="text-slate-500 text-[11px]">
                        📡 Channel: {alert.channel || 'Slack #facility-alerts & Push Notification'} • Recipient: {alert.recipient || 'Operations Lead'}
                      </div>

                      {isResolved && alert.resolutionNotes && (
                        <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 text-xs mt-2">
                          <span className="font-bold">✓ Resolution Log:</span> {alert.resolutionNotes} (by {alert.resolvedBy || 'Operator'} at {alert.resolvedAt || 'Recent'})
                        </div>
                      )}

                      {alert.workOrderId && (
                        <div className="p-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-xs flex items-center justify-between mt-2">
                          <span>Linked Work Order: <strong className="font-mono">{alert.workOrderId}</strong></span>
                          {onNavigateToWorkOrders && (
                            <button
                              onClick={onNavigateToWorkOrders}
                              className="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                            >
                              View Ticket →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Col: Actions & Lifecycle Controls */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                      Operator Response Actions
                    </div>

                    <div className="space-y-2">
                      {!alert.acknowledged && !isResolved && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Acknowledge Alert</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          onClick={() => handleOpenWorkOrderModal(alert)}
                          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Dispatch Work Order</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          onClick={() => handleOpenResolveModal(alert)}
                          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleRunAiDiagnosis(alert)}
                        disabled={isDiagnosing}
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>AI Root-Cause Diagnostics</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono text-center">
                      {alert.acknowledged ? `Acknowledged by ${alert.acknowledgedBy || 'Operator'}` : 'Unacknowledged'}
                    </div>
                  </div>
                </div>

                {/* AI Diagnostics Drawer if open for this alert */}
                {aiDiagnosis && aiDiagnosis.alertId === alert.id && (
                  <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-extrabold text-cyan-950">
                      <div className="flex items-center space-x-1.5">
                        <Bot className="w-4 h-4 text-cyan-700" />
                        <span>FacilityOps AI Root Cause & Remediation Guide</span>
                      </div>
                      <button
                        onClick={() => setAiDiagnosis(null)}
                        className="p-1 text-cyan-800 hover:text-cyan-950 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                      {aiDiagnosis.response}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Create & Dispatch Manual Alert */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Dispatch Operational Alert & Notification
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alert Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Condenser Pressure Deviation: Chiller CH-02"
                  value={newAlertForm.title}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={newAlertForm.severity}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, severity: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-cyan-600"
                  >
                    <option value="critical">Critical (Immediate Response)</option>
                    <option value="warning">Warning (Threshold Spike)</option>
                    <option value="info">Info (Advisory / Setpoint)</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAlertForm.category}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-cyan-600"
                  >
                    <option value="maintenance">Maintenance & Health</option>
                    <option value="energy">Energy & Tariffs</option>
                    <option value="occupancy">Occupancy & IAQ</option>
                    <option value="security">Security & Access</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Affected Equipment Asset</label>
                <select
                  value={newAlertForm.equipmentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const names: Record<string, string> = {
                      'CHILLER-02': 'Centrifugal Water Chiller CH-02',
                      'AHU-04': 'Air Handling Unit AHU-04',
                      'COOLING-TWR-01': 'Induced Draft Cooling Tower CT-01',
                      'PUMP-01': 'Chilled Water Circulation Pump P-01',
                      'GW-ESP32-POWER-MAIN': 'Substation Transformer 2',
                    };
                    setNewAlertForm({
                      ...newAlertForm,
                      equipmentId: id,
                      equipmentName: names[id] || id,
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-cyan-600"
                >
                  <option value="CHILLER-02">CHILLER-02 — Centrifugal Water Chiller CH-02</option>
                  <option value="AHU-04">AHU-04 — Air Handling Unit AHU-04</option>
                  <option value="COOLING-TWR-01">COOLING-TWR-01 — Induced Draft Cooling Tower CT-01</option>
                  <option value="PUMP-01">PUMP-01 — Chilled Water Circulation Pump P-01</option>
                  <option value="GW-ESP32-POWER-MAIN">GW-ESP32-POWER-MAIN — Substation Transformer 2</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description / Telemetry Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe anomalous reading, harmonic vibration peak, or temperature excursion..."
                  value={newAlertForm.message}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch Channel</label>
                  <input
                    type="text"
                    value={newAlertForm.channel}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, channel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient</label>
                  <input
                    type="text"
                    value={newAlertForm.recipient}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, recipient: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Dispatch Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Resolve Alert Modal */}
      {isResolveModalOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Resolve Facility Alert #{selectedAlert.id}
                </h3>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3.5 text-xs font-sans">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900">{selectedAlert.title}</div>
                <div className="text-slate-600 mt-0.5">{selectedAlert.equipmentName}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Findings & Corrective Action</label>
                <textarea
                  rows={3}
                  required
                  value={resolveForm.notes}
                  onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolved By</label>
                <input
                  type="text"
                  required
                  value={resolveForm.resolvedBy}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolvedBy: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Dispatch Work Order from Alert */}
      {isWorkOrderModalOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Generate Maintenance Work Order
                </h3>
              </div>
              <button
                onClick={() => setIsWorkOrderModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmWorkOrder} className="space-y-3.5 text-xs font-sans">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="text-[10px] font-mono text-blue-800 font-bold uppercase">Trigger Alert #{selectedAlert.id}</div>
                <div className="font-extrabold text-slate-900 mt-0.5">{selectedAlert.title}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{selectedAlert.equipmentName}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Lead Technician</label>
                <select
                  value={workOrderForm.assignedTechnician}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, assignedTechnician: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                >
                  <option value="Marcus Vance (Chief Engineer)">Marcus Vance (Chief Engineer)</option>
                  <option value="Dave Miller (Senior HVAC Tech)">Dave Miller (Senior HVAC Tech)</option>
                  <option value="Sarah Jenkins (Controls Engineer)">Sarah Jenkins (Controls Engineer)</option>
                  <option value="Elena Rostova (Electrical Specialist)">Elena Rostova (Electrical Specialist)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ticket Priority</label>
                <select
                  value={workOrderForm.priority}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, priority: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                >
                  <option value="Urgent">Urgent (4-hr SLA)</option>
                  <option value="High">High (24-hr SLA)</option>
                  <option value="Medium">Medium (Scheduled PM)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Instructions</label>
                <textarea
                  rows={3}
                  value={workOrderForm.customInstructions}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, customInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWorkOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Dispatch Technician</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
