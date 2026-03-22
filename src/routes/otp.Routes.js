import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { generateOtp, verifyOtp } from "../controllers/otp.Controllers.js";
import rateLimit from "express-rate-limit";
const otpSendLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many OTP requests" }
})
const otpVerifyLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many verification attempts" }
})

router.post('/send', otpSendLimit, authenticate, generateOtp)
router.post('/verify', otpVerifyLimit, authenticate, verifyOtp)


export default router;