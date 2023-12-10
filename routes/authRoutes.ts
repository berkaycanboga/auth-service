import express, { Request, Response } from 'express';
import { signup, login, logout } from '../middlewares/authUser';
const router = express.Router();
import {
  isAuthenticated,
  authenticateUser,
} from '../middlewares/authMiddleware';

router.get('/', isAuthenticated, (req: Request, res: Response) => {
  res.render('index');
});

router.post('/signup', authenticateUser, signup);
router.post('/login', authenticateUser, login);
router.get('/logout', logout);

export default router;
