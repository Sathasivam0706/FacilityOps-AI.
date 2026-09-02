import { Router } from 'express';
import {
  getOccupancyZones,
  getOccupancySummary,
  getOccupancyTrends,
  createOrUpdateZone,
  adjustZoneVentilation,
  runOccupancyAgentAction,
  getCnnInference,
  triggerCnnScan,
  updateCnnCameraConfig,
} from '../controllers/occupancyController';

const router = Router();

router.get('/', getOccupancyZones);
router.get('/zones', getOccupancyZones);
router.get('/summary', getOccupancySummary);
router.get('/trends', getOccupancyTrends);
router.post('/zones', createOrUpdateZone);
router.post('/ventilation', adjustZoneVentilation);
router.post('/agent', runOccupancyAgentAction);

// CNN Convolutional Neural Network Vision Endpoints
router.get('/cnn/inference', getCnnInference);
router.post('/cnn/scan', triggerCnnScan);
router.post('/cnn/camera-config', updateCnnCameraConfig);

export default router;
