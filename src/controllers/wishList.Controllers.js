import ProductList from "../data/ProductList2.json" with {type: "json"};
let products = ProductList;
import WishList from "../models/WishList.js";
import dotenv from 'dotenv';
dotenv.config()
const BASE_URL = process.env.BASE_URL;

export const wishlistToggle = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        const product = products.find(item => item.id === productId);
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
        const product = wishList.map(item => {
            const productDetails = products.find(p => p.id === item.productId)
            let images = productDetails.images.map((img) => `${BASE_URL}/${img}`)
            return {
                productId: item.productId,
                image: images,
                name: productDetails.name,
                price: productDetails.price,
                availablity: "Available",
                gender: productDetails.gender
            }
        });
        return res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}