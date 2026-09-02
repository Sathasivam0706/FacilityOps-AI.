import { Router } from 'express';
import {
  getExecutiveDashboard,
  getFacilityHealthScore,
  getCrossAgentIntelligence,
  getEnterpriseDeployment,
  generateFacilityReport,
} from '../controllers/executiveController';

const router = Router();

router.get('/dashboard', getExecutiveDashboard);
router.get('/health-score', getFacilityHealthScore);
router.get('/cross-agent', getCrossAgentIntelligence);
router.get('/deployment', getEnterpriseDeployment);
router.get('/report', generateFacilityReport);
router.post('/report/generate', generateFacilityReport);

export default router;
