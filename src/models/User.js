import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
    },
    gender: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user" || "admin"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 100
    },
},
    { timestamps: true }
)

export default mongoose.model("user", userSchema)