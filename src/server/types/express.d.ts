import { Request } from 'express';

interface User {
  id: number;
  gymId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};