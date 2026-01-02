/**
 * Passport.js Configuration - Google OAuth 2.0 Strategy
 * 
 * This file configures Google OAuth authentication using Passport.js.
 * On successful Google login, it either finds an existing user or creates a new one,
 * then issues a JWT token (same as normal login flow).
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Initialize Google OAuth Strategy
 * Only initializes if Google OAuth credentials are configured
 */
export const initializePassport = () => {
  // Check if Google OAuth is configured
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    return false;
  }

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          console.log(`[Google OAuth] Processing login for: ${email}`);

          // Check if user exists by email
          let user = await prisma.user.findUnique({
            where: { email }
          });

          if (user) {
            // User exists - update googleId if missing
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { email },
                data: { googleId }
              });
              console.log(`[Google OAuth] Linked Google account to existing user: ${email}`);
            } else {
              console.log(`[Google OAuth] Existing user logged in: ${email}`);
            }
          } else {
            // Create new user with Google OAuth
            user = await prisma.user.create({
              data: {
                email,
                name,
                googleId,
                authProvider: 'google',
                password: null // Google users don't need password
              }
            });
            console.log(`[Google OAuth] Created new user: ${email}`);
          }

          // Generate JWT token (same as normal login)
          const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          // Return user with token
          return done(null, { user, token });

        } catch (error) {
          console.error('[Google OAuth] Error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session (not used since we're using JWT, but required)
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  console.log('✅ Google OAuth configured');
  return true;
};

export default passport;
