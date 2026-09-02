import { Router } from 'express';
import {
  getMaintenanceOverview,
  getEquipmentList,
  getEquipmentDetail,
  getFailureRisks,
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  getMaintenanceRecords,
  createMaintenanceRecord,
  dispatchRecommendation,
  recalculatePredictiveMaintenance,
} from '../controllers/maintenanceController';

const router = Router();

router.get('/overview', getMaintenanceOverview);
router.get('/equipment', getEquipmentList);
router.get('/equipment/:id', getEquipmentDetail);
router.get('/failure-risks', getFailureRisks);
router.get('/schedules', getMaintenanceSchedules);
router.post('/schedules', createMaintenanceSchedule);
router.put('/schedules/:id', updateMaintenanceSchedule);
router.get('/records', getMaintenanceRecords);
router.post('/records', createMaintenanceRecord);
router.post('/recommendations/:id/dispatch', dispatchRecommendation);
router.post('/recalculate', recalculatePredictiveMaintenance);

export default router;
