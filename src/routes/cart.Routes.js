import express from "express";
const router = express.Router();
import { updateCart, getCart } from '../controllers/cart.Controllers.js'
import { authenticate } from "../middleware/auth.middleware.js";

router.put('/update', authenticate, updateCart)
router.get('/yourCart', authenticate, getCart)


export default router;