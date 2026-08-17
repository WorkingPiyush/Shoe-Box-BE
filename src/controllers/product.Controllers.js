import { redis } from '../config/redis.js';
import Product from '../models/Product.js';


export const productPage = async (req, res) => {
    try {
        const gender = req.query.gender;
        const slug = req.query.slug;
        const query = `product:${slug}`
        const cached = await redis.get(query);
        if (cached) {
            let result = JSON.parse(cached);
            return res.status(200).json(result);
        }

        if (!gender || !slug) {
            return res.status(400).json({ success: false, message: "Necessary details not provided" });
        }
        // console.log(gender, slug)
        const product = await Product.findOne({ slug: slug, gender: gender });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found !!" });
        }
        await redis.set(query, JSON.stringify(product), "EX", 120);
        return res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
}

export const productArr = async (req, res) => {
    try {
        const { gender, page = 1, limit = 20 } = req.query;

        const pageNum = parseInt(page); // starting point
        const size = parseInt(limit); // next document or next limit document to be returned


        // Page can't be more then 30 or Page can't be less then 0 
        if (isNaN(pageNum) || pageNum > 30 || pageNum <= 0) {
            return res.status(400).json({ sucess: false, message: "Invalid Page No" });
        }
        // Limit can't be more then 30 or Limit can't be less then 0 
        if (isNaN(parseInt(size)) || size > 30 || size <= 0) {
            return res.status(400).json({ sucess: false, message: "Invalid Limit" });
        }

        // allowed genders
        const allowedGenders = ['male', 'female', 'kids', 'unisex'];
        if (gender && !allowedGenders.includes(gender)) {
            return res.status(400).json({ success: false, message: "Invalid Gender" });
            console.error("Invalid Gender");
        }

        const filter = {};
        if (gender) {
            filter.gender = gender;
        };

        const genderQuery = gender || "all";
        const productQuery = `products:${genderQuery}:page:${pageNum}:limit:${size}`;
        const countQuery = `products:${genderQuery}`;

        const cachedProducts = await redis.get(productQuery);
        const cachedCount = await redis.get(countQuery);

        let finalProducts;
        let total;

        if (cachedProducts) {
            finalProducts = JSON.parse(cachedProducts);
        } else {
            const start = (pageNum - 1) * size; // skiping point or starting point
            finalProducts = await Product.find(filter).skip(start).limit(size).lean(); // paginated result
            await redis.set(productQuery, JSON.stringify(finalProducts), "EX", 300);
        }

        if (cachedCount) {
            total = parseInt(cachedCount);
        } else {
            total = await Product.countDocuments(filter);
            await redis.set(countQuery, total.toString(), "EX", 300);
        }

        return res.status(200).json({
            product: finalProducts,
            totalPages: Math.ceil(total / size), // total response pages as Product.countDocuments({ gender }) 
            currentPage: pageNum
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }

}
