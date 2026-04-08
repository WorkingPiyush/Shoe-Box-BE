import Product from '../models/Product.js';
import WishList from "../models/WishList.js";
import dotenv from 'dotenv';
dotenv.config()

export const wishlistToggle = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(400).json({ message: "Product Not Found !!" });
        let wishList = await WishList.findOne({ userId });
        if (!wishList) {
            wishList = await WishList.create({ userId, items: [] });
        }
        let action;
        if (wishList.items.some(item => item.productId === productId)) {
            wishList.items.pull({ productId });
            action = 'removed';
        } else {
            wishList.items.addToSet({ productId });
            action = 'added';
        }
        await wishList.save();
        return res.json({ status: action, wishlist: wishList });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}
export const wishlist = async (req, res) => {
    const userId = req.user.id;
    try {
        let wishlist = await WishList.findOne({ userId });
        if (!wishlist) {
            return res.status(200).json([])
        } else {
            return res.status(200).json(wishlist.items)
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}
export const wishlistInfo = async (req, res) => {
    const wishList = req.body;
    try {
        const product = await Promise.all(
            wishList.map(async (item) => {
                const productDetails = await Product.findById(item.productId)
                return {
                    productId: item.productId,
                    image: productDetails.images,
                    name: productDetails.name,
                    price: productDetails.price,
                    availablity: "Available",
                    gender: productDetails.gender
                }
            })
        )
        return res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}