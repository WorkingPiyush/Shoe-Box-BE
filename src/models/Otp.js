import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true },
});
// Auto-delete after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });


export default mongoose.model("OTP", otpSchema);