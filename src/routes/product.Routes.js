import express from "express";
const router = express.Router();
import { productPage, productList, productSearch } from "../controllers/product.Controllers.js";


router.get('/products', productList); // for product items gender-wise
router.get('/page', productPage);
router.get('/search', productSearch);


export default router;