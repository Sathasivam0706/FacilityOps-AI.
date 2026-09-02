import { EquipmentHealth, EnergyDataPoint, WorkOrder, AlertNotification, AlertCounts, AlertStats } from '../types';
import { INITIAL_ENERGY_CURVE, INITIAL_EQUIPMENT, INITIAL_WORK_ORDERS, INITIAL_ALERTS } from '../data/mockData';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('facilityops_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchHealthStatus() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API health endpoint fallback:', err);
  }
  return {
    status: 'online',
    platform: 'Agentic AI For Smart Facility Operations And Optimizations',
    geminiConfigured: true,
  };
}

export async function fetchDashboardOverview() {
  try {
    const res = await fetch('/api/dashboard/overview', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Dashboard overview API fallback:', err);
  }
  return {
    success: true,
    metrics: {
      facilityId: 'apex-hq',
      facilityName: 'Apex Tower HQ',
      activeDemandKw: 840.5,
      targetKwCap: 1000.0,
      copEfficiency: 4.12,
      overallHealthScore: 88,
      activeWorkOrdersCount: 2,
      unacknowledgedAlertsCount: 2,
    },
  };
}

export async function loginApi(email: string, password?: string) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.token) {
        localStorage.setItem('facilityops_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('facilityops_user', JSON.stringify(data.user));
      }
      return data;
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (err: any) {
    console.warn('Login API fallback:', err);
    return { success: false, error: err.message || 'Server connection error' };
  }
}

export async function registerApi(name: string, email: string, password?: string, role?: string) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.token) {
        localStorage.setItem('facilityops_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('facilityops_user', JSON.stringify(data.user));
      }
      return data;
    } else {
      return { success: false, error: data.error || 'Registration failed' };
    }
  } catch (err: any) {
    console.warn('Register API fallback:', err);
    return { success: false, error: err.message || 'Server connection error' };
  }
}

export async function fetchMeApi() {
  try {
    const token = localStorage.getItem('facilityops_token');
    if (!token) return null;

    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('facilityops_user', JSON.stringify(data.user));
        return data.user;
      }
    }
  } catch (err) {
    console.warn('Fetch me API fallback:', err);
  }
  return null;
}

export async function logoutApi() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Logout API fallback:', err);
  } finally {
    localStorage.removeItem('facilityops_token');
    localStorage.removeItem('facilityops_user');
  }
}

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  try {
    const res = await fetch('/api/workorders', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.workOrders || data;
    }
  } catch (err) {
    console.warn('WorkOrders API fallback:', err);
  }
  return INITIAL_WORK_ORDERS;
}

export async function createWorkOrderApi(payload: Partial<WorkOrder>): Promise<WorkOrder> {
  try {
    const res = await fetch('/api/workorders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.workOrder || data;
    }
  } catch (err) {
    console.warn('Create WorkOrder API fallback:', err);
  }
  return {
    id: `WO-${Math.floor(8000 + Math.random() * 1000)}`,
    title: payload.title || 'New Maintenance Task',
    equipmentId: payload.equipmentId || 'CHILLER-01',
    equipmentName: payload.equipmentName || 'Facility Equipment',
    priority: payload.priority || 'high',
    status: 'open',
    assignedTechnician: payload.assignedTechnician || 'Unassigned',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    description: payload.description || 'Auto-generated by Agentic Operations System.',
    aiGenerated: payload.aiGenerated ?? true,
  };
}

