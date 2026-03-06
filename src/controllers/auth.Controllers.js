import user from "../models/User.js";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
dotenv.config()

export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !fullName.trim() || !email || !email.trim() || !password || !password.trim()) {
            return res.status(400).json({ status: false, message: "Please enter all details" });
        }
        const emailCheck = await user.findOne({ email });
        if (emailCheck) {
            return res.status(400).json({ success: false, message: 'User already exists. Please sign in' })
        }
        const hashedPass = await bcrypt.hash(password, 10)
        const newUser = await user.create({
            fullName,
            email,
            password: hashedPass
        })
        const payload = { id: newUser._id, fullName: newUser.fullName, role: newUser.role };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({ success: true, message: "User Created Successfully" });
    } catch (error) {
        console.error("Error in signup route", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !email.trim() || !password || !password.trim()) {
        return res.status(400).json({ success: false, message: "Please enter Email and Password for login !" })
    }
    const findUser = await user.findOne({ email });
    if (!findUser) {
        return res.status(404).json({ success: false, message: "No User Found with this mail" });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid Password." });
    }
    const payload = { id: findUser._id, name: findUser.fullName, role: findUser.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
        .status(200)
        .json({ success: true, message: "Login Successfully", })
}

export const logout = (req, res) => {
    return res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
    }).status(200).json({ success: true, message: "Logged out Successfully" })
}