import mongoose from 'mongoose';
import cloudinary from '../config/cloudnary.js';
import { redis } from '../config/redis.js';
import Product from '../models/Product.js';
import uploadImages from '../service/ImageUpload.js';
import { productSchema } from '../zod/productValidSchema.js';

const slugFy = (txt) => {
    if (typeof txt !== "string") throw new Error("Slug not available for this text");
    return txt.toLowerCase().split(" ").join("-");
}

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

export const productList = async (req, res) => {
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
            console.error("Invalid Gender");
            return res.status(400).json({ success: false, message: "Invalid Gender" });
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

export const productSearch = async (req, res) => {
    try {
        const { query } = req.query;
        const { gender } = req.query;

        if (!query.trim()) {
            return res.status(400).json({ message: "Search query is required" });
        }
        const search = query.trim();

        const products = await Product.find({
            $and: [
                { gender: gender },
                {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { brand: { $regex: search, $options: "i" } },
                        { gender: { $regex: search, $options: "i" } },
                        { category: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                        { slug: { $regex: search, $options: "i" } },
                    ]
                }
            ]
        }).limit(10).sort({ createdAt: -1 });
        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Error in DB" });
    }

}

export const addProduct = async (req, res) => {
    let uploadResults = [];

    try {
        let sizes;

        try {
            sizes = JSON.parse(req.body?.sizes);
        } catch (error) {
            return res.status(400).json({
                message: "Invalid sizes format",
            });
        }

        const body = {
            ...req.body,
            sizes,
        };

        const result = productSchema.safeParse(body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            })
        }
        const data = {
            ...result.data,
            slug: slugFy(result.data.name),
            thumbnail: imageUrls[0].url
        };
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "At least one image is required",
            });
        };

        uploadResults = await Promise.all(files.map((file) => uploadImages(file.buffer)));
        data.images = uploadResults.map((result) => (result.secure_url))

        const newProduct = await Product.create(data);

        await redis.del(`products:${data.gender || "all"}`);
        return res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        })

    } catch (error) {
        console.log(error.message)
        if (uploadResults.length > 0) {
            await Promise.all(
                uploadResults.map((result) =>
                    cloudinary.uploader.destroy(result.public_id)
                )
            );
        }
        return res.status(500).json({
            message: "Product Addition Failed",
        })
    }

}

export const updateProduct = async (req, res) => {
    let uploadedImages = [];

    try {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({
                message: "Product Id is required",
            });
        };

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        };

        let sizes;
        if (req.body?.sizes !== undefined) {
            try {
                sizes = JSON.parse(req.body.sizes);
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid sizes format",
                });
            }
        }

        const body = {
            ...req.body,
            ...(sizes !== undefined && { sizes })
        }

        const result = productSchema.partial().safeParse(body);

        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const data = {
            ...result.data,
        };

        if (req.files && req.files?.length > 0) {
            uploadedImages = await Promise.all(
                req.files.map((file) =>
                    uploadImages(file.buffer)
                )
            );

            data.images = uploadedImages.map((result) => (result.secure_url));
            data.thumbnail = data.images[0]
        }



        if (data.name) {
            data.slug = slugFy(data.name);
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );

        await redis.del(`product:${updatedProduct.slug}`);
        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.log(error);

        if (uploadedImages.length > 0) {
            await Promise.allSettled(
                uploadedImages.map((image) =>
                    cloudinary.uploader.destroy(image.public_id)
                )
            );
        }
        return res.status(500).json({
            message: "Product update failed",
        });
    }

}

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({
                message: "Product Id is required",
            });
        };

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid Product Id",
            });
        }
        const product = await Product.findById({ _id: productId }).lean()
        const result = await Product.deleteOne({ _id: productId }).lean()
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Product not found",
            })
        };
        await redis.del(`product:${product.slug}`);
        return res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Product deletion failed",
        });
    }
}
