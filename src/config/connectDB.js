import mongoose from "mongoose";

export const connectDB = async (url) => {
    try {
        await mongoose.connect(url);
        console.log("Database Connected !!");
    } catch (error) {
        console.error("There is an error caused:", error);
        throw error;
    }
}