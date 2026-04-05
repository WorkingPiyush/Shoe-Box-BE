import express from "express";
const router = express.Router();
import { productPage, productArr } from "../controllers/product.Controllers.js";

router.get('/products', productArr) // for product items gender-wise
router.get('/page', productPage)


export default router;