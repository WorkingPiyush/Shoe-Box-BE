import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: { type: Number },
    brand: { type: String, lowercase: true, trim: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    sizes: [Number],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    gender: { type: String, enum: ["male", "female", "kids"] },
    category: { type: String, index: true },
    description: String,
    isNew: { type: Boolean, default: false },
    images: {
        type: [String],
        required: true,
        validate: v => v.length > 0
    },
    slug: { type: String, required: true, unique: true },
    reviewsCount: { type: Number, default: 0 },
    thumbnail: {
        type: String,
        default: function () {
            return this.images[0];
        }
    },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);