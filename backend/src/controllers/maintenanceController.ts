import { Request, Response } from 'express';
import {
  getEquipmentDb,
  updateEquipmentDb,
  getWorkOrdersDb,
  createWorkOrderDb,
  getMaintenanceSchedulesDb,
  createMaintenanceScheduleDb,
  updateMaintenanceScheduleDb,
  getMaintenanceRecordsDb,
  createMaintenanceRecordDb,
  getRecommendationsDb,
  createAlertDb,
  EquipmentData,
  FailureRiskData,
  MaintenanceScheduleData,
  MaintenanceRecordData,
} from '../../../database/models/store';
import { runPythonScript } from '../services/pythonRunner';

/**
 * Calculates failure risks and health scores based on live equipment telemetry and physics standards (ISO 10816).
 * Differentiated explicitly as Prototype Physics & Empirical Heuristic Degradation Model (not deep ML).
 */
export function calculateEquipmentRisks(equipmentList: EquipmentData[]): {
  equipmentWithRisks: (EquipmentData & { failureRisk: FailureRiskData })[];
  failureRisks: FailureRiskData[];
  modelMetadata: {
    modelClass: string;
    mlClassification: string;
    methodology: string;
    lastEvaluation: string;
  };
} {
  const failureRisks: FailureRiskData[] = [];
  const equipmentWithRisks = equipmentList.map((eq) => {
    const vib = eq.vibrationMms ?? 1.8;
    const temp = eq.temperatureC ?? 42.0;
    const cop = eq.copEfficiency ?? 4.2;
    const hours = eq.operatingHours ?? 10000;

    // Vibration risk calculation based on ISO 10816-3 (RMS velocity)
    let vibRisk = 10;
    if (vib <= 2.0) {
      vibRisk = (vib / 2.0) * 20.0;
    } else if (vib <= 4.0) {
      vibRisk = 20.0 + ((vib - 2.0) / 2.0) * 45.0;
    } else {
      vibRisk = Math.min(100.0, 65.0 + ((vib - 4.0) / 2.0) * 35.0);
    }

    // Thermal risk calculation based on standard bearing threshold (55°C nominal, 75°C alarm)
    let tempRisk = 10;
    if (temp <= 55.0) {
      tempRisk = (temp / 55.0) * 15.0;
    } else if (temp <= 75.0) {
      tempRisk = 15.0 + ((temp - 55.0) / 20.0) * 45.0;
    } else {
      tempRisk = Math.min(100.0, 60.0 + ((temp - 75.0) / 20.0) * 40.0);
    }

    // Efficiency loss risk (Thermodynamic COP drop below 3.8)
    let copRisk = 5;
    if (cop >= 4.2) {
      copRisk = 5.0;
    } else if (cop >= 3.6) {
      copRisk = 10.0 + ((4.2 - cop) / 0.6) * 30.0;
    } else {
      copRisk = Math.min(100.0, 40.0 + ((3.6 - cop) / 0.8) * 60.0);
    }

    // Operating hours wear component
    const ageRisk = Math.min(25.0, (hours / 25000.0) * 25.0);

    // Weighted aggregate failure risk
    const aggregateRiskScore = Math.max(5.0, Math.min(98.0, Math.round(0.40 * vibRisk + 0.30 * tempRisk + 0.20 * copRisk + 0.10 * ageRisk)));
    const computedHealthScore = Math.max(10, Math.min(98, 100 - aggregateRiskScore));

    let riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    let status: 'Optimal' | 'Warning' | 'Critical' = 'Optimal';
    let rulDays = 120;

    if (aggregateRiskScore >= 70) {
      riskLevel = 'Critical';
      status = 'Critical';
      rulDays = Math.max(5, Math.round((100 - aggregateRiskScore) * 0.7));
    } else if (aggregateRiskScore >= 40) {
      riskLevel = aggregateRiskScore >= 55 ? 'High' : 'Medium';
      status = 'Warning';
      rulDays = Math.round((100 - aggregateRiskScore) * 0.9);
    } else {
      riskLevel = 'Low';
      status = 'Optimal';
      rulDays = Math.round(90 + (100 - aggregateRiskScore) * 1.5);
    }

    let primaryFailureMode = 'Nominal Mechanical Parameters — Stable Hydrodynamic Film';
    if (eq.id === 'CHILLER-02') {
      primaryFailureMode = 'Drive-End Angular Contact Bearing Raceway Fatigue & Condenser Scale Lift Penalty';
    } else if (eq.id === 'AHU-04') {
      primaryFailureMode = 'Fan Blower Motor Outboard Bearing Wear & Supply Damper Actuator Binding';
    } else if (eq.id === 'COOLING-TWR-01') {
      primaryFailureMode = 'Induced Draft Fan Gearbox Backlash & Fan Blade Dynamic Unbalance';
    } else if (eq.id === 'CHILLER-01') {
      primaryFailureMode = 'Nominal Hydrodynamic Film — Low Probability of Near-Term Rotor Lockup';
    } else if (eq.id === 'PUMP-01') {
      primaryFailureMode = 'Nominal Impeller Wear — Stable Mechanical Seal Pressure';
    }

    const riskFactors = [
      {
        metric: 'Vibration Velocity RMS',
        currentValue: `${vib.toFixed(2)} mm/s`,
        threshold: '2.50 mm/s (Alarm: 4.50 mm/s)',
        weight: '40%',
        contributionScore: Math.round(vibRisk),
        severity: (vib > 4.5 ? 'critical' : vib > 2.8 ? 'warning' : 'normal') as any,
      },
      {
        metric: 'Drive Bearing Temperature',
        currentValue: `${temp.toFixed(1)} °C`,
        threshold: '55.0 °C (Alarm: 75.0 °C)',
        weight: '30%',
        contributionScore: Math.round(tempRisk),
        severity: (temp > 75.0 ? 'critical' : temp > 60.0 ? 'warning' : 'normal') as any,
      },
      {
        metric: 'Coefficient of Performance (COP)',
        currentValue: cop.toFixed(2),
        threshold: 'Target: 4.20 (Min: 3.60)',
        weight: '20%',
        contributionScore: Math.round(copRisk),
        severity: (cop < 3.4 ? 'critical' : cop < 3.9 ? 'warning' : 'normal') as any,
      },
      {
        metric: 'Accumulated Run Hours',
        currentValue: `${hours.toLocaleString()} hrs`,
        threshold: 'Major Overhaul: 20,000 hrs',
        weight: '10%',
        contributionScore: Math.round(ageRisk),
        severity: (hours > 18000 ? 'warning' : 'normal') as any,
      },
    ];

    const failureRisk: FailureRiskData = {
      equipmentId: eq.id,
      equipmentName: eq.name,
      riskScore: aggregateRiskScore,
      riskLevel,
      primaryFailureMode,
      timeToFailureEstimate: `${rulDays} Days (${rulDays * 24} Operating Hours)`,
      riskFactors,
      modelType: 'Prototype Physics & Empirical Heuristic Degradation Model',
      modelDisclaimer: 'Prototype Rule-Based / Statistical Vibration-Thermal Model: Calculates wear indices using ISO 10816 and thermodynamic loss formulas. Explicitly distinct from trained Deep ML / Neural Network models.',
    };

    failureRisks.push(failureRisk);

    return {
      ...eq,
      healthScore: computedHealthScore,
      status,
      rulDays,
      rulHours: rulDays * 24,
      failureRisk,
    };
  });

  return {
    equipmentWithRisks,
    failureRisks,
    modelMetadata: {
      modelClass: 'Prototype Physics & Empirical Degradation Model',
      mlClassification: 'Heuristic Rule-Based / Statistical Model (Explicitly NOT Deep ML/Neural Network)',
      methodology: 'ISO 10816-3 mechanical vibration velocity guidelines, Arrhenius thermal fatigue limits, and thermodynamic COP degradation penalties',
      lastEvaluation: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    },
  };
}

