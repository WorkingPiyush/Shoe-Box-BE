import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { generateOtp, verifyOtp } from "../controllers/otp.Controllers.js";


router.post('/send', authenticate, generateOtp)
router.post('/verify', authenticate, verifyOtp)


export default router;