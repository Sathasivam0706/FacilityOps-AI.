import { Request, Response } from 'express';
import {
  getCostOverviewDb,
  getCostAnalyticsDb,
  getResourceUtilizationDb,
  getBudgetMonitoringDb,
  getRoiAnalyticsDb,
  getCostRecommendationsDb,
  applyCostRecommendationDb,
  createCostRecommendationDb,
} from '../../../database/models/store';
import { runCostOptimizationAgent } from '../../../ai/agents/costAgent';

export async function getCostOverview(req: Request, res: Response) {
  try {
    const data = await getCostOverviewDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching cost overview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCostAnalytics(req: Request, res: Response) {
  try {
    const data = await getCostAnalyticsDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching cost analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getResourceUtilization(req: Request, res: Response) {
  try {
    const data = await getResourceUtilizationDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching resource utilization:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getBudgetMonitoring(req: Request, res: Response) {
  try {
    const data = await getBudgetMonitoringDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching budget monitoring:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getRoiAnalytics(req: Request, res: Response) {
  try {
    const data = await getRoiAnalyticsDb();
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching ROI analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCostRecommendations(req: Request, res: Response) {
  try {
    const data = await getCostRecommendationsDb();
    res.json({ success: true, recommendations: data });
  } catch (err: any) {
    console.error('Error fetching cost recommendations:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function applyCostRecommendation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await applyCostRecommendationDb(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }
    res.json({ success: true, recommendation: updated });
  } catch (err: any) {
    console.error('Error applying cost recommendation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function runCostAgent(req: Request, res: Response) {
  try {
    const { facilityName, focusCategory, userQuery } = req.body || {};
    const result = await runCostOptimizationAgent({
      facilityName,
      focusCategory,
      userQuery,
    });
    res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error running cost optimization agent:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
