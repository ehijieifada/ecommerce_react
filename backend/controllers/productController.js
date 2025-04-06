import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";


// Add Product with Cloudinary Uploads
export const addProduct = async (req, res) => {
  try {
    const { name, description, category, subCategory, price, sizes, bestseller, date } = req.body;
    const imageUrls = [];

    for (const file of req.files) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" }, 
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });

      const url = await uploadPromise;
      imageUrls.push(url);
    }

    const newProduct = new Product({
      name,
      description,
      category,
      subcategory: subCategory,
      price,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true",
      images: imageUrls,
      date,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Error adding product", details: error.message });
  }
};

// Get Product List
export const getProductList = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};