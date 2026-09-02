import { Router } from 'express';
import { login, register, me, logout } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', me);
router.post('/logout', logout);

export default router;
