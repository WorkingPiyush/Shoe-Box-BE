import express from "express";
const router = express.Router();
import { updateCart } from '../controllers/cart.Controllers.js'
import { authenticate } from "../middleware/auth.middleware.js";

router.put('/', authenticate, updateCart)


export default router;