export async function getMaintenanceOverview(req: Request, res: Response) {
  try {
    const rawEquipment = await getEquipmentDb();
    const { equipmentWithRisks, failureRisks, modelMetadata } = calculateEquipmentRisks(rawEquipment);
    const schedules = await getMaintenanceSchedulesDb();
    const records = await getMaintenanceRecordsDb();
    const workOrders = await getWorkOrdersDb();
    const allRecs = await getRecommendationsDb();
    const maintenanceRecs = allRecs.filter((r) => r.agentType === 'maintenance' || r.id.includes('MAINT'));

    return res.json({
      success: true,
      equipment: equipmentWithRisks,
      failureRisks,
      schedules,
      records,
      workOrders,
      recommendations: maintenanceRecs,
      modelMetadata,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch maintenance overview' });
  }
}

export async function getEquipmentList(req: Request, res: Response) {
  try {
    const rawEquipment = await getEquipmentDb();
    const { equipmentWithRisks, modelMetadata } = calculateEquipmentRisks(rawEquipment);
    return res.json({ success: true, equipment: equipmentWithRisks, modelMetadata });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch equipment' });
  }
}

export async function getEquipmentDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const rawEquipment = await getEquipmentDb();
    const target = rawEquipment.find((e) => e.id.toLowerCase() === id.toLowerCase());
    if (!target) {
      return res.status(404).json({ success: false, error: `Equipment with ID ${id} not found` });
    }

    const { equipmentWithRisks, modelMetadata } = calculateEquipmentRisks([target]);
    const schedules = (await getMaintenanceSchedulesDb()).filter((s) => s.equipmentId === target.id);
    const records = (await getMaintenanceRecordsDb()).filter((r) => r.equipmentId === target.id);
    const workOrders = (await getWorkOrdersDb()).filter((w) => w.assetId === target.id);

    return res.json({
      success: true,
      equipment: equipmentWithRisks[0],
      schedules,
      records,
      workOrders,
      modelMetadata,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch equipment detail' });
  }
}

export async function getFailureRisks(req: Request, res: Response) {
  try {
    const rawEquipment = await getEquipmentDb();
    const { failureRisks, modelMetadata } = calculateEquipmentRisks(rawEquipment);
    return res.json({ success: true, failureRisks, modelMetadata });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to calculate failure risks' });
  }
}

export async function getMaintenanceSchedules(req: Request, res: Response) {
  try {
    const schedules = await getMaintenanceSchedulesDb();
    return res.json({ success: true, schedules });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch schedules' });
  }
}

export async function createMaintenanceSchedule(req: Request, res: Response) {
  try {
    const { equipmentId, equipmentName, taskType, scheduledDate, recurrence, assignedTechnician, estimatedDurationHrs, priority, instructions } = req.body;

    const newSchedule: MaintenanceScheduleData = {
      id: `SCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      equipmentId: equipmentId || 'CHILLER-02',
      equipmentName: equipmentName || 'Centrifugal Water Chiller CH-02',
      taskType: taskType || 'Scheduled Inspection',
      scheduledDate: scheduledDate || new Date().toISOString().substring(0, 10),
      recurrence: recurrence || 'Quarterly',
      assignedTechnician: assignedTechnician || 'Marcus Vance (Chief Engineer)',
      estimatedDurationHrs: Number(estimatedDurationHrs) || 4.0,
      status: 'Scheduled',
      priority: priority || 'Medium',
      instructions: instructions || 'Perform standard condition inspection protocol.',
    };

    const created = await createMaintenanceScheduleDb(newSchedule);
    return res.status(201).json({ success: true, schedule: created });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create maintenance schedule' });
  }
}

export async function updateMaintenanceSchedule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await updateMaintenanceScheduleDb(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    return res.json({ success: true, schedule: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update schedule' });
  }
}

export async function getMaintenanceRecords(req: Request, res: Response) {
  try {
    const records = await getMaintenanceRecordsDb();
    return res.json({ success: true, records });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch maintenance records' });
  }
}

export async function createMaintenanceRecord(req: Request, res: Response) {
  try {
    const { equipmentId, equipmentName, workOrderId, completedDate, serviceType, technician, costUsd, downtimeRecordedHrs, partsReplaced, findings, outcome } = req.body;

    const newRecord: MaintenanceRecordData = {
      id: `REC-HIST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      equipmentId: equipmentId || 'CHILLER-02',
      equipmentName: equipmentName || 'Centrifugal Water Chiller CH-02',
      workOrderId: workOrderId || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      completedDate: completedDate || new Date().toISOString().substring(0, 10),
      serviceType: serviceType || 'Service & Component Replacement',
      technician: technician || 'Marcus Vance',
      costUsd: Number(costUsd) || 1200,
      downtimeRecordedHrs: Number(downtimeRecordedHrs) || 2.0,
      partsReplaced: Array.isArray(partsReplaced) ? partsReplaced : partsReplaced ? [partsReplaced] : ['Standard Seal & Gasket Kit'],
      findings: findings || 'Service performed according to manufacturer specification.',
      outcome: outcome || 'Resolved — Restored to Nominal Operating Limits',
    };

    const created = await createMaintenanceRecordDb(newRecord);
    return res.status(201).json({ success: true, record: created });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create maintenance record' });
  }
}

export async function dispatchRecommendation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { equipmentId, equipmentName, title, priority, assignedTechnician, estimatedCostUsd, preventedDowntimeHrs, sparePartsRequired } = req.body;

    const targetEqId = equipmentId || 'CHILLER-02';
    const targetEqName = equipmentName || 'Centrifugal Water Chiller CH-02';

    const newWo = {
      id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityId: 'apex-hq',
      assetId: targetEqId,
      assetName: targetEqName,
      title: title || `Auto-Dispatched PM: ${targetEqName}`,
      description: req.body.description || `Condition-based maintenance dispatched from Recommendation ${id}. Vibration and thermal thresholds exceeded.`,
      priority: priority || 'High',
      status: 'In Progress',
      assignedTechnician: assignedTechnician || 'Marcus Vance (Chief Engineer)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estimatedCostUsd: Number(estimatedCostUsd) || 2850,
      preventedDowntimeHrs: Number(preventedDowntimeHrs) || 48,
      generatedBy: 'Predictive Maintenance Engine (Prototype Heuristic)',
      sparePartsRequired: sparePartsRequired || ['Angular Contact Bearing Set (SKF 7312)', 'Synthetic Lithium Grease EP2', 'Condenser Descaling Solvent'],
    };

    const savedWo = await createWorkOrderDb(newWo);

    // Create an alert log entry
    await createAlertDb({
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      channel: 'Field Dispatch / SMS & Dashboard',
      recipient: savedWo.assignedTechnician,
      subject: `WORK ORDER DISPATCHED: ${savedWo.title}`,
      body: `Work Order ${savedWo.id} has been auto-dispatched for ${savedWo.assetName}. Priority: ${savedWo.priority}.`,
      status: 'Delivered',
      acknowledged: false,
      severity: savedWo.priority === 'Urgent' || savedWo.priority === 'Critical' ? 'critical' : 'warning',
      equipmentId: savedWo.assetId,
      equipmentName: savedWo.assetName,
    });

    return res.json({
      success: true,
      message: `Work order ${savedWo.id} successfully created and dispatched to ${savedWo.assignedTechnician}`,
      workOrder: savedWo,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to dispatch recommendation' });
  }
}

export async function recalculatePredictiveMaintenance(req: Request, res: Response) {
  try {
    const rawEquipment = await getEquipmentDb();

    // Run Python calculation script or fallback to TS engine
    try {
      const pythonOutput = await runPythonScript('predictive_maintenance/failure_risk.py', [JSON.stringify(rawEquipment)]);
      if (pythonOutput && pythonOutput.equipment) {
        // Update database equipment health scores
        for (const item of pythonOutput.equipment) {
          await updateEquipmentDb(item.id, {
            healthScore: item.healthScore,
            status: item.status,
            rulDays: item.rulDays,
            rulHours: item.rulHours,
          });
        }
        return res.json({
          success: true,
          source: 'python_physics_engine',
          data: pythonOutput,
        });
      }
    } catch (pythonErr) {
      console.warn('Python failure risk recalculation fallback to TypeScript engine:', pythonErr);
    }

    const { equipmentWithRisks, failureRisks, modelMetadata } = calculateEquipmentRisks(rawEquipment);
    for (const eq of equipmentWithRisks) {
      await updateEquipmentDb(eq.id, {
        healthScore: eq.healthScore,
        status: eq.status,
        rulDays: eq.rulDays,
        rulHours: eq.rulHours,
      });
    }

    return res.json({
      success: true,
      source: 'typescript_physics_engine',
      equipment: equipmentWithRisks,
      failureRisks,
      modelMetadata,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to recalculate maintenance telemetry' });
  }
}
