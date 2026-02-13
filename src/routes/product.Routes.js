import express from "express";
const router = express.Router();
import { productPage, homeSectionImgs, productArr } from "../controllers/product.Controllers.js";

router.get('/', productArr) // for product items gender-wise
router.get('/home', homeSectionImgs) // for limited images...
router.get('/page', productPage)


export default router;