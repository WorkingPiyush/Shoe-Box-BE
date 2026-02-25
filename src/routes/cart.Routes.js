import express from "express";
const router = express.Router();
import { updateCart, cartInfo, getCart } from '../controllers/cart.Controllers.js'
import { authenticate } from "../middleware/auth.middleware.js";

router.put('/update', authenticate, updateCart)
router.get('/cartInfo', authenticate, cartInfo)
router.post('/your-cart', getCart)


export default router;