// routes/productRoutes.js
import express from "express";
import upload from "../middleware/multer.js";
import {
  getProductList,
  addProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Routes
router.get("/list", getProductList);
router.post("/add", upload.array("images", 4), addProduct);
router.delete("/delete/:id", deleteProduct);

export default router;
