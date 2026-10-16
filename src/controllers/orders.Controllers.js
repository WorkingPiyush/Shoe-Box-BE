import mongoose from 'mongoose';
import { redis } from '../config/redis.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const order = async (req, res) => {
    const userId = req.user.id;
    const query = `${userId}:order`;
    const cached = await redis.get(query);
    if (cached) {
        let result = JSON.parse(cached);
        return res.status(200).json(result);
    }
    try {
        let orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found" });
        }
        const result = orders.map(order => {
            const prodDetails = (order.items || []).map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                thumbnail: i.thumbnail,
                shoeSize: i.shoeSize
            }))

            return {
                id: order.orderId,
                items: prodDetails.length,
                totalAmount: order.totalAmount,
                status: order.orderStatus,
                products: prodDetails,
                preview: prodDetails[0]?.thumbnail,
                delivery: order.address,
                payment: order.paymentMethod,
                date: order.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                }),
            }
        })
        await redis.set(query, JSON.stringify(result), "EX", 150);
        // console.log("result", result)
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}
export const ordersList = async (req, res) => {
    let orders = await Order.find().populate("userId", "fullName email").sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
        return res.status(404).json({ success: false, message: "No orders found" });
    }

    const result = orders.map(order => {
        const prodDetails = (order.items || []).map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            thumbnail: i.thumbnail,
            shoeSize: i.shoeSize
        }));


        return {
            id: order._id,
            orderId: order.orderId,
            items: prodDetails.length,
            totalAmount: order.totalAmount,
            user: order.userId,
            orderStatus: order.orderStatus,
            products: prodDetails,
            preview: prodDetails[0]?.thumbnail,
            delivery: order.address,
            payment: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            paymentId: order.razorpay_paymentid,
            date: order.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
            }),
        }
    })
    return res.status(200).json(result);
}
export const ordersPreview = async (req, res) => {
    try {
        const id = req.query.id;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order id" });
        }
        const orderPreview = await Order.findById(id).populate("userId", "fullName email").lean();

        if (!orderPreview) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, orderPreview });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
export const orderUpdate = async (req, res) => {
    try {
        const id = req.query.id;
        const orderStatus = req.body.status;
        const userId = req.body.userId;
        const updatedOrder = await Order.updateOne({ _id: id }, { $set: { orderStatus } });

        if (updatedOrder.acknowledged) {
            redis.del(`${userId}:order`)
            return res.status(200).json({ message: "Order updated successfully" });
        } else {
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: `Update Failed , ${error.message}` });
    }
}