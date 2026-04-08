import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    items: [
        {
            productId: String
        }

    ]
},
    { timestamps: true }
)

export default mongoose.model("wishlist", wishlistSchema)