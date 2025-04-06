import Order from "../models/orderModel.js";
import mongoose from "mongoose";

// Add New Order
export const addOrder = async (req, res) => {
  try {
    console.log("📦 Incoming Order Request:", JSON.stringify(req.body, null, 2));

    let { items, total, deliveryInfo, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid or missing items array in request body" });
    }

    items = items.map((item) => ({
      ...item,
      _id: item._id ? String(item._id) : new mongoose.Types.ObjectId().toString(),
      images: item.images && item.images.length > 0 ? item.images : [`$BACKEND_URL`],
    }));

    const newOrder = new Order({
      items,
      total,
      date: new Date(),
      status: "Pending",
      deliveryInfo,
      paymentMethod,
    });

    await newOrder.save();

    console.log("✅ Order Successfully Saved:", newOrder);
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status", error });
  }
};

// Get Single Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};