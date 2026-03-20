import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, enum: ["mail", "phone"], required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true },
});
// Auto-delete after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
otpSchema.index({ userId: 1, type: 1 }, { unique: true });

export default mongoose.model("OTP", otpSchema);