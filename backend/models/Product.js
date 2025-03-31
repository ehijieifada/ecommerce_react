import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    subcategory: String,
    price: Number,
    sizes: { type: [String], default: [] },  // Ensures array format
    bestseller: Boolean,
    images: { type: [String], required: true } // Ensure images are required
  });
  

const Product = mongoose.model("Product", ProductSchema);
export default Product;