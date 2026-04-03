import express from "express";
const router = express.Router();
import { order } from "../controllers/orders.Controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

router.get('/', authenticate, order);

export default router;