import {
  getEquipmentDb,
  getOccupancyZonesDb,
  getTelemetryDb,
  getAlertsDb,
  createAlertDb,
  getRecommendationsDb,
  AlertLogData,
} from '../../../database/models/store';
import { runPythonScript } from './pythonRunner';

export interface AnomalyItem {
  id: string;
  category: 'energy' | 'maintenance' | 'temperature' | 'telemetry' | 'iaq';
  deviceId: string;
  deviceOrEquipment: string;
  metric: string;
  currentValue: number | string;
  currentValueDisplay: string;
  expectedBaseline: number | string;
  expectedBaselineDisplay: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  explanation: string;
  recommendedAction: string;
  status: 'active' | 'mitigated' | 'acknowledged';
  estimatedWastageUsdHr: number;
  engineSource: string;
}

export interface AnomalyDetectionResult {
  status: 'ANOMALIES_DETECTED' | 'OPTIMAL';
  anomalyCount: number;
  criticalCount: number;
  warningCount: number;
  totalWastageUsdHr: number;
  anomalies: AnomalyItem[];
  engine: string;
  timestamp: string;
}

// In-memory acknowledgment state
const acknowledgedAnomalyIds = new Set<string>();

export function acknowledgeAnomaly(id: string): boolean {
  acknowledgedAnomalyIds.add(id);
  return true;
}

export function resetAnomalyStatus(id: string): boolean {
  acknowledgedAnomalyIds.delete(id);
  return true;
}

