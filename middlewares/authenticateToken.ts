import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './authMiddleware';

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = verifyToken(token);
    req.body.username = decoded.username;
    next();
  } catch (error) {
    console.error('Error during token verification:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export { authenticateToken };
