import express from "express";
const router = express.Router();
import { Update, CartDetails, CartInfo } from '../controllers/cart.Controllers.js'
import { authenticate } from "../middleware/auth.middleware.js";

router.put('/update', authenticate, Update);
router.get('/cartInfo', authenticate, CartDetails);
router.post('/your-cart', CartInfo);


export default router;