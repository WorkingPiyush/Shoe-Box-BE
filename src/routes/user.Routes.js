import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.middleware.js";
import { UserInfo, updateAddress, addAddress, AddressBook, deleteAddress, fetchAddress, profileUpdate } from "../controllers/user.Controllers.js";

router.get('/user', authenticate, UserInfo)
router.get('/address', authenticate, AddressBook) // for getting user's Address
router.post('/address', authenticate, addAddress) // adding the address of user
router.put('/address/:id', authenticate, updateAddress) // updating the address of user
router.delete('/address/:id', authenticate, deleteAddress) // delete the address of user
router.get('/location', authenticate, fetchAddress) // get user's live location
router.put('/profile', authenticate, profileUpdate) // get user's live location

export default router;