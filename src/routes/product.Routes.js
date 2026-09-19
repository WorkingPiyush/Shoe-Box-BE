import express from "express";
const router = express.Router();
import { productPage, productArr, productSearch } from "../controllers/product.Controllers.js";


router.get('/products', productArr); // for product items gender-wise
router.get('/page', productPage);
router.get('/search', productSearch);


export default router;