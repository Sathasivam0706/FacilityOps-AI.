import { Request, Response } from 'express';
import { getEquipmentDb, updateEquipmentDb } from '../../../database/models/store';

// In-memory persistent state for tariff and alarm limits
let energyTariffSettings = {
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
};

let copAlarmLimits = {
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
};

export async function getEnergyLoadCurve(req: Request, res: Response) {
  try {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const timeStr = `${i.toString().padStart(2, '0')}:00`;
      const isPeak = i >= 12 && i <= 16;
      const actualKw = isPeak ? 980 + Math.random() * 120 : 450 + Math.random() * 80;
      const optimizedKw = isPeak ? actualKw * 0.82 : actualKw;
      return {
        time: timeStr,
        actualKw: Math.round(actualKw),
        optimizedKw: Math.round(optimizedKw),
        cop: Number((3.8 + Math.random() * 0.6).toFixed(2)),
        isPeak,
      };
    });

    return res.json({
      success: true,
      dataPoints: hours,
      peakTariffActive: true,
      currentDemandKw: 840.5,
      copEfficiency: 4.12,
      dailySavingsEstUsd: 425.0,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch energy load curve' });
  }
}

export async function applyEnergySetback(req: Request, res: Response) {
  try {
    const { deltaTempC = 1.5, targetAssetId = 'CHILLER-02' } = req.body;

    const equipment = await getEquipmentDb();
    const asset = equipment.find((eq) => eq.id === targetAssetId);
    let updatedAsset = null;

    if (asset) {
      const newCop = Math.min(5.0, asset.copEfficiency + 0.35);
      updatedAsset = await updateEquipmentDb(targetAssetId, {
        copEfficiency: newCop,
        status: 'Optimal',
      });
    }

    return res.json({
      success: true,
      message: `Successfully applied +${deltaTempC}°C setback to ${targetAssetId}. Demand reduced by ~120 kW.`,
      targetAssetId,
      newCopEfficiency: updatedAsset ? updatedAsset.copEfficiency : 4.4,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to apply setback' });
  }
}

export async function getEnergyTariffSettings(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      tariffSettings: energyTariffSettings,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch tariff settings' });
  }
}

export async function updateEnergyTariffSettings(req: Request, res: Response) {
  try {
    energyTariffSettings = {
      ...energyTariffSettings,
      ...req.body,
    };
    return res.json({
      success: true,
      message: 'Tariff & OpEx optimization parameters updated successfully.',
      tariffSettings: energyTariffSettings,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update tariff settings' });
  }
}

export async function getCopAlarmLimits(req: Request, res: Response) {
  try {
    const equipment = await getEquipmentDb();
    // Dynamically update current COP from database
    const dynamicLimits = copAlarmLimits.equipmentLimits.map((item) => {
      const found = equipment.find((e) => e.id === item.id);
      const currentCop = found ? found.copEfficiency : item.currentCop;
      const isViolated = currentCop < item.minCop;
      return {
        ...item,
        currentCop,
        status: isViolated ? 'Violated' : 'Optimal',
      };
    });

    return res.json({
      success: true,
      alarmLimits: {
        ...copAlarmLimits,
        equipmentLimits: dynamicLimits,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch COP alarm limits' });
  }
}

export async function updateCopAlarmLimits(req: Request, res: Response) {
  try {
    copAlarmLimits = {
      ...copAlarmLimits,
      ...req.body,
    };
    return res.json({
      success: true,
      message: 'COP & Alarm Limit thresholds saved and applied to active monitoring engine.',
      alarmLimits: copAlarmLimits,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update COP alarm limits' });
  }
}


