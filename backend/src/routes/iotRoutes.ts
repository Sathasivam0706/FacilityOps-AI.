import { Router } from 'express';
import { getIotDevices, getIotTelemetry, ingestIotTelemetry } from '../controllers/iotController';

const router = Router();

router.get('/devices', getIotDevices);
router.get('/telemetry', getIotTelemetry);
router.post('/telemetry', ingestIotTelemetry);

export default router;
