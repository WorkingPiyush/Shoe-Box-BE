import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            productId: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            shoeSize: {
                type: Number,
                required: true,
            }
        }
    ]
},
    { timestamps: true }
)

export default mongoose.model("cart", cartSchema)