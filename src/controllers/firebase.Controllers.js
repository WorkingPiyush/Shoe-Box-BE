import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import admin from '../config/firebaseAdmin.js';
dotenv.config()

export const firbaseLogin = async (req, res) => {
    const { Pass } = req.body;
    const decoded = await admin.auth().verifyIdToken(Pass);
    const { name, email, email_verified, uid } = decoded;
    const provider = decoded.firebase.sign_in_provider;
    let user = await User.findOne({ email });
    if (user) {
        user.authProvider = provider
        user.uid = uid;
        user.isVerified = true;
        await user.save();
    } else {
        user = await User.create({
            fullName: name,
            email,
            authProvider: provider,
            uid: uid,
            isEmailVerified: email_verified,
        })
    }
    const payload = { id: user._id, name: user.fullName, role: user.role };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "2h" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 2 * 60 * 60 * 1000
    })
        .status(200)
        .json({ success: true, message: "Login Successfully", token });
}
