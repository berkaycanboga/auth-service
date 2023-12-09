import express, { Request, Response } from 'express';
import {
  createToken,
  clearToken,
  isAuthenticated,
} from '../middlewares/authMiddleware';
import connection from '../db';
import getUserByUsername from '../middlewares/getUserByUsername';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/', isAuthenticated, (req: Request, res: Response) => {
  res.render('index');
});

router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      return res.status(409).json({ error: 'Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      err => {
        if (err) {
          console.error('Error during registration:', err);
          return res.status(500).json({ error: 'Error during registration' });
        }

        const token = createToken(username);
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });

        res.redirect('/home');
      }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Error during registration' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = createToken(username);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.redirect('/home');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

router.get('/logout', (req: Request, res: Response) => {
  clearToken(res);

  res.redirect('/');
});

export default router;
