import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    items: [
        {
            productId: {
                type: Number,
                required: true
            },
            name: String,
            price: Number,
            quantity: Number,
            shoeSize: Number,
        },
    ],

    totalAmount: {
        type: Number,
        required: true,
    },
    address: {
        type: Object,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["online", "cod"],
        required: true
    },
    razorpay_orderid: {
        type: String,
        index: true,
        unique: true,
        sparse: true,
        default: undefined
    },
    razorpay_paymentid: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentStatus: {
        type: String,
        enum: ["created", "paid", "failed", "pending"],
        default: "created",
        index: true,
    },
    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    expiresAt: {
        type: Date,
    },
},
    { timestamps: true }
)
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("order", orderSchema)
