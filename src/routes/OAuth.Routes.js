import dotenv from 'dotenv';
dotenv.config();
import express from "express";
const router = express.Router();
import { GoogleOAuth, GoogleOAuthCb, GithubOAuth, GithubOAuthCb } from "../controllers/OAuth.Controllers.js";
import passport from "passport";
const baseUrl = process.env.NODE_ENV === "production" ? process.env.PROD_FRONTEND_URL : process.env.LOCAL_FRONTEND_URL;

router.get('/google', GoogleOAuth)
router.get('/google/callback', passport.authenticate("google", { session: false, failureRedirect: `${baseUrl}/login` }), GoogleOAuthCb)

router.get('/github', GithubOAuth)
router.get('/github/callback', passport.authenticate("github", { session: false, failureRedirect: `${baseUrl}/login` }), GithubOAuthCb)

export default router;