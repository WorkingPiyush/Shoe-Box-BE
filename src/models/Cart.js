import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
            }
        }
    ]
},
    { timestamps: true }
)

export default mongoose.model("cart", cartSchema)