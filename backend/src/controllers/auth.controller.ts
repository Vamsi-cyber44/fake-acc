import { Request, Response } from 'express';

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { email } = req.body;
    // Minimal stub: always return a token
    return res.json({ success: true, tokens: { accessToken: 'stub-access-token', refreshToken: 'stub-refresh' }, user: { id: 'u1', email } });
  },

  register: async (req: Request, res: Response) => {
    const { email } = req.body;
    return res.json({ success: true, message: 'Registration (stub) successful', userId: 'u_stub' });
  },

  verifyMfa: async (req: Request, res: Response) => {
    return res.json({ success: true, accessToken: 'stub-mfa-token' });
  }
};
