import { z } from "zod";
export const productSchema = z.object({
    brand: z.string().min(4, "Brand is required"),
    name: z.string().min(4, "Name is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    sizes: z.array(z.number()).min(1, "At least one size is required"),
    gender: z.string().min(1, "Gender is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(5, "Description is required"),
})