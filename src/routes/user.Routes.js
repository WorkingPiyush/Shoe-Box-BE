import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { UserInfo } from "../controllers/user.Controllers.js";

router.get('/user', authenticate, UserInfo)

export default router;