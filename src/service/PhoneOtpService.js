import dotenv from 'dotenv';
import twilio from "twilio";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendPhoneOtp = async (body, to) => {
    try {
        const res = await client.messages.create({
            body,
            from: process.env.TWILIO_MY_PHONE,
            to,
        })
        console.log("Phone Otp Sent: ", res.sid);
    } catch (error) {
        console.error(error)
    }
}