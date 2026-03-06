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

    addresses: [
        {
            type: {
                type: String,
                enum: ["Home", "Work", "Other"],
                default: "Home"
            },
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: String,
            isDefault: { type: Boolean, default: false }
        }
    ],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: Date,
    phone: {
        type: String,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    phoneVerifiedAt: Date,
    wishlist: [
        { type: Object }
    ],
    cart: [
        { type: Object }
    ],
    totalOrders: { type: Number }
},
    { timestamps: true }
)

export default mongoose.model("user", userSchema)