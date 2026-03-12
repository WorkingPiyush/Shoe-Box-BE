import mongoose from "mongoose";

const Address = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    label: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    house: {
        type: String,
        required: true
    },

    locality: {
        type: String,
        required: true
    },

    city: {
        type: String,
    },

    state: {
        type: String,
        required: true
    },

    pincode: {
        type: String,
        required: true
    },

    country: {
        type: String,
        default: "India"
    },

    isDefault: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

export default mongoose.model("address", Address)