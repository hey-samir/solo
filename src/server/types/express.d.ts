import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        gymId?: number | null;
      }
    }
  }
}

export {};