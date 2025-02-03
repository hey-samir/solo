import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Will be replaced by actual credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

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

// Passport Google OAuth strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://gosolo.nyc/auth/google/callback'
        : 'http://localhost:5000/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback:', { profile_id: profile.id });

        // Check if user exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, profile.emails?.[0].value as string))
          .limit(1);

        if (existingUser.length > 0) {
          console.log('Existing user found:', existingUser[0].id);
          return done(null, existingUser[0] as Express.User);
        }

        // Create new user if doesn't exist
        const [newUser] = await db
          .insert(users)
          .values({
            username: profile.displayName,
            name: profile.displayName,
            email: profile.emails?.[0].value as string,
            profile_photo: profile.photos?.[0].value,
            password_hash: '', // Google auth doesn't need password
            created_at: new Date(),
            member_since: new Date(),
            user_type: 'user' as const
          })
          .returning();

        console.log('New user created:', newUser.id);
        return done(null, newUser as Express.User);
      } catch (error) {
        console.error('OAuth error:', error);
        return done(error as Error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    console.log('Deserializing user:', id);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      console.error('User not found during deserialization:', id);
      return done(null, false);
    }

    done(null, user as Express.User);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error);
  }
});

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth check:', { 
    isAuthenticated: req.isAuthenticated(),
    user: req.user?.id,
    session: req.session
  });

  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

export default passport;