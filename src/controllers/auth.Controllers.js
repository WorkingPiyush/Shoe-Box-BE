import user from "../models/User.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";



export const signup = async (req, res) => {
    try {
        const fullName = req.body.fullName?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();

        if (!fullName || !email || !password) {
            return res.status(400).json({ status: false, message: "Please enter all details" });
        }

        // checking email.
        if (!validator.isEmail(email)) {
            return res.status(400).json({ status: false, message: "Invalid email" });
        }

        const emailCheck = await user.findOne({ email });

        if (emailCheck) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" })
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
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({ success: true, message: "User Created Successfully" });
    } catch (error) {
        console.error("Error in signup route", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "User already exists" })
        }
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const login = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    // console.log(email, password)

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please enter Email and Password for login !" })
    }
    // checking email.
    if (!validator.isEmail(email)) {
        return res.status(400).json({ status: false, message: "Invalid email" });
    }
    const findUser = await user.findOne({ email });
    // console.log(findUser)
    if (!findUser) {
        return res.status(404).json({ success: false, message: "Invalid email or password" });
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

        .status(200)
        .json({ success: true, message: "Login Successfully", })
}

export const logout = (req, res) => {
    return res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }).status(200).json({ success: true, message: "Logged out Successfully" })
}