import Product from '../models/Product.js';
import dotenv from 'dotenv';
dotenv.config()

export const productPage = async (req, res) => {
    try {
        const { gender, slug } = req.query;
        const product = await Product.findOne({ slug: slug, gender: gender })
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found !!" });
        }
        return res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}

export const productArr = async (req, res) => {
    try {
        const { gender, page = 1, limit = 20 } = req.query;
        // Limit can't be more then 30 or Limit can't be less then 30 and Limit is Not a Number
        if (parseInt(limit) > 30 || parseInt(limit) <= 0 || isNaN(parseInt(limit))) {
            return res.status(400).json({ sucess: false, message: "Invalid Type of Limit" });
        }
        // Page can't be more then 30 or Page can't be less then 30 and Page is Not a Number
        if (parseInt(page) > 30 || parseInt(page) <= 0 || isNaN(parseInt(page))) {
            return res.status(400).json({ sucess: false, message: "Invalid Type of Page No" });
        }
        // allowed genders
        const allowedGenders = ['male', 'female', 'unisex'];
        const filter = {};
        if (gender && allowedGenders.includes(gender)) filter.gender = gender;
        const pageNum = Math.max(1, parseInt(page)); // starting point
        const size = Math.min(50, parseInt(limit)); // next document or next limit document to be returned
        const total = await Product.countDocuments(filter) // total documents gender wise

        const start = (pageNum - 1) * size; // skiping point or starting point
        const finalProducts = await Product.find(filter).skip(start).limit(size) // paginated result
        return res.status(200).json({
            product: finalProducts,
            totalPages: Math.ceil(total / size), // total response pages as Product.countDocuments({ gender }) 
            currentPage: pageNum
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }

}
