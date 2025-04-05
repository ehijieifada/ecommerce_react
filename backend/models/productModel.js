import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true }, 
  category: { type: String, required: true },
  subCategory: { type: String }, 
  sizes: { type: [String], required: true },
  bestseller: { type: Boolean, default: false },
  date: { type: Date, default: Date.now } 
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
