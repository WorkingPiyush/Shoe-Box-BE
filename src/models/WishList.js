import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    items: [
        {
            productId: Number
        }

    ]
},
    { timestamps: true }
)

export default mongoose.model("wishlist", wishlistSchema)