import { Request, Response } from 'express';
import {
  getRecommendationsDb,
  updateRecommendationDb,
  createWorkOrderDb,
  updateEquipmentDb,
  getEquipmentDb,
  getOccupancyZonesDb,
  getTelemetryDb,
  recommendationsStore,
} from '../../../database/models/store';
import { getAiInstance } from '../../../ai/geminiService';

export async function getRecommendations(req: Request, res: Response) {
  try {
    const existingRecs = await getRecommendationsDb();
    const equipment = await getEquipmentDb();
    const occupancy = await getOccupancyZonesDb();
    const telemetry = await getTelemetryDb();

    // Data audit to derive actionable recommendations from actual project state
    const derivedRecs: any[] = [];

    // 1. Equipment Health Audit (e.g., Chiller CH-02 vibration or low health score)
    const degradedEquip = equipment.find(e => e.healthScore < 75 || e.vibrationMms > 3.5 || e.status === 'Warning' || e.status === 'Critical');
    if (degradedEquip) {
      const recId = `REC-MAINT-${degradedEquip.id}`;
      if (!existingRecs.some(r => r.id === recId)) {
        derivedRecs.push({
          id: recId,
          agentType: 'maintenance',
          title: `Pre-emptive Bearing & Shaft Service for ${degradedEquip.name}`,
          description: `Vibration currently at ${degradedEquip.vibrationMms || 4.8} mm/s with bearing temp ${degradedEquip.temperatureC || 78.4}°C. Calculated RUL is ${degradedEquip.rulDays || 18} days. Prevent $34,500 outage risk.`,
          estimatedSavingsUsdMonth: 12800,
          status: 'pending',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          engineSource: 'Predictive Maintenance Analytics Engine',
        });
      }
    }

    // 2. Occupancy IAQ Audit (e.g., Zone with CO2 > 950 PPM)
    const highCo2Zone = occupancy.find(z => z.co2Ppm > 950);
    if (highCo2Zone) {
      const recId = `REC-OCC-${highCo2Zone.id}`;
      if (!existingRecs.some(r => r.id === recId)) {
        derivedRecs.push({
          id: recId,
          agentType: 'occupancy',
          title: `Increase Fresh Air Ventilation in ${highCo2Zone.name}`,
          description: `CO2 concentration measured at ${highCo2Zone.co2Ppm} PPM (${highCo2Zone.occupantCount} occupants, ${highCo2Zone.occupancyPercentage}% capacity). Boost VAV supply dampers by +20% to restore IAQ.`,
          estimatedSavingsUsdMonth: 1200,
          status: 'pending',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          engineSource: 'Occupancy IAQ Analytics Engine',
        });
      }
    }

    // 3. Energy Load Audit (e.g., High demand telemetry)
    const latestTele = telemetry[0];
    const activeKw = latestTele?.payload?.active_kw || 840;
    if (activeKw > 750) {
      const recId = 'REC-ENERGY-PEAK';
      if (!existingRecs.some(r => r.id === recId)) {
        derivedRecs.push({
          id: recId,
          agentType: 'energy',
          title: 'Apply +1.5°C HVAC Chilled Water Setback During Peak Tariff',
          description: `Current demand at ${activeKw} kW (baseline: 720 kW). Shifting chiller load and dimming non-critical perimeter lighting during peak tariff window ($0.28/kWh).`,
          estimatedSavingsUsdMonth: 4250,
          status: 'pending',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          engineSource: 'Energy Load Shifting Engine',
        });
      }
    }

    // Push new derived recommendations to store if not present
    for (const rec of derivedRecs) {
      if (!recommendationsStore.some(r => r.id === rec.id)) {
        recommendationsStore.push(rec);
      }
    }

    const allRecommendations = await getRecommendationsDb();

    return res.json({
      success: true,
      count: allRecommendations.length,
      recommendations: allRecommendations,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch recommendations' });
  }
}

export async function applyRecommendation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const recommendations = await getRecommendationsDb();
    const rec = recommendations.find((r) => r.id === id);

    if (!rec) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }

    const updatedRec = await updateRecommendationDb(id, { status: 'applied' });

    if (rec.agentType === 'maintenance') {
      const newWo = {
        id: `WO-2026-${Math.floor(8800 + Math.random() * 100)}`,
        facilityId: 'apex-hq',
        assetId: 'CHILLER-02',
        assetName: 'Centrifugal Water Chiller CH-02',
        title: rec.title,
        description: rec.description,
        priority: 'High',
        status: 'Assigned',
        assignedTechnician: 'Marcus Vance',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        estimatedCostUsd: 2800,
        preventedDowntimeHrs: 48,
        generatedBy: 'Maintenance Agent',
        sparePartsRequired: ['Bearing Assembly SKF-7320', 'O-Ring Gasket Kit'],
      };
      await createWorkOrderDb(newWo);
    } else if (rec.agentType === 'energy') {
      await updateEquipmentDb('CHILLER-02', {
        copEfficiency: 4.2,
        status: 'Optimal',
      });
    }

    return res.json({
      success: true,
      message: `Recommendation ${id} applied successfully.`,
      recommendation: updatedRec,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to apply recommendation' });
  }
}

export async function dismissRecommendation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updatedRec = await updateRecommendationDb(id, { status: 'dismissed' });

    if (!updatedRec) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }

    return res.json({
      success: true,
      message: `Recommendation ${id} dismissed.`,
      recommendation: updatedRec,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to dismiss recommendation' });
  }
}

