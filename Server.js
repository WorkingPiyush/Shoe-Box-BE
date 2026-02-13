import dotenv from 'dotenv';
dotenv.config()
import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './src/config/connectDB.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
connectDB(process.env.MONGODB_URI)
app.get('/', (req, res) => {
    res.send("Hello from backend !!")
})
// Auth Routes
import authRoutes from './src/routes/auth.Routes.js'
app.use('/users/', authRoutes)
// userInfo
import userRoutes from './src/routes/user.Routes.js'
app.use('/api/', userRoutes)

import productRoutes from './src/routes/product.Routes.js'
app.use('/product/', productRoutes)



app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})