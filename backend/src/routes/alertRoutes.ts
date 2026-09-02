import { Router } from 'express';
import {
  getAlerts,
  sendAlert,
  acknowledgeAlert,
  resolveAlert,
  createWorkOrderFromAlert,
  deleteAlert,
  bulkAlertActions,
  triggerTelemetryDetection,
  getAlertStats,
} from '../controllers/alertController';

const router = Router();

// 1. Query & Stats
router.get('/', getAlerts);
router.get('/stats', getAlertStats);

// 2. Detection & Creation
router.post('/send', sendAlert);
router.post('/detect', triggerTelemetryDetection);

// 3. User Actions & Resolution Lifecycle
router.post('/:id/acknowledge', acknowledgeAlert);
router.post('/:id/resolve', resolveAlert);
router.post('/:id/work-order', createWorkOrderFromAlert);

// 4. Maintenance & Deletion
router.delete('/:id', deleteAlert);
router.post('/bulk', bulkAlertActions);

export default router;
