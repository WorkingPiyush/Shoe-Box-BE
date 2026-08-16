import crypto from 'crypto';
import User from "../models/User.js";
import { SendEmail } from '../service/MailOtpService.js';
import { sendPhoneOtp } from '../service/PhoneOtpService.js';
import { redis } from '../config/redis.js';

const OTP_EXPIRY_MINUTES = 5;
const OTP_EXPIRY_MS = 5 * 6 * 10;
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
        const query = `otp:${type}`;
        await redis.set(query, JSON.stringify({ hash: otpHash, attempts: 0 }), "EX", OTP_EXPIRY_MS);

        if (type === "mail") {
            await SendEmail(contact, "Your OTP for Email Verification", `<p>Your One-Time Password (OTP) for Email Verification is: <strong>${otp}</strong>.</p><p>It is valid for ${OTP_EXPIRY_MINUTES} minutes.</p>`);
        }
        if (type === "phone") {
            await sendPhoneOtp(`Your One-Time Password (OTP) for Email Verification is: ${otp} .It is valid for ${OTP_EXPIRY_MINUTES} minutes.`, contact)
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
    const query = `otp:${type}`;
    const data = await redis.get(query);
    if (!data) {
        return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }
    const otpData = JSON.parse(data);
    if (otpData.attempts >= MAX_ATTEMPTS) {
        await redis.del(query);
        return res.status(429).json({
            message: "Too many incorrect attempts",
        });
    }
    try {
        const submitedOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
        if (otpData.hash !== submitedOtpHash) {
            otpData.attempts++;
            await redis.set(query, JSON.stringify(otpData), "EX", OTP_EXPIRY_MS)
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
        await redis.del(query);

        if (type === "mail") {
            await User.findByIdAndUpdate(userId, { isEmailVerified: true })
        }
        if (type === "phone") {
            await User.findByIdAndUpdate(userId, { isPhoneVerified: true })
        }
        return res.status(200).json({ success: true, message: "OTP verified" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }

}