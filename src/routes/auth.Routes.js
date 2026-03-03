import express from "express";
const router = express.Router();
// import verifyToken from "../middleware/verifyFirebaseToken.middleware.js";
import { firbaseLogin } from "../controllers/firebase.Controllers.js";
import { signup, login, logout } from "../controllers/auth.Controllers.js";

router.post('/signup', signup)
router.post('/firbase-login', firbaseLogin)
router.post('/login', login)
router.post('/logout', logout)


export default router;