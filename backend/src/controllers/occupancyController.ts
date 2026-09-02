import { Request, Response } from 'express';
import {
  getOccupancyZonesDb,
  updateOccupancyZoneDb,
  addOccupancyZoneDb,
  getOccupancySummaryDb,
  getOccupancyTrendsDb,
  getPortfolioSitesDb,
  getCnnInferenceDataDb,
  triggerCnnScanDb,
  updateCnnCameraConfigDb,
} from '../../../database/models/store';
import { runOccupancyAgent } from '../../../ai/agents/occupancyAgent';

export async function getOccupancyZones(req: Request, res: Response) {
  try {
    const rawZones = await getOccupancyZonesDb();
    const zones = rawZones.map((z) => {
      const occ = z.currentOccupancy ?? z.occupantCount ?? 0;
      const cap = z.capacity ?? z.maxCapacity ?? 100;
      const percentage = cap > 0 ? Math.round((occ / cap) * 100) : 0;
      
      let status = z.status;
      let recommendedAction = z.recommendedAction;

      if (percentage > 100) {
        status = 'Overcrowded';
        recommendedAction = recommendedAction || 'Reduce occupancy or redirect users to available spaces.';
      } else if (percentage >= 85) {
        status = 'High';
        recommendedAction = recommendedAction || 'High occupancy threshold reached. Prepare ventilation surge.';
      } else if (percentage >= 70) {
        status = 'Moderate';
        recommendedAction = recommendedAction || 'Standard occupant density.';
      } else {
        status = 'Normal';
        recommendedAction = recommendedAction || 'Nominal operational status.';
      }

      return {
        ...z,
        currentOccupancy: occ,
        occupantCount: occ,
        capacity: cap,
        maxCapacity: cap,
        occupancyPercentage: percentage,
        status,
        recommendedAction,
        timestamp: z.timestamp || new Date().toISOString(),
      };
    });

    const summary = await getOccupancySummaryDb();
    const portfolioSites = await getPortfolioSitesDb();

    return res.json({
      success: true,
      zones,
      summary,
      totalOccupants: summary.currentOccupancy,
      totalCapacity: summary.totalCapacity,
      overallPercentage: summary.occupancyPercentage,
      availableCapacity: summary.availableCapacity,
      portfolioSites,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupancy zones' });
  }
}

export async function getOccupancySummary(req: Request, res: Response) {
  try {
    const summary = await getOccupancySummaryDb();
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupancy summary' });
  }
}

export async function getOccupancyTrends(req: Request, res: Response) {
  try {
    const trends = await getOccupancyTrendsDb();
    return res.json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupancy trends' });
  }
}

export async function createOrUpdateZone(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.name || !data.maxCapacity) {
      return res.status(400).json({ success: false, error: 'Zone name and capacity are required' });
    }

    const zoneId = data.id || `ZONE-${Date.now().toString(36).toUpperCase()}`;
    const occ = data.currentOccupancy ?? data.occupantCount ?? 0;
    const cap = data.capacity ?? data.maxCapacity ?? 100;
    const pct = Math.round((occ / cap) * 100);

    const newZone = {
      id: zoneId,
      facilityId: data.facilityId || 'apex-hq',
      buildingId: data.buildingId || 'BLDG-01',
      floor: Number(data.floor) || 1,
      zone: data.zone || 'Zone A',
      name: data.name,
      location: data.location || `Floor ${data.floor || 1}`,
      currentOccupancy: occ,
      occupantCount: occ,
      capacity: cap,
      maxCapacity: cap,
      occupancyPercentage: pct,
      co2Ppm: Number(data.co2Ppm) || 550,
      tempC: Number(data.tempC) || 22.0,
      humidityPct: Number(data.humidityPct) || 45,
      status: pct > 100 ? 'Overcrowded' : pct >= 85 ? 'High' : pct >= 70 ? 'Moderate' : 'Normal',
      hvacLoadPct: Number(data.hvacLoadPct) || 50,
      timestamp: new Date().toISOString(),
      recommendedAction: pct > 100 ? 'Reduce occupancy or redirect users to available spaces.' : 'Nominal operations.',
      historical: [
        { time: '08:00', occupantCount: Math.round(occ * 0.4), co2Ppm: 460 },
        { time: '10:00', occupantCount: Math.round(occ * 0.8), co2Ppm: 580 },
        { time: '12:00', occupantCount: occ, co2Ppm: Number(data.co2Ppm) || 550 },
        { time: '14:00', occupantCount: occ, co2Ppm: Number(data.co2Ppm) || 550 },
      ],
    };

    const saved = await addOccupancyZoneDb(newZone as any);
    return res.json({ success: true, zone: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to save zone' });
  }
}

export async function adjustZoneVentilation(req: Request, res: Response) {
  try {
    const { zoneId, co2TargetPpm = 800, airflowIncreasePct = 25 } = req.body;
    let updatedZone = null;

    if (zoneId) {
      updatedZone = await updateOccupancyZoneDb(zoneId, {
        co2Ppm: Math.min(650, co2TargetPpm),
        status: 'Normal',
        hvacLoadPct: 65,
        recommendedAction: `Airflow increased (+${airflowIncreasePct}%). CO2 purged to normal baseline.`
      });
    }

    return res.json({
      success: true,
      message: `Ventilation airflow boosted (+${airflowIncreasePct}%) for ${zoneId || 'All Zones'}. CO2 setpoint calibrated to target.`,
      zone: updatedZone,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to adjust ventilation' });
  }
}

export async function runOccupancyAgentAction(req: Request, res: Response) {
  try {
    const zones = await getOccupancyZonesDb();
    const summary = await getOccupancySummaryDb();
    const overcrowded = zones.filter(z => (z.occupancyPercentage || ((z.currentOccupancy || z.occupantCount) / (z.capacity || z.maxCapacity) * 100)) > 100);
    const co2Anomalies = zones.filter(z => z.co2Ppm > 1000).map(z => `${z.name} (${z.co2Ppm} PPM)`);

    const result = await runOccupancyAgent({
      facilityName: 'Apex Tower HQ',
      zones,
      totalOccupancy: summary.currentOccupancy,
      totalCapacity: summary.totalCapacity,
      overcrowdedZones: overcrowded,
      co2Anomalies,
      prompt: req.body?.prompt,
    });

    return res.json({ success: true, agent: 'Occupancy Agent', data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to execute Occupancy Agent' });
  }
}

export async function getCnnInference(req: Request, res: Response) {
  try {
    const data = await getCnnInferenceDataDb();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch CNN inference data' });
  }
}

export async function triggerCnnScan(req: Request, res: Response) {
  try {
    const { modelOverride } = req.body || {};
    const data = await triggerCnnScanDb(modelOverride);
    return res.json({ success: true, message: 'CNN Optical inference forward pass executed successfully.', data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to run CNN forward pass' });
  }
}

export async function updateCnnCameraConfig(req: Request, res: Response) {
  try {
    const { cameraId, updates } = req.body || {};
    if (!cameraId) {
      return res.status(400).json({ success: false, error: 'Camera ID is required' });
    }
    const updated = await updateCnnCameraConfigDb(cameraId, updates);
    return res.json({ success: true, camera: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update CNN camera configuration' });
  }
}


