import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { userRes, updateInfo } from "../controllers/user.Controllers.js";

router.get('/user', authenticate, userRes)
router.patch('/UpdateInfo', authenticate, updateInfo)

export default router;