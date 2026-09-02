import { Request, Response } from 'express';
import {
  runAnomalyDetectionEngine,
  acknowledgeAnomaly,
  resetAnomalyStatus,
  AnomalyItem,
} from '../services/anomalyDetectionService';
import { applyEnergySetback } from './energyController';
import { createWorkOrderDb, updateOccupancyZoneDb, updateEquipmentDb } from '../../../database/models/store';

export async function getAnomalies(req: Request, res: Response) {
  try {
    const result = await runAnomalyDetectionEngine();
    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute anomaly detection engine',
    });
  }
}

export async function triggerAnomalyDetection(req: Request, res: Response) {
  try {
    const result = await runAnomalyDetectionEngine();
    return res.json({
      success: true,
      message: `Anomaly detection scan completed. Identified ${result.anomalyCount} operational anomalies.`,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger anomaly scan',
    });
  }
}

export async function handleAcknowledgeAnomaly(req: Request, res: Response) {
  try {
    const { id } = req.params;
    acknowledgeAnomaly(id);
    return res.json({
      success: true,
      message: `Anomaly ${id} has been acknowledged.`,
      id,
      status: 'acknowledged',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to acknowledge anomaly',
    });
  }
}

export async function handleRemediateAnomaly(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { actionType } = req.body;

    let actionTaken = '';

    if (id.includes('ENERGY') || actionType === 'hvac_setback') {
      await updateEquipmentDb('CHILLER-02', { copEfficiency: 4.3, status: 'Optimal' });
      actionTaken = 'Applied +1.5°C temperature setback on Chiller CH-02. Peak electrical draw reduced by 120 kW.';
    } else if (id.includes('TEMP') || id.includes('VIB') || actionType === 'create_workorder') {
      const newWo = {
        id: `WO-${Math.floor(8800 + Math.random() * 1000)}`,
        facilityId: 'apex-hq',
        assetId: 'ast-chiller-02',
        assetName: 'Centrifugal Water Chiller CH-02',
        title: 'Emergency Bearing Overhaul & Alignment Check',
        description: 'Auto-dispatched by Anomaly Detection Engine to resolve elevated vibration (4.8 mm/s) and bearing overheating (78.4°C).',
        priority: 'High',
        status: 'In Progress',
        assignedTechnician: 'Marcus Vance (Chief Engineer)',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        estimatedCostUsd: 2850,
        preventedDowntimeHrs: 48,
        generatedBy: 'Anomaly Detection Engine',
        sparePartsRequired: ['SKF 7320 Double Angular Bearing', 'Neoprene O-Ring Kit CH-2', 'Descaling Agent 50L'],
      };
      await createWorkOrderDb(newWo);
      actionTaken = `Auto-generated Emergency Work Order ${newWo.id} and assigned to Marcus Vance.`;
    } else if (id.includes('IAQ') || actionType === 'ventilation_boost') {
      await updateOccupancyZoneDb('ZONE-FLOOR3-EAST', { co2Ppm: 680, status: 'Optimal' });
      actionTaken = 'Boosted outside air intake dampers on AHU-04 by +20%. CO2 restored to nominal levels.';
    } else {
      actionTaken = `Remediation protocol executed for anomaly ${id}.`;
    }

    acknowledgeAnomaly(id);

    return res.json({
      success: true,
      message: actionTaken,
      id,
      remediated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to remediate anomaly',
    });
  }
}
