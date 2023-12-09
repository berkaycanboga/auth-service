import jwt from 'jsonwebtoken';

const createToken = (username: string): string => {
  const secretKey = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.sign({ username }, secretKey, {
    expiresIn: '1h',
  });
};

const verifyToken = (token: string): any => {
  const secretKey = process.env.JWT_SECRET || 'default-secret-key';
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const clearToken = (res: any) => {
  res.clearCookie('token');
};

const authenticateUser = (req: any, res: any, next: Function) => {
  const token = req.cookies.token;

  if (!token || !verifyToken(token)) {
    return res.redirect('/');
  }

  next();
};

const isAuthenticated = (req: any, res: any, next: any) => {
  const token = req.cookies.token;

  if (req.path === '/logout') {
    return next();
  }

  if (!token) {
    return next();
  }

  res.redirect('/home');
};

export {
  createToken,
  verifyToken,
  clearToken,
  authenticateUser,
  isAuthenticated,
};
