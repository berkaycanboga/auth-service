import express from 'express';
import { signup, login, logout } from '../../controllers/userAuthControllers';
import {
  isAuthenticated,
  authenticateUser,
} from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(isAuthenticated);

router.post('/signup', authenticateUser, signup);
router.post('/login', authenticateUser, login);
router.get('/logout', logout);

export default router;
