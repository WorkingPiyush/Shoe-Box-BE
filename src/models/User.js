import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    lastProfileUpdate: {
        type: Date
    },
    oauthProvider: {
        type: String,
        enum: ["local", "google", "github"],
    },
    oauthId: {
        type: String,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: Date,
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    phoneVerifiedAt: Date,
},
    { timestamps: true }
)

export default mongoose.model("user", userSchema)