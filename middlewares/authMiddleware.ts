import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  username: string;
}

const createToken = (username: string): string => {
  const secretKey = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.sign({ username }, secretKey, {
    expiresIn: '1h',
  });
};

const verifyToken = (token: string): DecodedToken => {
  const secretKey = process.env.JWT_SECRET || 'default-secret-key';
  try {
    const decoded = jwt.verify(token, secretKey) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const clearToken = (res: Response): void => {
  res.clearCookie('token');
};

const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies.token;

  if (req.path === '/login' || req.path === '/signup') {
    return next();
  }

  if (!token || !verifyToken(token)) {
    return res.redirect('/');
  }

  next();
};

const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies.token;

  if (req.path === '/logout') {
    return next();
  }

  if (!token) {
    return next();
  }
  // for test purposes this line commented out.
  // res.redirect('/home');
  res.json({ message: 'Logged in or Signed up successfully' });
};

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

export {
  createToken,
  verifyToken,
  clearToken,
  authenticateUser,
  isAuthenticated,
  authenticateToken,
};
