import dotenv from "dotenv";
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitubStrategy } from 'passport-github2';
import { handleOAuthUser } from "../service/oauthUserService.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const name = profile.displayName || profile.username;
        const email = profile.emails?.[0]?.value;
        const id = profile.id;
        const user = await handleOAuthUser({
            email, name, id, provider: "google"
        })
        return done(null, user)
    } catch (err) {
        return done(err, null);
    }
}))

passport.use(new GitubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
    try {
        const name = profile.displayName || profile.username;
        const email = profile.emails?.[0]?.value;
        const id = profile.id;
        const user = handleOAuthUser({
            email, name, id, provider: "github"
        })
        return done(null, user)
    } catch (err) {
        return done(err, null);
    }
}))