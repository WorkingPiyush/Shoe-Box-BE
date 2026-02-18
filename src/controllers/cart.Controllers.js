import express from "express";
import ProductList from "../data/ProductList2.json" with {type: "json"};
import Cart from "../models/Cart.js";

export const updateCart = async (req, res) => {
    let products = ProductList;
    try {
        const { prodId, quantity } = req.body;
        const userId = req.user.id;

        if (quantity < 0) return res.status(400).json({ message: "Invalid Quantity" });
        const product = products.find(item => item.id === prodId);
        if (!product) return res.status(400).json({ message: "Product Not Found !!" });

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        const itemIndx = cart.items.findIndex(item => item.id === prodId);

        let productId = prodId;
        if (quantity == 0) {
            cart.items = cart.items.filter(item => item.id === productId);
        }
        if (itemIndx > -1) {
            cart.items[itemIndx].quantity = quantity;
            return

        }
        else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}