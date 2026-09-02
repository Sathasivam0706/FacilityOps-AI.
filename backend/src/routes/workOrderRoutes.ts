import { Router } from 'express';
import { getWorkOrders, createWorkOrder, updateWorkOrder, getEquipmentHealth } from '../controllers/workOrderController';

const router = Router();

router.get('/', getWorkOrders);
router.get('/equipment', getEquipmentHealth);
router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);

export default router;

