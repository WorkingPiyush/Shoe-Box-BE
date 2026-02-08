import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()
export const connectDB = async (url) => {
    await mongoose.connect(url).then((res) => {
        console.log("Database Connected !!")
    }).catch((err) => {
        console.log('There is an error caused', err)
        process.exit(1);
    })
}