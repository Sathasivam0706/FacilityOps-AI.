import { Router } from 'express';
import {
  getSecurityEvents,
  getSecurityAlerts,
  getSecuritySummary,
  createSecurityEvent,
  resolveSecurityEvent,
  getAccessLogs,
  simulateAccessEvent,
  runSecurityAgentAction,
} from '../controllers/securityController';

const router = Router();

router.get('/events', getSecurityEvents);
router.get('/alerts', getSecurityAlerts);
router.get('/summary', getSecuritySummary);
router.get('/access-logs', getAccessLogs);
router.post('/events', createSecurityEvent);
router.post('/events/:id/resolve', resolveSecurityEvent);
router.post('/simulate-access', simulateAccessEvent);
router.post('/agent', runSecurityAgentAction);

export default router;
