import { Router } from 'express';
import {
  getAuditReport,
  getReports,
  generateReportPreview,
  exportReport,
  downloadReport,
  deleteReport,
} from '../controllers/reportController';

const router = Router();

router.get('/audit', getAuditReport);
router.get('/', getReports);
router.get('/generate', generateReportPreview);
router.post('/export', exportReport);
router.get('/download/:id', downloadReport);
router.delete('/:id', deleteReport);

export default router;