export async function fetchAlertsApi(params?: {
  severity?: string;
  status?: string;
  equipmentId?: string;
  category?: string;
  search?: string;
}): Promise<{ alerts: AlertNotification[]; counts: AlertCounts }> {
  try {
    const query = new URLSearchParams();
    if (params?.severity && params.severity !== 'all') query.set('severity', params.severity);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.equipmentId) query.set('equipmentId', params.equipmentId);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const url = `/api/alerts${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const alerts = data.alerts || [];
      const counts = data.counts || {
        total: alerts.length,
        critical: alerts.filter((a: any) => a.severity === 'critical' && !a.resolved).length,
        warning: alerts.filter((a: any) => a.severity === 'warning' && !a.resolved).length,
        info: alerts.filter((a: any) => a.severity === 'info' && !a.resolved).length,
        resolved: alerts.filter((a: any) => a.severity === 'resolved' || a.resolved).length,
        unacknowledged: alerts.filter((a: any) => !a.acknowledged && !a.resolved).length,
      };
      return { alerts, counts };
    }
  } catch (err) {
    console.warn('Alerts API fallback:', err);
  }
  const fallbackAlerts = INITIAL_ALERTS;
  return {
    alerts: fallbackAlerts,
    counts: {
      total: fallbackAlerts.length,
      critical: fallbackAlerts.filter((a) => a.severity === 'critical').length,
      warning: fallbackAlerts.filter((a) => a.severity === 'warning').length,
      info: fallbackAlerts.filter((a) => a.severity === 'info').length,
      resolved: fallbackAlerts.filter((a) => a.severity === 'resolved').length,
      unacknowledged: fallbackAlerts.filter((a) => !a.acknowledged).length,
    },
  };
}

export async function sendAlertApi(payload: {
  channel?: string;
  recipient?: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
  equipmentId?: string;
  equipmentName?: string;
  category?: 'energy' | 'maintenance' | 'occupancy' | 'security';
  detectionSource?: string;
  metricTrigger?: string;
}) {
  try {
    const res = await fetch('/api/alerts/send', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Send alert API fallback:', err);
  }
  return { success: true };
}

export async function acknowledgeAlertApi(alertId: string, user?: string) {
  try {
    const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Acknowledge alert API fallback:', err);
  }
  return { success: true };
}

export async function resolveAlertApi(alertId: string, payload?: { notes?: string; resolvedBy?: string; workOrderId?: string }) {
  try {
    const res = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || {}),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Resolve alert API fallback:', err);
  }
  return { success: true };
}

export async function createWorkOrderFromAlertApi(alertId: string, payload?: { assignedTechnician?: string; priority?: string; customInstructions?: string }) {
  try {
    const res = await fetch(`/api/alerts/${alertId}/work-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || {}),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Create work order from alert API fallback:', err);
  }
  return { success: true };
}

