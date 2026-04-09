import express from "express";
import {
  addOrder,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
  getOrderById,
} from "../controllers/orderController.js";
import { requireAuth, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Allow orders to be placed by guests or authenticated users (optionalAuth attaches user if present)
router.post("/add", optionalAuth, addOrder);

// Get user-specific orders
router.get("/", requireAuth, getUserOrders);

// Get all orders for admin only
router.get("/admin", requireAuth, getAdminOrders);

// Update order status - only admin should be allowed
router.put("/update/:id", requireAuth, updateOrderStatus);

// Get single order - authenticated users see their own, admin can see any
router.get("/:id", requireAuth, getOrderById);

export default router;