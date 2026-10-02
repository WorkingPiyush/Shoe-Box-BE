import express from "express";
const router = express.Router();
import { addProduct, updateProduct, deleteProduct, productList } from "../controllers/product.Controllers.js";
import upload from "../config/multer.js";
import { ordersList, ordersPreview, orderUpdate } from "../controllers/orders.Controllers.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { usersList } from "../controllers/user.Controllers.js";


router.get('/orders', isAdmin, ordersList);
router.get('/order', isAdmin, ordersPreview);
router.patch('/order', isAdmin, orderUpdate);

router.post('/products', isAdmin, productList);
router.post('/add', isAdmin, upload.array("images", 2), addProduct);
router.patch('/update', isAdmin, upload.array("images", 2), updateProduct);
router.delete('/delete', isAdmin, deleteProduct);


router.get('/users', isAdmin, usersList);




export default router;