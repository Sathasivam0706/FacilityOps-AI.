import { Router } from 'express';
import { getRecommendations, applyRecommendation, dismissRecommendation } from '../controllers/recommendationController';

const router = Router();

router.get('/', getRecommendations);
router.post('/:id/apply', applyRecommendation);
router.post('/:id/dismiss', dismissRecommendation);

export default router;
