import ProductList from "../data/ProductList2.json" with {type: "json"};
import Order from '../models/Order.js';
let products = ProductList;
import dotenv from 'dotenv';
dotenv.config()

export const order = async (req, res) => {
    const userId = req.user.id;
    try {
        let orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found" });
        }
        const response = orders.map(order => {
            let product = order.items.map(i => {
                let item = products.find(item => item.id === i.productId)
                return {
                    name: item.name,
                    quantity: i.quantity,
                    price: item.price,
                    thumbnail: item.thumbnail,
                }
            })
            return {
                id: order.orderId,
                items: (order.items || []).length,
                totalAmount: order.totalAmount,
                status: order.orderStatus,
                products: product,
                preview: product[0]?.thumbnail,
                delivery: order.address,
                payment: order.paymentMethod,
                date: order.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }
        })
        return res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}