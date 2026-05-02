import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { db } from "./db";
import { Role } from "../types/enum";

// ─── Google Strategy ───────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), false);

        let user = await db.user.findFirst({
          where: { OR: [{ googleId: profile.id }, { email }] },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isEmailVerified: true,
              isActive: true,
              role: Role.USER,
            },
          });
        } else if (!user.googleId) {
          user = await db.user.update({
            where: { id: user.id },
            data: { googleId: profile.id, isActive: true },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// ─── Facebook Strategy ─────────────────────────────────────────────────────────
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        let user = await db.user.findFirst({
          where: {
            OR: [
              { facebookId: profile.id },
              ...(email ? [{ email }] : []),
            ],
          },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              name: profile.displayName,
              email: email ?? `fb_${profile.id}@placeholder.com`,
              facebookId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isEmailVerified: true,
              isActive: true,
              role: Role.USER,
            },
          });
        } else if (!user.facebookId) {
          user = await db.user.update({
            where: { id: user.id },
            data: { facebookId: profile.id, isActive: true },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;