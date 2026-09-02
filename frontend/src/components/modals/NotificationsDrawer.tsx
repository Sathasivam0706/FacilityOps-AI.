import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Filter,
  Trash2,
  Check,
  CheckCheck,
  ExternalLink,
  Activity,
  Send,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AlertNotification } from '../../types';
import { acknowledgeAlertApi, resolveAlertApi, bulkAlertActionApi, triggerTelemetryDetectionApi } from '../../api/client';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertNotification[];
  onRefreshAlerts: () => void;
  onNavigateToAlertsModule?: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onRefreshAlerts,
  onNavigateToAlertsModule,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'resolved'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const filtered = alerts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return a.severity === 'resolved' || a.resolved || a.status === 'Resolved';
    return a.severity === filter && !a.resolved && a.status !== 'Resolved';
  });

  const unreadCount = alerts.filter((a) => !a.acknowledged && !a.resolved).length;

  const handleAcknowledge = async (id: string) => {
    setProcessingId(id);
    try {
      await acknowledgeAlertApi(id);
      onRefreshAlerts();
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    setProcessingId(id);
    try {
      await resolveAlertApi(id, {
        notes: 'Acknowledged and marked resolved from quick notifications stream.',
        resolvedBy: 'Operator',
      });
      onRefreshAlerts();
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await bulkAlertActionApi('acknowledge_all');
      onRefreshAlerts();
    } catch (e) {
      console.warn('Bulk acknowledge failed', e);
    }
  };

  const handleClearResolved = async () => {
    try {
      await bulkAlertActionApi('clear_resolved');
      onRefreshAlerts();
    } catch (e) {
      console.warn('Clear resolved failed', e);
    }
  };

  const handleScanTelemetry = async () => {
    setIsScanning(true);
    try {
      await triggerTelemetryDetectionApi();
      onRefreshAlerts();
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity font-sans">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <Bell className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-extrabold text-white">
                  Operational Alert Stream
                </h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                    {unreadCount} Unacknowledged
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Real-time telemetry spikes & dispatch workflow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {onNavigateToAlertsModule && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToAlertsModule();
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Open Full Alerts & Workflows Module"
              >
                <span>Full Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 text-xs font-bold">
          {/* Severity Filters */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {(['all', 'critical', 'warning', 'info', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  filter === f
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? `All (${alerts.length})` : f}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleAcknowledgeAll}
                className="text-[10px] text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-0.5 cursor-pointer"
                title="Acknowledge all pending alerts"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Ack All</span>
              </button>
            )}
            <button
              onClick={handleClearResolved}
              className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
              title="Clear resolved alerts"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Resolved</span>
            </button>
          </div>
        </div>

        {/* Telemetry Detection Trigger Banner */}
        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Activity className={`w-3.5 h-3.5 text-indigo-600 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="text-[11px] text-indigo-950 font-semibold">
              Live Sensor Anomaly Scanner
            </span>
          </div>
          <button
            onClick={handleScanTelemetry}
            disabled={isScanning}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-cyan-200" />
            <span>{isScanning ? 'Evaluating...' : 'Run Detection'}</span>
          </button>
        </div>

        {/* Alert Stream Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-mono text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="font-bold text-slate-700">No matching alerts in this view.</div>
              <div className="text-[11px] mt-1 text-slate-400">
                All facility equipment and telemetry loops operating within normal boundaries.
              </div>
            </div>
          ) : (
            filtered.map((alert) => {
              const isResolved = alert.severity === 'resolved' || alert.resolved || alert.status === 'Resolved';
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs space-y-2.5 shadow-2xs ${
                    isResolved
                      ? 'bg-slate-100/80 border-slate-200 text-slate-500 opacity-80'
                      : isCritical
                      ? 'bg-rose-50/90 border-rose-200 text-slate-900'
                      : isWarning
                      ? 'bg-amber-50/90 border-amber-200 text-slate-900'
                      : 'bg-blue-50/90 border-blue-200 text-slate-900'
                  }`}
                >
                  {/* Top Bar: Severity Badge, ID, Timestamp */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCritical
                            ? 'bg-rose-600 text-white'
                            : isWarning
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isResolved ? 'Resolved' : alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        #{alert.id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  {/* Title & Message */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs">
                      {alert.title || alert.subject}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium mt-1">
                      {alert.message || alert.body}
                    </p>
                  </div>

                  {/* Equipment & Detection Trigger Context */}
                  <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60 text-[10px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">{alert.equipmentName || alert.equipmentId}</span>
                      <span className="text-slate-500 uppercase">{alert.category}</span>
                    </div>
                    {alert.metricTrigger && (
                      <div className="text-rose-700 font-semibold truncate">
                        🎯 {alert.metricTrigger}
                      </div>
                    )}
                    {alert.channel && (
                      <div className="text-slate-500 truncate">
                        📢 {alert.channel}
                      </div>
                    )}
                    {isResolved && alert.resolutionNotes && (
                      <div className="text-emerald-700 font-semibold border-t border-slate-100 pt-1">
                        ✓ {alert.resolutionNotes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Acknowledge / Resolve / Console */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && !isResolved && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={processingId === alert.id}
                          className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{processingId === alert.id ? 'Saving...' : 'Acknowledge'}</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={processingId === alert.id}
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>

                    {onNavigateToAlertsModule && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToAlertsModule();
                        }}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-0.5 cursor-pointer text-[10px]"
                      >
                        <span>Manage in Workflows</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Flow: Telemetry → Detection → Alert → Action → Resolution</span>
          <span className="font-bold text-slate-700">{alerts.length} Total Logs</span>
        </div>
      </div>
    </div>
  );
};
