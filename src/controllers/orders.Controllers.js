import dotenv from 'dotenv';
dotenv.config()
import Order from '../models/Order.js';


export const order = async (req, res) => {
    const userId = req.user.id;
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
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}