import { Router } from 'express';
import {
  getCostOverview,
  getCostAnalytics,
  getResourceUtilization,
  getBudgetMonitoring,
  getRoiAnalytics,
  getCostRecommendations,
  applyCostRecommendation,
  runCostAgent,
} from '../controllers/costController';

const router = Router();

router.get('/overview', getCostOverview);
router.get('/analytics', getCostAnalytics);
router.get('/resources', getResourceUtilization);
router.get('/budget', getBudgetMonitoring);
router.get('/roi', getRoiAnalytics);
router.get('/recommendations', getCostRecommendations);
router.post('/recommendations/:id/apply', applyCostRecommendation);
router.post('/agent/run', runCostAgent);

export default router;
