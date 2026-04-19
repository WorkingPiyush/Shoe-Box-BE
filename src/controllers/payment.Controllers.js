import dotenv from 'dotenv';
dotenv.config();

import { razorpayInstance } from "../config/rozarpay.js";
import crypto from 'crypto';
import Cart from "../models/Cart.js";
import Product from '../models/Product.js';
import Order from '../models/Order.js';


export const createOrder = async (req, res) => {
    const userId = req.user.id
    const { cartId, address, paymentMethod } = req.body;
    try {
        // only authenticated user can access this
        if (!userId) {
            return res.status(400).json({ success: false, message: "Unauthorized" });
        }
        // if the user must provide following things
        if (!cartId || !address || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Please provide necessary details" });
        }
        // if the Payment Method does not match the standard method
        if (!["online", "cod"].includes(paymentMethod)) {
            return res.status(400).json({ error: "Invalid payment method" });
        }
        // checking cart in the db
        const cart = await Cart.findById(cartId);
        // if not found
        if (!cart) return res.status(404).json({ error: "Cart not found" });
        // also checking the using is also associated with the cart
        if (cart.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized cart access" });
        }

        let total = 0;
        const items = [];

        for (let item of cart.items) {
            // const product = products.find((i) => i.id === item.productId);
            const product = await Product.findById(item.productId)
            if (!product) continue;
            const price = product.price;
            items.push({
                productId: product._id,
                name: product.name,
                price,
                shoeSize: item.shoeSize,
                quantity: item.quantity,
                thumbnail: product.thumbnail
            })
            total += price * item.quantity;
        }
        if (total <= 0) {
            return res.status(400).json({ error: "Invalid cart total" });
        }
        // storing the acctual date as expiry
        let expiresAt = new Date((Date.now() + 15 * 60 * 1000));
        let razorpayOrder = null;
        if (paymentMethod === "online") {
            razorpayOrder = await razorpayInstance.orders.create({
                amount: Math.floor(total) * 100,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
            });
        }
        let orderId = "Order :" + Math.floor(Math.random() * 10000)
        const orderObj = {
            userId: userId,
            orderId,
            items,
            totalAmount: total,
            address,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === "cod" ? "pending" : "created",
            orderStatus: "pending",
            expiresAt: paymentMethod === "cod" ? null : expiresAt
        }
        if (razorpayOrder?.id) {
            orderObj.razorpay_orderid = razorpayOrder.id
        }
        const newOrder = await Order.create(orderObj);
        paymentMethod === "cod" && await Cart.deleteOne({ userId: userId });
        return (paymentMethod === "online") ? res.status(200).json({ payment: razorpayOrder, order: newOrder._id }) : res.status(200).json({ success: true, Order })
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ success: false, message: "Failed to create order", details: error });
    }
}
export const verifyPayment = async (req, res) => {
    try {
        const userId = req.user.id
        const { order_id, payment_id, razorpay_signature } = req.body;
        // Authoorized user allowed
        if (!userId) {
            return res.status(400).json({ success: false, message: "Unauthorized" });
        }
        const body = order_id + "|" + payment_id;
        // Verify signature
        const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body, 'utf-8').digest('hex');
        if (expectedSign !== razorpay_signature) {
            console.log(expectedSign !== razorpay_signature)
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
        const updateOrder = await Order.findOneAndUpdate(
            {
                razorpay_orderid: order_id,
                userId: userId,
                paymentStatus: { $ne: "paid" },
                expiresAt: { $gt: new Date() }
            },
            {
                $set: {
                    paymentStatus: "paid",
                    orderStatus: "confirmed",
                    razorpay_paymentid: payment_id,
                    expiresAt: null
                }
            },
            { new: true }
        )
        if (updateOrder) {
            await Cart.deleteOne({ userId: updateOrder.userId })
            return res.status(200).json({ success: true, message: "Payment verified and order created" });
        }
        // checking the order existence
        const order = await Order.findOne({ userId: userId, razorpay_orderid: order_id });
        if (!order) return res.status(404).json({ error: "Order not found" });
        // order payment status
        if (order.paymentStatus === "paid") return res.status(200).json({ success: true, message: "Payment already verified" });
        // checking if the order is expired or not
        if (order.expiresAt < new Date()) {
            return res.status(400).json({ error: "Order expired" });
        }
        return res.status(400).json({ error: "Payment not processed" });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, error: "Verification failed" });
    }
}