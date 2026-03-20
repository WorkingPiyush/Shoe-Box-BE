import crypto from 'crypto';
import OTP from '../models/Otp.js';
import User from "../models/User.js";
import { SendEmail } from '../service/OtpService.js';
const OTP_EXPIRY_MINUTES = 5;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const generateOtp = async (req, res) => {
    const userId = req.user.id;
    const { type, contact } = req.body;
    if (!userId || !type || !contact) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    if (!['mail', 'phone'].includes(type)) {
        return res.status(400).json({ message: "Invalid Type" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (type === "mail" && user.email !== contact) {
            return res.status(400).json({ message: "Invalid Email Id" });
        }

        if (type === "phone" && user?.phone !== contact) {
            return res.status(400).json({ message: "Invalid Phone Number" });
        }

        const otp = crypto.randomInt(100000, 999999).toString(); //6 digit otp
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const existingOtp = await OTP.findOne({ userId, type });

        if (existingOtp && Date.now() - existingOtp.createdAt < 120000) {
            return res.status(429).json({ message: "Try again later" });
        }

        if (!existingOtp) {
            await OTP.create({ userId, type, otpHash });
        } else {
            existingOtp.otpHash = otpHash;
            existingOtp.createdAt = Date.now();
            await existingOtp.save();
        }
        if (type === "mail") {
            await SendEmail(contact, "Your OTP for Email Verification", `<p>Your One-Time Password (OTP) for Email Verification is: <strong>${otp}</strong>.</p><p>It is valid for ${OTP_EXPIRY_MINUTES} minutes.</p>`);
        }
        if (type === "phone") {
            // await otpSend(contact, otp);
            console.log("Otp Sent to your phone")
        }
        return res.status(200).json({ success: true, message: `OTP sent via ${type}` });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Something went wrong" });
    }

}
export const verifyOtp = async (req, res) => {
    const userId = req.user.id;
    const { otp, type } = req.body;

    if (!userId || !type || !otp) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!['mail', 'phone'].includes(type)) {
        return res.status(400).json({ message: "Invalid Type" });
    }
    try {
        const genratedOtp = await OTP.findOne({ userId, type })
        if (!genratedOtp) {
            return res.status(400).json({ success: false, message: "Invalid or Expired Otp" })
        }
        const isExpired = Date.now() - genratedOtp.createdAt.getTime() > OTP_EXPIRY_MS;
        if (isExpired) {
            await OTP.deleteOne({ _id: genratedOtp._id });
            return res.status(400).json({ success: false, message: "Invalid or Expired Otp" })
        }
        if (genratedOtp.attempts > MAX_ATTEMPTS) {
            await OTP.deleteOne({ _id: genratedOtp._id });
            return res.status(429).json({ message: "Too many attempts. Request new OTP." });
        }
        const incomingHash = crypto.createHash('sha256').update(otp).digest('hex');
        if (genratedOtp.otpHash !== incomingHash) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        await OTP.deleteOne({ _id: genratedOtp._id });
        if (type === "mail") {
            await User.findByIdAndUpdate(userId, { isEmailVerified: true })
        }
        if (type === "phone") {
            await User.findByIdAndUpdate(userId, { isPhoneVerified: true })
        }
        return res.status(200).json({ success: true, message: "OTP verified" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Something went wrong" });
    }

}