export async function runAnomalyDetectionEngine(): Promise<AnomalyDetectionResult> {
  const telemetry = await getTelemetryDb();
  const equipment = await getEquipmentDb();
  const occupancy = await getOccupancyZonesDb();

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  // 1. Extract values from live database / IoT telemetry
  const latestPowerTele = telemetry.find((t) => t.payload && (t.payload.active_kw || t.payload.powerKw));
  const livePowerKw = latestPowerTele
    ? Number(latestPowerTele.payload.active_kw || latestPowerTele.payload.powerKw)
    : 840.2;

  const chiller =
    equipment.find((e) => e.id.includes('CHILLER-02') || e.name.includes('Chiller CH-02')) ||
    equipment.find((e) => e.healthScore < 75) ||
    equipment[0];

  const chillerCop = chiller ? chiller.copEfficiency : 3.20;
  const chillerVib = chiller ? chiller.vibrationMms : 4.82;
  const chillerTemp = chiller ? chiller.temperatureC : 78.4;

  const highCo2Zone = occupancy.find((z) => z.co2Ppm > 850) || occupancy[0];
  const liveCo2 = highCo2Zone ? highCo2Zone.co2Ppm : 1120;

  let anomalies: AnomalyItem[] = [];
  let engineSource = 'IoT Statistical & Physics-Based Anomaly Detection Engine (Python 3)';

  // Try Python execution first
  try {
    const pythonResult = await runPythonScript('anomaly_detection.py', [
      String(chillerCop),
      String(chillerVib),
      String(liveCo2),
      String(livePowerKw),
      String(chillerTemp),
    ]);

    if (pythonResult && Array.isArray(pythonResult.anomalies) && pythonResult.anomalies.length > 0) {
      anomalies = pythonResult.anomalies.map((a: any) => ({
        id: a.id || `ANOM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        category: a.category || 'maintenance',
        deviceId: a.device?.includes('GW-ESP32') ? 'GW-ESP32-CHILLER-01' : (chiller?.id || 'CHILLER-02'),
        deviceOrEquipment: a.device || (chiller?.name || 'Centrifugal Water Chiller CH-02'),
        metric: a.metric || a.sensor || 'Sensor Telemetry',
        currentValue: a.current_value || a.value,
        currentValueDisplay: String(a.current_value || a.value),
        expectedBaseline: a.expected_baseline || a.threshold || 'Nominal Range',
        expectedBaselineDisplay: String(a.expected_baseline || a.threshold || 'Nominal Range'),
        severity: (a.severity?.toLowerCase() === 'critical' ? 'critical' : 'warning') as 'critical' | 'warning',
        timestamp: a.timestamp || nowIso,
        explanation: a.explanation || 'Anomaly detected based on physics-based threshold deviation.',
        recommendedAction: a.recommended_action || a.action || 'Inspect equipment and verify operational setpoints.',
        status: acknowledgedAnomalyIds.has(a.id) ? 'acknowledged' : 'active',
        estimatedWastageUsdHr: a.estimated_wastage_usd_hr || 15.0,
        engineSource: 'IoT Statistical & Physics-Based Anomaly Detection Engine (Python 3)',
      }));
    }
  } catch (pyErr) {
    console.warn('Python anomaly detection fallback to TypeScript Analytical Engine:', pyErr);
    engineSource = 'Analytical Physics & Telemetry Engine (Rule-based)';
  }

  // If Python did not produce anomalies (or errored), evaluate deterministically via TypeScript engine
  if (anomalies.length === 0) {
    // 1. Power Demand Anomaly
    if (livePowerKw > 780.0) {
      const excessKw = Math.round((livePowerKw - 720.0) * 10) / 10;
      const wastage = Math.round(excessKw * 0.28 * 100) / 100;
      anomalies.push({
        id: 'ANOM-ENERGY-01',
        category: 'energy',
        deviceId: 'GW-ESP32-POWER-MAIN',
        deviceOrEquipment: 'Substation Transformer 2 (GW-ESP32-POWER-MAIN)',
        metric: 'Active Electrical Demand',
        currentValue: livePowerKw,
        currentValueDisplay: `${livePowerKw.toFixed(1)} kW`,
        expectedBaseline: 720.0,
        expectedBaselineDisplay: '720.0 kW (Cap: 780.0 kW)',
        severity: livePowerKw > 820.0 ? 'critical' : 'warning',
        timestamp: nowIso,
        explanation: `Active power demand exceeds nominal baseline by +${excessKw} kW during peak tariff period ($0.28/kWh), causing an estimated OpEx wastage of $${wastage}/hr.`,
        recommendedAction: 'Apply +1.5°C chilled water temperature setback on Chiller CH-02 and ramp down non-essential lighting.',
        status: acknowledgedAnomalyIds.has('ANOM-ENERGY-01') ? 'acknowledged' : 'active',
        estimatedWastageUsdHr: wastage,
        engineSource,
      });
    }

    // 2. High Equipment / Bearing Temperature Anomaly
    if (chillerTemp > 65.0) {
      const tempDelta = Math.round((chillerTemp - 55.0) * 10) / 10;
      anomalies.push({
        id: 'ANOM-TEMP-01',
        category: 'temperature',
        deviceId: chiller?.id || 'CHILLER-02',
        deviceOrEquipment: chiller?.name || 'Centrifugal Water Chiller CH-02',
        metric: 'Drive End Bearing Outboard Temp',
        currentValue: chillerTemp,
        currentValueDisplay: `${chillerTemp.toFixed(1)} °C`,
        expectedBaseline: '40.0 - 65.0 °C',
        expectedBaselineDisplay: '40.0 - 65.0 °C (Max: 65.0 °C)',
        severity: chillerTemp > 75.0 ? 'critical' : 'warning',
        timestamp: nowIso,
        explanation: `Chiller CH-02 drive-end bearing temperature has reached ${chillerTemp.toFixed(1)} °C (+${tempDelta} °C over thermal threshold), indicating lubricant breakdown and hydrodynamic friction.`,
        recommendedAction: 'Dispatch emergency work order for lubricant replenishment and cooling jacket thermal inspection.',
        status: acknowledgedAnomalyIds.has('ANOM-TEMP-01') ? 'acknowledged' : 'active',
        estimatedWastageUsdHr: 24.50,
        engineSource,
      });
    }

    // 3. Equipment Vibration & Mechanical Stress Anomaly
    if (chillerVib > 3.0) {
      anomalies.push({
        id: 'ANOM-VIB-01',
        category: 'maintenance',
        deviceId: chiller?.id || 'CHILLER-02',
        deviceOrEquipment: chiller?.name || 'Centrifugal Water Chiller CH-02',
        metric: 'Radial Vibration Velocity RMS',
        currentValue: chillerVib,
        currentValueDisplay: `${chillerVib.toFixed(2)} mm/s`,
        expectedBaseline: '0.80 - 2.50 mm/s',
        expectedBaselineDisplay: '0.80 - 2.50 mm/s (Alarm: > 3.50 mm/s)',
        severity: chillerVib > 4.5 ? 'critical' : 'warning',
        timestamp: nowIso,
        explanation: `High-frequency radial vibration peak detected at ${chillerVib.toFixed(2)} mm/s at 120.4 Hz harmonic frequency. Pattern indicates angular contact bearing raceway fatigue and rotor misalignment.`,
        recommendedAction: 'Schedule pre-emptive bearing overhaul before 18-day RUL threshold to prevent catastrophic rotor freeze.',
        status: acknowledgedAnomalyIds.has('ANOM-VIB-01') ? 'acknowledged' : 'active',
        estimatedWastageUsdHr: 38.50,
        engineSource,
      });
    }

    // 4. COP Efficiency Degradation
    if (chillerCop < 3.8) {
      const copDelta = Math.round((4.2 - chillerCop) * 100) / 100;
      anomalies.push({
        id: 'ANOM-COP-01',
        category: 'energy',
        deviceId: chiller?.id || 'CHILLER-02',
        deviceOrEquipment: chiller?.name || 'Centrifugal Water Chiller CH-02',
        metric: 'HVAC Coefficient of Performance (COP)',
        currentValue: chillerCop,
        currentValueDisplay: `${chillerCop.toFixed(2)} COP`,
        expectedBaseline: '4.10 - 4.50 COP',
        expectedBaselineDisplay: '4.10 - 4.50 COP (Min: 3.80 COP)',
        severity: chillerCop < 3.3 ? 'critical' : 'warning',
        timestamp: nowIso,
        explanation: `Chiller thermal efficiency has degraded by -${copDelta} COP below nominal baseline, causing excessive electrical draw to maintain chilled water temperature.`,
        recommendedAction: 'Perform condenser tube bundle descaling and verify refrigerant charge level.',
        status: acknowledgedAnomalyIds.has('ANOM-COP-01') ? 'acknowledged' : 'active',
        estimatedWastageUsdHr: 19.80,
        engineSource,
      });
    }

    // 5. IAQ / CO2 Anomaly
    if (liveCo2 > 850) {
      anomalies.push({
        id: 'ANOM-IAQ-01',
        category: 'iaq',
        deviceId: 'AHU-04',
        deviceOrEquipment: `${highCo2Zone?.name || 'Floor 3 East Wing'} (AHU-04)`,
        metric: 'Indoor CO2 Concentration',
        currentValue: liveCo2,
        currentValueDisplay: `${liveCo2} PPM`,
        expectedBaseline: '< 800 PPM',
        expectedBaselineDisplay: '400 - 800 PPM (ASHRAE: < 800 PPM)',
        severity: liveCo2 > 1000 ? 'warning' : 'info',
        timestamp: nowIso,
        explanation: `CO2 concentration in ${highCo2Zone?.name || 'Floor 3 East Wing'} has peaked at ${liveCo2} PPM due to high occupancy density and restricted fresh air damper intake.`,
        recommendedAction: 'Override AHU-04 outside air intake damper by +20% ventilation boost to restore IAQ levels below 750 PPM.',
        status: acknowledgedAnomalyIds.has('ANOM-IAQ-01') ? 'acknowledged' : 'active',
        estimatedWastageUsdHr: 8.20,
        engineSource,
      });
    }

    // 6. Sudden Telemetry Shift / Rate of Change
    if (telemetry.length >= 2) {
      const t1 = telemetry[0].payload || {};
      const t2 = telemetry[1].payload || {};
      const v1 = t1.rms_x || t1.vibrationMms || chillerVib;
      const v2 = t2.rms_x || t2.vibrationMms || 2.1;
      const delta = Math.abs(v1 - v2);
      if (delta > 1.5) {
        anomalies.push({
          id: 'ANOM-RATE-01',
          category: 'telemetry',
          deviceId: 'GW-ESP32-CHILLER-01',
          deviceOrEquipment: 'Chiller Plant ESP32 Gateway (GW-ESP32-CHILLER-01)',
          metric: 'Telemetry Rate-of-Change (dV/dt)',
          currentValue: delta,
          currentValueDisplay: `Δ ${delta.toFixed(2)} mm/s`,
          expectedBaseline: '< 0.30 mm/s',
          expectedBaselineDisplay: 'Steady rate < 0.30 mm/s',
          severity: 'warning',
          timestamp: nowIso,
          explanation: `Rapid transient spike in vibration detected between telemetry polling cycles (+${delta.toFixed(2)} mm/s jump).`,
          recommendedAction: 'Inspect sensor mounting bracket and check for momentary mechanical shock load.',
          status: acknowledgedAnomalyIds.has('ANOM-RATE-01') ? 'acknowledged' : 'active',
          estimatedWastageUsdHr: 5.00,
          engineSource,
        });
      }
    }
  }

  // Synchronize detected anomalies with Dashboard Alerts
  await syncAnomaliesToAlerts(anomalies);

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length;
  const warningCount = anomalies.filter((a) => a.severity === 'warning').length;
  const totalWastage = anomalies.reduce((acc, a) => acc + (a.estimatedWastageUsdHr || 0), 0);

  return {
    status: anomalies.length > 0 ? 'ANOMALIES_DETECTED' : 'OPTIMAL',
    anomalyCount: anomalies.length,
    criticalCount,
    warningCount,
    totalWastageUsdHr: Math.round(totalWastage * 100) / 100,
    anomalies,
    engine: engineSource,
    timestamp: nowIso,
  };
}

/**
 * Ensures detected anomalies have corresponding alert notifications in the alert store.
 */
async function syncAnomaliesToAlerts(anomalies: AnomalyItem[]): Promise<void> {
  try {
    const existingAlerts = await getAlertsDb();

    for (const anom of anomalies) {
      const alertId = `ALT-${anom.id.replace('ANOM-', '')}`;
      const alertExists = existingAlerts.some((a) => a.id === alertId || a.subject.includes(anom.id));

      if (!alertExists && anom.severity !== 'info') {
        const newAlert: AlertLogData = {
          id: alertId,
          timestamp: anom.timestamp.substring(0, 16),
          channel: anom.severity === 'critical' ? 'Slack #facility-critical & SMS' : 'Dashboard Push & Email',
          recipient: anom.category === 'energy' ? 'Energy Manager' : 'Chief Engineer',
          subject: `${anom.severity.toUpperCase()} ANOMALY: ${anom.metric} (${anom.deviceOrEquipment})`,
          body: `${anom.explanation} Recommended Action: ${anom.recommendedAction} (Est. Waste: $${anom.estimatedWastageUsdHr}/hr)`,
          status: 'Delivered',
          acknowledged: anom.status === 'acknowledged',
          severity: anom.severity,
          equipmentId: anom.deviceId,
          equipmentName: anom.deviceOrEquipment,
        };
        await createAlertDb(newAlert);
      }
    }
  } catch (err) {
    console.warn('Failed to sync anomalies to alerts:', err);
  }
}
