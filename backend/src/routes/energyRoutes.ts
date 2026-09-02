import { Router } from 'express';
import {
  getEnergyLoadCurve,
  applyEnergySetback,
  getEnergyTariffSettings,
  updateEnergyTariffSettings,
  getCopAlarmLimits,
  updateCopAlarmLimits,
} from '../controllers/energyController';

const router = Router();

router.get('/load-curve', getEnergyLoadCurve);
router.post('/setback', applyEnergySetback);
router.get('/tariff', getEnergyTariffSettings);
router.post('/tariff', updateEnergyTariffSettings);
router.get('/cop-limits', getCopAlarmLimits);
router.post('/cop-limits', updateCopAlarmLimits);

export default router;

