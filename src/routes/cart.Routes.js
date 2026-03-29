import express from "express";
const router = express.Router();
import { Update, Usercart, cartPreview } from '../controllers/cart.Controllers.js'
import { authenticate } from "../middleware/auth.middleware.js";

router.get('/', authenticate, Usercart);
router.put('/update', authenticate, Update);
router.post('/preview', cartPreview);


export default router;