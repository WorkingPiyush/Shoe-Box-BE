import crypto from 'crypto';
import bcrypt from 'bcrypt';
import OTP from '../models/Otp.js';


export const genrateOtp = async (req, res) => {
    const { userId } = req.user.id;
    if (!userId) return res.json(400).json({ message: "User ID required" });

    await OTP.deleteMany({ userId });

    const otp = crypto.randomInt(1000, 9999).toString(); //4 digit otp
    const otpHash = await bcrypt.hash(otp, 10);

    await OTP.create({ userId, otpHash });
    
    res.json({ success: true, message: "OTP generated and sent" });
}