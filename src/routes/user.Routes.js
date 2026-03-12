import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { UserInfo, updateAddress, addAddress, AddressBook, deleteAddress } from "../controllers/user.Controllers.js";

router.get('/user', authenticate, UserInfo)
router.get('/address', authenticate, AddressBook) // for getting user's Address
router.post('/addressUpdate', authenticate, addAddress) // adding the address of user
router.put('/address/:id', authenticate, updateAddress) // updating the address of user
router.post('/address/:id', authenticate, deleteAddress) // delete the address of user

export default router;