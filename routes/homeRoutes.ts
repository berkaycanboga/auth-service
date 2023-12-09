import express, { Request, Response } from 'express';
import { updateUser, deleteUser } from '../middlewares/userMiddleware';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authenticateUser } from '../middlewares/authMiddleware';
const router = express.Router();

router.use(authenticateToken, authenticateUser);

router.get('/', (req: Request, res: Response) => {
  const { username } = req.body;
  res.render('home', { username });
});

router.post('/update/:username', updateUser);
router.post('/delete/:username', deleteUser);

export default router;
