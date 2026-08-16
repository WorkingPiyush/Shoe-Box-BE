import nodemailer from "nodemailer";
import { BrevoClient } from "@getbrevo/brevo";


let transporter;
if (process.env.NODE_ENV !== "production") {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

export const SendEmail = async (to, subject, html, name = "user") => {
    // for production
    if (process.env.NODE_ENV === "production") {
        const client = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY,
        });
        const message = {
            sender: { email: process.env.EMAIL_FROM },
            to: [{ email: to, name }],
            subject,
            htmlContent: html,
        };
        try {
            const response = await client.transactionalEmails.sendTransacEmail(message);
            console.log("Email Sent:", response);
            return response.body;
        } catch (error) {
            console.error("Error sending email via Brevo API:", error);
            throw error;
        }
    } else {
        // for local dev
        return transporter.sendMail({
            form: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
    }
};