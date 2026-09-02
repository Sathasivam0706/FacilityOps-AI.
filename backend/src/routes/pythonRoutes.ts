import { Router } from 'express';
import { handleEnergyForecast, handleAnomalyDetection, handleAgentOptimization } from '../controllers/pythonController';

const router = Router();

router.post('/energy-forecast', handleEnergyForecast);
router.post('/anomaly-detection', handleAnomalyDetection);
router.post('/agent-optimize', handleAgentOptimization);

export default router;
