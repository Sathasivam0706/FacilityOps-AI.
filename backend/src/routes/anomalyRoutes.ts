import { Router } from 'express';
import {
  getAnomalies,
  triggerAnomalyDetection,
  handleAcknowledgeAnomaly,
  handleRemediateAnomaly,
} from '../controllers/anomalyController';

const router = Router();

router.get('/', getAnomalies);
router.post('/detect', triggerAnomalyDetection);
router.post('/:id/acknowledge', handleAcknowledgeAnomaly);
router.post('/:id/remediate', handleRemediateAnomaly);

export default router;
