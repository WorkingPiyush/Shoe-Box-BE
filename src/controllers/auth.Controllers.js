import user from "../models/User.js";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
dotenv.config()

export const signup = async (req, res) => {
    try {
        const { email, gender, name, password } = req.body;
        if (!name.trim() || !email.trim() || !gender.trim() || !password.trim()) {
            res.status(500).json({ status: false, message: "Please enter all details" });
        }
        const emailCheck = await user.findOne({ email });
        if (emailCheck) {
            return res.status(400).json({ success: false, message: 'User already exists. Please sign in' })
        }
        const hashedPass = await bcrypt.hash(password, 10)
        const Newuser = await user.create({
            name,
            email,
            gender,
            password: hashedPass
        })
        res.status(200).json({ success: true, message: "User Created Successfully", UserId: Newuser._id });
    } catch (error) {
        console.error("Error in signup route", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error," })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email, !password) {
        res.status(400).json({ success: false, message: "Please enter Email and Password for login !" })
    }
    const findUser = await user.findOne({ email });
    if (!findUser) {
        res.status(404).json({ success: false, message: "No User Found with this mail" });
    }

    const isMatch = bcrypt.compare(password, findUser.password);
    if (!isMatch) {
        res.status(400).json({ success: false, message: "Invalid Password !!" });
    }
    const payload = { id: findUser._id, name: findUser.name, role: findUser.role };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "2h" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 2 * 60 * 60 * 1000
    })
        .status(200)
        .json({ success: true, message: "Login Successfully", token })
}

export const logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
    }).status(200).json({ success: true, message: "Logged out Successfully" })
}