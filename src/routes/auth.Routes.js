import express from "express";
const router = express.Router();
import { signup, login, logout } from "../controllers/auth.Controllers.js";
import rateLimit from "express-rate-limit";
const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
})
const signupLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many accounts created from this IP."
    }
})

router.post('/signup', signupLimit, signup)
router.post('/login', loginLimit, login)
router.post('/logout', logout)


export default router;