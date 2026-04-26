import dotenv from 'dotenv';
dotenv.config()
import passport from "passport";
import user from "../models/User.js";
import jwt from 'jsonwebtoken';
import '../config/passport.auth.js';


export const GoogleOAuth = passport.authenticate("google", { scope: ["profile", "email"] });
export const GithubOAuth = passport.authenticate("github", { scope: ["user:email"] });
export const GoogleOAuthCb = (req, res) => {
    const user = req.user;
    const payload = { id: user._id, fullName: user.fullName, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.redirect(process.env.NODE_ENV === "production" ? process.env.PROD_FRONTEND_URL : process.env.LOCAL_FRONTEND_URL);
}
export const GithubOAuthCb = (req, res) => {
    const user = req.user;
    const payload = { id: user._id, fullName: user.fullName, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.redirect(process.env.NODE_ENV === "production" ? process.env.PROD_FRONTEND_URL : process.env.LOCAL_FRONTEND_URL);
}