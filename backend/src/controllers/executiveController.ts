import { Request, Response } from 'express';
import {
  getExecutiveDashboardDb,
  getFacilityHealthScoreDb,
  getCrossAgentIntelligenceDb,
  getEnterpriseDeploymentDb,
  generateFacilityReportDb,
} from '../../../database/models/store';

export async function getExecutiveDashboard(req: Request, res: Response) {
  try {
    const data = await getExecutiveDashboardDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching executive dashboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getFacilityHealthScore(req: Request, res: Response) {
  try {
    const data = await getFacilityHealthScoreDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching facility health score:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCrossAgentIntelligence(req: Request, res: Response) {
  try {
    const data = await getCrossAgentIntelligenceDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching cross-agent intelligence:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getEnterpriseDeployment(req: Request, res: Response) {
  try {
    const data = await getEnterpriseDeploymentDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching enterprise deployment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function generateFacilityReport(req: Request, res: Response) {
  try {
    const period = (req.query.period as any) || (req.body && req.body.period) || 'monthly';
    const facility = (req.query.facility as string) || (req.body && req.body.facility) || 'Apex Tower HQ';
    const report = await generateFacilityReportDb(period, facility);
    res.json({ success: true, report });
  } catch (err: any) {
    console.error('Error generating facility report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
