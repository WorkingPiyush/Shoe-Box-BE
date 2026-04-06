import Cart from "../models/Cart.js";
import Product from '../models/Product.js';
import dotenv from 'dotenv';
dotenv.config()

export const Update = async (req, res) => {
    try {
        const { productId, quantity, shoeSize } = req.body;
        const userId = req.user.id;
        if (!productId || !shoeSize) {
            return res.status(400).json({ success: false, message: "Provide necessary details" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: "Product Not Found !!" });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        const existence = cart.items.find(i => i.productId === productId && i.shoeSize === shoeSize)
        console.log(existence)
        if (quantity === 0 || (existence?.quantity + quantity === 0)) {
            cart.items = cart.items.filter((i) => !(i.productId === productId && i.shoeSize === shoeSize));
            await cart.save();
            return res.status(200).json({ success: true, cart });
        }

        if (existence) {
            const prvQty = existence.quantity
            existence.quantity = prvQty + quantity;
        }
        else {
            cart.items.push({ productId, quantity, shoeSize });
        }
        await cart.save();
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

export const cartPreview = async (req, res) => {
    const items = req.body;
    console.log(items)
    try {
        const product = await Promise.all(
            items.map(async (item) => {
                const prod = await Product.findById(item.productId)
                return {
                    productId: prod._id,
                    thumbnail: prod.thumbnail,
                    image: prod.images,
                    details: prod.description,
                    quantity: item.quantity,
                    shoeSize: item.shoeSize,
                    price: prod.price,
                    name: prod.name,
                    total: item.quantity * prod.price
                }
            })
        )
        return res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}

export const Usercart = async (req, res) => {
    const userId = req.user.id;
    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(200).json([])
        const Usercart = await Promise.all(
            cart.items.map(async (item) => {
                const prod = await Product.findById(item.productId)
                return {
                    productId: item.productId,
                    uniqid: prod.id,
                    thumbnail: prod?.thumbnail,
                    image: prod?.images,
                    details: prod?.description,
                    quantity: item.quantity,
                    shoeSize: item.shoeSize,
                    price: prod?.price,
                    total: item.quantity * prod?.price,
                    name: prod?.name,
                    price: prod?.price,
                    name: prod?.name,
                    total: item.quantity * prod?.price,
                    cartId: cart._id
                }
            })
        )
        res.status(200).json(Usercart);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}