import user from "../models/User.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import '../config/passport.auth.js';
import passport from "passport";
dotenv.config()

export const GoogleOAuth = passport.authenticate("google", { scope: ["profile", "email"] });
export const GithubOAuth = passport.authenticate("github", { scope: ["profile", "email"] });
export const GoogleOAuthCb = (req, res) => {
    const user = req.user;
    const payload = { id: user._id, fullName: user.fullName, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    // res.status(200).json({ success: true, message: "User Created Successfully", user: { id: user._id, fullName: user.fullName, role: user.role } });
    res.redirect("http://localhost:5173/");
}
export const GithubOAuthCb = (req, res) => {
    res.send(`Hello ${req.user.displayName} (Github)`);
}