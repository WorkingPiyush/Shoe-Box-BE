import express from "express";
import ProductList from "../data/ProductList2.json" with {type: "json"};



export const productPage = async (req, res) => {
    const id = req.query.id;
    const result = ProductList.find(prod => prod.id === Number(id));
    res.status(200).json(result);
}

export const homeSectionImgs = async (req, res) => {
    const limit = req.query.limit;
    const result = ProductList.slice(0, limit);
    res.status(200).json(result);
}
export const productArr = async (req, res) => {
    const gender = req.query.gender;
    const result = ProductList.filter(item => item.gender === gender);
    res.status(200).json(result);
}
