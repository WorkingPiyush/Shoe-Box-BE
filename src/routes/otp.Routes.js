import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { genrateOtp } from "../controllers/otp.Controllers.js";


router.get('/verifymail', authenticate, genrateOtp)


export default router;