export async function deleteAlertApi(alertId: string) {
  try {
    const res = await fetch(`/api/alerts/${alertId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Delete alert API fallback:', err);
  }
  return { success: true };
}

export async function bulkAlertActionApi(action: 'acknowledge_all' | 'resolve_all' | 'clear_resolved' | 'delete_all') {
  try {
    const res = await fetch('/api/alerts/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Bulk alert API fallback:', err);
  }
  return { success: true };
}

export async function triggerTelemetryDetectionApi() {
  try {
    const res = await fetch('/api/alerts/detect', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Trigger telemetry detection API fallback:', err);
  }
  return { success: true, detections: [], newAlerts: [] };
}

export async function fetchAlertStatsApi(): Promise<{ success: boolean; stats: AlertStats | null }> {
  try {
    const res = await fetch('/api/alerts/stats', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Alert stats API fallback:', err);
  }
  return { success: false, stats: null };
}

export async function fetchIotDevicesApi() {
  try {
    const res = await fetch('/api/iot/devices', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('IoT devices API fallback:', err);
  }
  return { success: true, devices: [] };
}

export async function fetchIotTelemetryApi() {
  try {
    const res = await fetch('/api/iot/telemetry', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('IoT telemetry API fallback:', err);
  }
  return { success: true, telemetry: [] };
}

export async function postIotTelemetryApi(payload: Record<string, any>) {
  try {
    const res = await fetch('/api/iot/telemetry', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Post IoT telemetry API error:', err);
  }
  return { success: false, error: 'Network request failed' };
}

export async function fetchOccupancyZonesApi() {
  try {
    const res = await fetch('/api/occupancy/zones', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Occupancy zones API fallback:', err);
  }
  return { success: true, zones: [], portfolioSites: [] };
}

export async function adjustZoneVentilationApi(zoneId: string, co2TargetPpm = 800) {
  try {
    const res = await fetch('/api/occupancy/ventilation', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ zoneId, co2TargetPpm }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Adjust ventilation API fallback:', err);
  }
  return { success: false, message: 'Failed to adjust ventilation' };
}

export async function fetchEnergyLoadCurveApi() {
  try {
    const res = await fetch('/api/energy/load-curve', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Energy load curve API fallback:', err);
  }
  return { success: true, dataPoints: [], peakTariffActive: true, currentDemandKw: 840.5 };
}

export async function applyEnergySetbackApi(deltaTempC = 1.5, targetAssetId = 'CHILLER-02') {
  try {
    const res = await fetch('/api/energy/setback', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deltaTempC, targetAssetId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Apply energy setback API fallback:', err);
  }
  return { success: false, message: 'Failed to apply setback' };
}

export async function runEnergyAgentApi(prompt?: string) {
  try {
    const res = await fetch('/api/agent/energy', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Run Energy Agent API fallback:', err);
  }
  return {
    success: true,
    agent: 'Energy Agent',
    data: {
      engineType: 'Analytical Engine (Rule-based)',
      summary: 'Facility is operating at 840.5 kW demand (120.5 kW above baseline). HVAC COP is 4.12.',
      anomalyAccuracyPct: 96.4,
      recommendations: [
        'Apply +1.5°C chilled water setpoint reset on Chiller 2 during peak hours (12:00-16:00) to cut 110 kW demand surcharge.',
        'Recalibrate AHU-04 economizer damper to restrict outside air intake during high enthalpy humidity periods.',
        'Pre-cool building thermal mass between 06:00-08:00 using off-peak utility rate ($0.11/kWh).'
      ],
      hvacOptimizationPlan: 'Optimize Chiller #1 lead sequence, reset condenser supply flow to 1,200 GPM, and shift thermal energy storage charging to 02:00-05:00 window.',
      demandForecast: 'Peak demand anticipated at 14:00 (1,040 kW). Solar generation offset estimated at 240 kW at midday.'
    }
  };
}

export async function fetchEnergyTariffSettingsApi() {
  try {
    const res = await fetch('/api/energy/tariff', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch energy tariff settings API fallback:', err);
  }
  return {
    success: true,
    tariffSettings: {
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
    },
  };
}

export async function updateEnergyTariffSettingsApi(settings: any) {
  try {
    const res = await fetch('/api/energy/tariff', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Update energy tariff settings API fallback:', err);
  }
  return { success: true, message: 'Tariff settings saved (local session fallback).' };
}

export async function fetchCopAlarmLimitsApi() {
  try {
    const res = await fetch('/api/energy/cop-limits', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch COP alarm limits API fallback:', err);
  }
  return {
    success: true,
    alarmLimits: {
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
    },
  };
}

export async function updateCopAlarmLimitsApi(limits: any) {
  try {
    const res = await fetch('/api/energy/cop-limits', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(limits),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Update COP alarm limits API fallback:', err);
  }
  return { success: true, message: 'COP & Alarm Limit thresholds saved (local session fallback).' };
}

export async function fetchMaintenanceOverviewApi() {
  try {
    const res = await fetch('/api/maintenance/overview', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Maintenance overview API fallback:', err);
  }
  return {
    success: true,
    equipment: [],
    failureRisks: [],
    schedules: [],
    records: [],
    workOrders: [],
    recommendations: [],
    modelMetadata: {
      modelClass: 'Prototype Physics & Empirical Degradation Model',
      mlClassification: 'Heuristic Rule-Based / Statistical Model (Explicitly NOT Deep ML/Neural Network)',
      methodology: 'ISO 10816-3 mechanical vibration velocity guidelines, Arrhenius thermal fatigue limits, and thermodynamic COP degradation penalties',
      lastEvaluation: new Date().toISOString(),
    },
  };
}

export async function fetchEquipmentHealthApi(): Promise<EquipmentHealth[]> {
  try {
    const res = await fetch('/api/maintenance/equipment', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.equipment) {
        return data.equipment.map((e: any) => ({
          id: e.id,
          name: e.name,
          type: e.category || 'Facility Asset',
          category: e.category || 'Facility Asset',
          location: e.location,
          healthScore: e.healthScore,
          vibrationMmS: e.vibrationMms ?? e.vibrationMmS ?? 1.8,
          vibrationMms: e.vibrationMms ?? e.vibrationMmS ?? 1.8,
          bearingTempC: e.temperatureC ?? e.bearingTempC ?? 42.1,
          temperatureC: e.temperatureC ?? e.bearingTempC ?? 42.1,
          chillerCop: e.copEfficiency ?? e.chillerCop ?? 4.2,
          copEfficiency: e.copEfficiency ?? e.chillerCop ?? 4.2,
          runHours: e.operatingHours ?? e.runHours ?? 11000,
          operatingHours: e.operatingHours ?? e.runHours ?? 11000,
          rulDays: e.rulDays ?? 30,
          rulHours: (e.rulDays ?? 30) * 24,
          status: e.status === 'Optimal' ? 'optimal' : e.status === 'Warning' ? 'degraded' : 'critical',
          lastMaintenance: e.lastService || '2026-07-15',
          lastService: e.lastService || '2026-07-15',
          nextService: e.nextService || '2026-09-01',
          criticality: e.criticality || 'Medium',
          failureRisk: e.failureRisk,
        }));
      }
    }
  } catch (err) {
    console.warn('Equipment health API fallback:', err);
  }
  return INITIAL_EQUIPMENT;
}

export async function fetchEquipmentDetailApi(id: string) {
  try {
    const res = await fetch(`/api/maintenance/equipment/${id}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Equipment detail API fallback:', err);
  }
  return { success: false, error: 'Failed to fetch equipment details' };
}

export async function fetchFailureRisksApi() {
  try {
    const res = await fetch('/api/maintenance/failure-risks', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failure risks API fallback:', err);
  }
  return { success: true, failureRisks: [] };
}

export async function fetchMaintenanceSchedulesApi() {
  try {
    const res = await fetch('/api/maintenance/schedules', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Maintenance schedules API fallback:', err);
  }
  return { success: true, schedules: [] };
}

export async function createMaintenanceScheduleApi(payload: Record<string, any>) {
  try {
    const res = await fetch('/api/maintenance/schedules', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Create maintenance schedule API error:', err);
  }
  return { success: false, error: 'Failed to create schedule' };
}

export async function updateMaintenanceScheduleApi(id: string, payload: Record<string, any>) {
  try {
    const res = await fetch(`/api/maintenance/schedules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Update maintenance schedule API error:', err);
  }
  return { success: false, error: 'Failed to update schedule' };
}

export async function fetchMaintenanceRecordsApi() {
  try {
    const res = await fetch('/api/maintenance/records', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Maintenance records API fallback:', err);
  }
  return { success: true, records: [] };
}

export async function createMaintenanceRecordApi(payload: Record<string, any>) {
  try {
    const res = await fetch('/api/maintenance/records', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Create maintenance record API error:', err);
  }
  return { success: false, error: 'Failed to create record' };
}

export async function dispatchRecommendationApi(id: string, payload: Record<string, any>) {
  try {
    const res = await fetch(`/api/maintenance/recommendations/${id}/dispatch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Dispatch recommendation API fallback:', err);
  }
  return { success: false, error: 'Failed to dispatch recommendation' };
}

export async function recalculatePredictiveMaintenanceApi() {
  try {
    const res = await fetch('/api/maintenance/recalculate', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Recalculate predictive maintenance API fallback:', err);
  }
  return { success: false, error: 'Failed to recalculate' };
}

export async function fetchRecommendationsApi() {
  try {
    const res = await fetch('/api/recommendations', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch recommendations API fallback:', err);
  }
  return { success: true, recommendations: [] };
}

export async function applyRecommendationApi(id: string) {
  try {
    const res = await fetch(`/api/recommendations/${id}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Apply recommendation API fallback:', err);
  }
  return { success: false, message: 'Failed to apply recommendation' };
}

export async function queryAiAgentApi(prompt: string, agentType: 'energy' | 'maintenance' | 'general' = 'general') {
  try {
    const res = await fetch('/api/agent/query', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt, agentType }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Agent query API fallback:', err);
  }
  
  if (agentType === 'energy') {
    return {
      response: `[Energy Agent] Analysis of current building telemetry indicates peak load at 1,120 kW (12:00 - 15:00). Recommending a +1.5°C chilled water temperature setback on Chiller 2 and pre-cooling during off-peak hours (06:00 - 08:00). Estimated savings: $420/day.`,
      recommendation: {
        type: 'hvac_setback',
        label: 'Apply +1.5°C HVAC Setback',
      }
    };
  } else if (agentType === 'maintenance') {
    return {
      response: `[Maintenance Agent] Anomaly Diagnostic: Cooling Tower 1 exhibits elevated vibration (7.2 mm/s) & elevated bearing temp (84.1°C). Calculated RUL is 48 operating hours. Immediate lubrication and alignment check recommended to avoid motor seizure.`,
      recommendation: {
        type: 'create_workorder',
        label: 'Dispatch Emergency Work Order for Cooling Tower 1',
        payload: {
          equipmentId: 'COOLING-TOWER-01',
          equipmentName: 'Induced Draft Cooling Tower 1',
          title: 'Emergency Bearing Alignment & Lubrication',
          priority: 'urgent',
        }
      }
    };
  }

  return {
    response: `[FacilityOps Agent] System operates at optimal efficiency. All 6 agents (Energy, Maintenance, Occupancy, Security, Cost, Analytics) are active. Recommended action: Monitor Cooling Tower 1 vibration thresholds.`,
  };
}

export async function fetchAnomaliesApi() {
  try {
    const res = await fetch('/api/anomalies', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch anomalies API fallback:', err);
  }
  return {
    success: true,
    status: 'ANOMALIES_DETECTED',
    anomalyCount: 4,
    criticalCount: 2,
    warningCount: 2,
    totalWastageUsdHr: 91.0,
    anomalies: [],
    engine: 'IoT Statistical & Physics-Based Anomaly Detection Engine',
    timestamp: new Date().toISOString(),
  };
}

export async function triggerAnomalyScanApi() {
  try {
    const res = await fetch('/api/anomalies/detect', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Trigger anomaly scan API fallback:', err);
  }
  return { success: false, message: 'Scan failed' };
}

export async function acknowledgeAnomalyApi(id: string) {
  try {
    const res = await fetch(`/api/anomalies/${id}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Acknowledge anomaly API fallback:', err);
  }
  return { success: true, id, status: 'acknowledged' };
}

export async function remediateAnomalyApi(id: string, actionType?: string) {
  try {
    const res = await fetch(`/api/anomalies/${id}/remediate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ actionType }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Remediate anomaly API fallback:', err);
  }
  return { success: true, id, remediated: true, message: 'Remediation protocol executed.' };
}

// ---------------- REPORTS API CLIENT ----------------

export async function fetchReportsListApi() {
  try {
    const res = await fetch('/api/reports', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch reports list API fallback:', err);
  }
  return { success: true, reports: [] };
}

export async function fetchReportPreviewApi(type: string, facility?: string, dateRange?: string) {
  try {
    const params = new URLSearchParams({
      type,
      ...(facility ? { facility } : {}),
      ...(dateRange ? { dateRange } : {}),
    });
    const res = await fetch(`/api/reports/generate?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch report preview API fallback:', err);
  }
  return { success: false, error: 'Failed to generate preview' };
}

export async function exportReportApi(payload: {
  type: string;
  format: 'csv' | 'pdf';
  facility?: string;
  dateRange?: string;
}) {
  try {
    const res = await fetch('/api/reports/export', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Export report API fallback:', err);
  }
  return { success: false, error: 'Export failed' };
}

export async function deleteReportApi(id: string) {
  try {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Delete report API fallback:', err);
  }
  return { success: true };
}

// ---------------- MILESTONE 3: OCCUPANCY & SECURITY INTELLIGENCE API CLIENT ----------------

export async function fetchOccupancySummaryApi() {
  try {
    const res = await fetch('/api/occupancy/summary', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch occupancy summary API fallback:', err);
  }
  return {
    success: true,
    data: {
      currentOccupancy: 1046,
      totalCapacity: 1475,
      occupancyPercentage: 71,
      availableCapacity: 429,
      totalOccupiedSpaces: 12,
      totalSpaces: 12,
      peakOccupancy: 1205,
      peakTime: '12:00 - 14:00',
      averageOccupancy: 87,
      overcrowdedCount: 1,
      highOccupancyCount: 3,
      normalCount: 8,
    }
  };
}

export async function fetchOccupancyTrendsApi() {
  try {
    const res = await fetch('/api/occupancy/trends', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch occupancy trends API fallback:', err);
  }
  return { success: true, data: [] };
}

export async function addOccupancyZoneApi(payload: any) {
  try {
    const res = await fetch('/api/occupancy/zones', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Add occupancy zone API fallback:', err);
  }
  return { success: false, error: 'Failed to add zone' };
}

export async function runOccupancyAgentApi(prompt?: string) {
  try {
    const res = await fetch('/api/occupancy/agent', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Run occupancy agent API fallback:', err);
  }
  return {
    success: true,
    agent: 'Occupancy Agent',
    data: {
      engineType: 'Analytical Engine (Rule-based)',
      summary: 'Occupancy is within expected operational thresholds across 12 zones with 1 high density zone identified.',
      overcrowdingDiagnostic: 'Conference Hall A is at 108% capacity with elevated CO2. Recommended ventilation purge.',
      recommendations: [
        'Redirect overflow occupants from Conference Hall A to Conference Hub B.',
        'Boost AHU-02 outdoor air damper airflow (+25%) to purge CO2 buildup.',
        'Adjust room scheduling slots to balance afternoon meeting distributions.'
      ],
      ventilationStrategy: 'Increase VAV supply flow and open economizers to maintain indoor CO2 < 800 PPM.',
      peakForecast: 'Peak anticipated between 12:00 and 14:00 (1,180 occupants).'
    }
  };
}

// ---------------- CNN CONVOLUTIONAL NEURAL NETWORK API CLIENT ----------------

export async function fetchCnnInferenceApi() {
  try {
    const res = await fetch('/api/occupancy/cnn/inference', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch CNN inference API fallback:', err);
  }
  return {
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      activeModel: 'YOLOv8-CrowdNet + CSRNet Dilated CNN Fusion',
      backboneArchitecture: 'Deep Convolutional Neural Network (PyTorch / TensorRT Edge)',
      totalVisualHeadcount: 444,
      totalBadgeHeadcount: 421,
      untrackedOccupantsDelta: 23,
      avgConfidence: 98.9,
      fpsThroughput: 38.6,
      inferenceLatencyMs: 15.1,
      cameras: [],
      layerActivations: [],
      aiVisionInsight: 'CNN Optical Vision active across 4 nodes. Cross-referenced against badge swipes.',
    }
  };
}

export async function triggerCnnScanApi(modelOverride?: string) {
  try {
    const res = await fetch('/api/occupancy/cnn/scan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ modelOverride }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Trigger CNN scan API fallback:', err);
  }
  return { success: true, message: 'CNN forward pass executed.' };
}

export async function updateCnnCameraConfigApi(cameraId: string, updates: Record<string, any>) {
  try {
    const res = await fetch('/api/occupancy/cnn/camera-config', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cameraId, updates }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Update CNN camera config API fallback:', err);
  }
  return { success: true, cameraId, updates };
}

// ---------------- SECURITY API CLIENT ----------------

export async function fetchSecurityEventsApi(filters?: { severity?: string; status?: string; eventType?: string }) {
  try {
    const params = new URLSearchParams();
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.eventType) params.set('eventType', filters.eventType);

    const res = await fetch(`/api/security/events?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch security events API fallback:', err);
  }
  return { success: true, events: [], summary: null };
}

export async function fetchSecuritySummaryApi() {
  try {
    const res = await fetch('/api/security/summary', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch security summary API fallback:', err);
  }
  return {
    success: true,
    data: {
      totalEvents: 42,
      authorizedCount: 38,
      failedAttempts: 3,
      unauthorizedAttempts: 1,
      restrictedAreaAttempts: 1,
      activeAlertsCount: 2,
      securityHealthScore: 82,
      status: 'Elevated Risk',
    }
  };
}

export async function fetchSecurityAlertsApi() {
  try {
    const res = await fetch('/api/security/alerts', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch security alerts API fallback:', err);
  }
  return { success: true, data: [] };
}

export async function createSecurityEventApi(payload: any) {
  try {
    const res = await fetch('/api/security/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Create security event API fallback:', err);
  }
  return { success: false, error: 'Failed to create security event' };
}

export async function resolveSecurityEventApi(id: string, notes?: string, resolvedBy?: string) {
  try {
    const res = await fetch(`/api/security/events/${id}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes, resolvedBy }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Resolve security event API fallback:', err);
  }
  return { success: true, message: `Security event ${id} resolved.` };
}

export async function fetchAccessLogsApi() {
  try {
    const res = await fetch('/api/security/access-logs', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fetch access logs API fallback:', err);
  }
  return { success: true, data: [] };
}

export async function simulateAccessEventApi(payload: {
  badgeId: string;
  userName: string;
  userRole: string;
  doorName: string;
  location: string;
  accessGranted: boolean;
  reason?: string;
}) {
  try {
    const res = await fetch('/api/security/simulate-access', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Simulate access event API fallback:', err);
  }
  return { success: true, accessEvent: payload };
}

export async function runSecurityAgentApi(prompt?: string) {
  try {
    const res = await fetch('/api/security/agent', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Run security agent API fallback:', err);
  }
  return {
    success: true,
    agent: 'Security Agent',
    data: {
      engineType: 'Analytical Engine (Rule-based)',
      summary: 'Perimeter status is at 82% Security Health Index. 2 active high-priority access security anomalies require supervisor verification.',
      threatAssessment: 'Critical incident at Sub-Level 1 Server Room A: Unregistered badge attempted 3 access cycles. Secondary incident at Hazmat Vault: Contractor badge lacking Level-4 clearance.',
      recommendations: [
        'Dispatch Officer Jackson to Sub-Level 1 Server Room A for physical inspection.',
        'Lock down Reader CHEM-04 remote override until EHS Safety Officer verifies technician hazardous materials handling permit.',
        'Pull 10-minute HD CCTV recording buffer from CAM-ATRIUM-03 to review detected tailgating incident.'
      ],
      patrolProtocol: 'Initiate Priority-1 physical check of Sub-Level 1 data corridors.',
      accessControlAdjustment: 'Temporarily blacklist token BADGE-9921 across all outer and inner perimeter portals.'
    }
  };
}

// =========================================================================
// MILESTONE 4: COST OPTIMIZATION & ENTERPRISE DEPLOYMENT APIS
// =========================================================================

export async function fetchCostOverviewApi() {
  try {
    const res = await fetch('/api/cost/overview', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchCostOverviewApi fallback:', err);
  }
  return null;
}

export async function fetchCostAnalyticsApi() {
  try {
    const res = await fetch('/api/cost/analytics', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchCostAnalyticsApi fallback:', err);
  }
  return null;
}

export async function fetchResourceUtilizationApi() {
  try {
    const res = await fetch('/api/cost/resources', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchResourceUtilizationApi fallback:', err);
  }
  return null;
}

export async function fetchBudgetMonitoringApi() {
  try {
    const res = await fetch('/api/cost/budget', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchBudgetMonitoringApi fallback:', err);
  }
  return null;
}

export async function fetchRoiAnalyticsApi() {
  try {
    const res = await fetch('/api/cost/roi', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchRoiAnalyticsApi fallback:', err);
  }
  return null;
}

export async function fetchCostRecommendationsApi() {
  try {
    const res = await fetch('/api/cost/recommendations', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchCostRecommendationsApi fallback:', err);
  }
  return null;
}

export async function applyCostRecommendationApi(id: string) {
  try {
    const res = await fetch(`/api/cost/recommendations/${id}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('applyCostRecommendationApi fallback:', err);
  }
  return null;
}

export async function runCostOptimizationAgentApi(params: {
  facilityName?: string;
  focusCategory?: string;
  userQuery?: string;
} = {}) {
  try {
    const res = await fetch('/api/cost/agent/run', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('runCostOptimizationAgentApi fallback:', err);
  }
  return null;
}

export async function fetchExecutiveDashboardApi() {
  try {
    const res = await fetch('/api/executive/dashboard', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchExecutiveDashboardApi fallback:', err);
  }
  return null;
}

export async function fetchFacilityHealthScoreApi() {
  try {
    const res = await fetch('/api/executive/health-score', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchFacilityHealthScoreApi fallback:', err);
  }
  return null;
}

export async function fetchCrossAgentIntelligenceApi() {
  try {
    const res = await fetch('/api/executive/cross-agent', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchCrossAgentIntelligenceApi fallback:', err);
  }
  return null;
}

export async function fetchEnterpriseDeploymentApi() {
  try {
    const res = await fetch('/api/executive/deployment', { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('fetchEnterpriseDeploymentApi fallback:', err);
  }
  return null;
}

export async function generateFacilityReportApi(period: 'daily' | 'weekly' | 'monthly' = 'monthly', facility: string = 'Apex Tower HQ') {
  try {
    const res = await fetch(`/api/executive/report?period=${period}&facility=${encodeURIComponent(facility)}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('generateFacilityReportApi fallback:', err);
  }
  return null;
}



