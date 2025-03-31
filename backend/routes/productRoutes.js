import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Add Product Route (POST)
router.post("/add", upload.array("images", 4), async (req, res) => {
    try {
      const { name, description, category, subCategory, price, sizes, bestseller } = req.body;
      const images = req.files.map(file => `/uploads/${file.filename}`);
  
      const newProduct = new Product({
        name,
        description,
        category,
        subcategory: subCategory,
        price,
        sizes: JSON.parse(sizes), // Ensure sizes are stored correctly
        bestseller: bestseller === "true",
        images
      });
  
      await newProduct.save();
      res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
      res.status(500).json({ error: "Error adding product", details: error.message });
    }
  });
  
// List All Products Route (GET)
router.get("/list", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
});


// Delete Product Route
router.delete("/delete/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Error deleting product" });
    }
});



export default router;
