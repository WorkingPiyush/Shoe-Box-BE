import ProductList from "../data/ProductList2.json" with {type: "json"};
import dotenv from 'dotenv';
dotenv.config()
const BASE_URL = process.env.BASE_URL;

export const productPage = async (req, res) => {
    const id = req.query.id;
    const product = ProductList.find(prod => prod.id === Number(id));
    let images = product.images.map((img) => `${BASE_URL}/${img}`)
    return res.status(200).json({ ...product, images });
}

export const homeSectionImgs = async (req, res) => {
    const limit = req.query.limit;
    const result = ProductList.slice(0, limit);
    let finalProduct = result.map((prod) => ({
        ...prod,
        images: prod.images.map(img => `${BASE_URL}/${img}`)
    }))
    return res.status(200).json(finalProduct);
}
const genderSegment = {
    male: [],
    female: [],
    kids: []
}
for (const g of ProductList) {
    genderSegment[g.gender].push(g);
}
export const productArr = async (req, res) => {
    const { gender, page = 1, pageSize = 20 } = req.query;
    // indexing of products
    const pageNum = Math.max(1, Number(page));
    const pSize = Math.min(50, Number(pageSize));
    let filteredData = gender ? genderSegment[gender] || [] : ProductList;
    let Product = filteredData.map((prod) => ({
        ...prod,
        images: prod.images.map(img => `${BASE_URL}/${img}`)
    }))
    const total = filteredData.length; // total documents
    const start = (pageNum - 1) * pSize; // starting point
    const end = start + pSize; // ending point
    const finalProducts = Product.slice(start, end); // paginated result

    return res.status(200).json({
        product: finalProducts,
        totalPages: Math.ceil(total / pSize),
        currentPage: pageNum
    });

}
