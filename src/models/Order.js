import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            productId: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            shoeSize: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            }

        }
    ],

    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    shippingAddress: {
        name: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
    }

},
    { timestamps: true }
)

export default mongoose.model("order", orderSchema)