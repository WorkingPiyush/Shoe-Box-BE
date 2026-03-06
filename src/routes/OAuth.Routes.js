import express from "express";
const router = express.Router();
import { GoogleOAuth, GoogleOAuthCb, GithubOAuth, GithubOAuthCb } from "../controllers/OAuth.Controllers.js";
import passport from "passport";

router.get('/google', GoogleOAuth)
router.get('/google/callback', passport.authenticate("google", { session: false, failureRedirect: "/login" }), GoogleOAuthCb)
router.get('/github', GithubOAuth)
router.get('/github/callback', passport.authenticate("github", { failureRedirect: "/" }), GithubOAuthCb)

export default router;