import { Request, Response } from 'express';
import { getEquipmentDb, getWorkOrdersDb, getAlertsDb, getOccupancyZonesDb } from '../../../database/models/store';

export async function getDashboardOverview(req: Request, res: Response) {
  try {
    const equipment = await getEquipmentDb();
    const workOrders = await getWorkOrdersDb();
    const alerts = await getAlertsDb();
    const occupancy = await getOccupancyZonesDb();

    const totalEquipment = equipment.length;
    const avgHealth = Math.round(
      equipment.reduce((acc, eq) => acc + eq.healthScore, 0) / (totalEquipment || 1)
    );

    const activeWorkOrders = workOrders.filter((w) => w.status !== 'Completed').length;
    const criticalAlerts = alerts.filter((a) => !a.acknowledged).length;

    const totalOccupants = occupancy.reduce((acc, z) => acc + z.occupantCount, 0);

    return res.json({
      success: true,
      metrics: {
        facilityId: 'apex-hq',
        facilityName: 'Apex Tower HQ',
        activeDemandKw: 840.5,
        targetKwCap: 1000.0,
        copEfficiency: 4.12,
        overallHealthScore: avgHealth,
        totalEquipmentCount: totalEquipment,
        activeWorkOrdersCount: activeWorkOrders,
        unacknowledgedAlertsCount: criticalAlerts,
        totalOccupants: totalOccupants,
        tariffRateUsdPerKwh: 0.22,
        estimatedMonthlySavingsUsd: 17050.0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch dashboard metrics' });
  }
}

