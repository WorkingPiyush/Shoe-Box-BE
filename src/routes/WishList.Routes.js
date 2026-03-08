import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { wishlistToggle, wishlist, wishlistInfo } from "../controllers/wishList.Controllers.js";

router.get('/', authenticate, wishlist)
router.post('/toggle', authenticate, wishlistToggle)
router.post('/page', wishlistInfo)


export default router;