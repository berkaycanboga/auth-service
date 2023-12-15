import express from 'express';
import { updateUser, deleteUser } from '../../controllers/userControllers';
import {
  authenticateUser,
  authenticateToken,
} from '../../middlewares/authMiddleware';

const router = express.Router();

router.use(authenticateToken, authenticateUser);

router.post('/update/:username', updateUser);
router.post('/delete/:username', deleteUser);

export default router;
