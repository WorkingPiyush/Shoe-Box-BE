import express from "express";
import ProductList from "../data/ProductList2.json" with {type: "json"};
import Cart from "../models/Cart.js";
let products = ProductList;

export const updateCart = async (req, res) => {
    try {
        const { productId, quantity, shoeSize } = req.body;
        const userId = req.user.id;
        if (quantity < 0) return res.status(400).json({ message: "Invalid Quantity" });
        const product = products.find(item => item.id === productId);
        if (!product) return res.status(400).json({ message: "Product Not Found !!" });
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        const productCheck = cart.items.find(i => i.productId === productId && i.shoeSize === shoeSize)
        if (quantity == 0) {
            cart.items = cart.items.filter(i => i.productId !== productId && i.shoeSize === shoeSize);
        }
        if (productCheck) {
            productCheck.quantity += productCheck.quantity;
        }
        else {
            cart.items.push({ productId, quantity, shoeSize });
        }
        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}

export const getCart = async (req, res) => {
    const { Usercart } = req.body;
    try {
        const Product = Usercart.map(item => {
            const productDetails = products.find(p => p.id === item.productId)
            return {
                productId: item.productId,
                image: productDetails.image,
                details: productDetails.name,
                quantity: item.quantity,
                size: item.shoeSize,
                price: productDetails.price,
                total: item.quantity * productDetails.price
            }
        });
        return res.status(200).json(Product)
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}

export const cartInfo = async (req, res) => {
    const userId = req.user.id;
    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(200).json([])
        } else {
            return res.status(200).json(cart.items)
        }

    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}