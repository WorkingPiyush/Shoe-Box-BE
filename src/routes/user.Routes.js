import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { userRes } from "../controllers/user.Controllers.js";

router.get('/user', authenticate, userRes)

export default router;