import express from "express";
import {
  addOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/add", addOrder);
router.get("/", getAllOrders);
router.put("/update/:id", updateOrderStatus);
router.get("/:id", getOrderById);

export default router;
