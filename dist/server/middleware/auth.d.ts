import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
declare module 'express-session' {
    interface SessionData {
        passport: {
            user: number;
        };
    }
}
declare global {
    namespace Express {
        interface User {
            id: number;
            username: string;
            email: string;
            name: string | null;
            profile_photo: string | null;
            created_at: Date;
            member_since: Date;
            gym_id: number | null;
            user_type: 'demo' | 'user' | 'admin';
        }
    }
}
export declare const isAuthenticated: (req: Request, res: Response, next: NextFunction) => void;
export default passport;
