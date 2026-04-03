import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createOrder, verifyPayment } from "../controllers/payment.Controllers.js";
const router = express.Router();
import rateLimit from "express-rate-limit";
const paymentLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many payment requests" }
})

router.post('/createOrder', paymentLimit, authenticate, createOrder)
router.post('/verifyPayment', paymentLimit, authenticate, verifyPayment)

export default router;