import { Router } from 'express';
import {
  handleEnergyAgent,
  handleMaintenanceAgent,
  handleOccupancyAgent,
  handleSecurityAgent,
  handleOrchestration,
  handleQuery,
} from '../controllers/agentController';

const router = Router();

router.post('/query', handleQuery);
router.post('/energy', handleEnergyAgent);
router.post('/maintenance', handleMaintenanceAgent);
router.post('/occupancy', handleOccupancyAgent);
router.post('/security', handleSecurityAgent);
router.post('/orchestrate', handleOrchestration);

export default router;
