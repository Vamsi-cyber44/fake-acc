import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization') || req.header('Authorization');
  if (!header) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  // Very small stub: in production verify JWT and attach user
  const token = header.replace(/^Bearer\s+/i, '');
  req.user = { id: 'local', token };
  next();
}
