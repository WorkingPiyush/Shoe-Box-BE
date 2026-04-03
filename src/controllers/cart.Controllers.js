import ProductList from "../data/ProductList2.json" with {type: "json"};
import Cart from "../models/Cart.js";
let products = ProductList;
import dotenv from 'dotenv';
dotenv.config()
const BASE_URL = process.env.BASE_URL;

export const Update = async (req, res) => {
    try {
        const { productId, quantity, shoeSize } = req.body;
        const userId = req.user.id;
        if (!productId || !shoeSize) {
            return res.status(400).json({ success: false, message: "Provide necessary details" });
        }
        const product = products.find(item => item.id === productId);
        if (!product) {
            return res.status(400).json({ message: "Product Not Found !!" });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        const existence = cart.items.find(i => i.productId === productId && i.shoeSize === shoeSize)
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
        console.log(error)
        return res.status(500).json({ message: "Server error" });
    }
}

export const cartPreview = async (req, res) => {
    const { items } = req.body;
    try {
        const Product = items.map(item => {
            const product = products.find(p => p.id === item.productId)
            let images = product.images.map((img) => `${BASE_URL}/${img}`)
            return {
                productId: item.productId,
                thumbnail: `${BASE_URL}/${product.thumbnail}`,
                image: images,
                details: product.description,
                quantity: item.quantity,
                shoeSize: item.shoeSize,
                price: product.price,
                name: product?.name,
                total: item.quantity * product.price
            }
        });
        return res.status(200).json(Product)
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
        const Usercart = cart.items.map(item => {
            const product = products.find(prod => prod.id == item.productId);
            return {
                productId: item.productId,
                thumbnail: `${BASE_URL}/${product.thumbnail}`,
                image: product.images,
                details: product.description,
                quantity: item.quantity,
                shoeSize: item.shoeSize,
                price: product.price,
                total: item.quantity * product.price,
                name: product?.name,
                price: product?.price,
                name: product?.name,
                total: item.quantity * product.price,
                cartId: cart._id
            };
        })
        res.status(200).json(Usercart);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}