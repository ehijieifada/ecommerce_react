import Order from "../models/orderModel.js";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "../utils/mailer.js";
import mongoose from "mongoose";

// Generate a numeric 9-digit id and ensure uniqueness against _id and shortId in the orders collection.
async function generateUnique9DigitId() {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate a 9-digit number (first digit non-zero)
    const id = String(Math.floor(100_000_000 + Math.random() * 900_000_000));
    const exists = await Order.findOne({ $or: [{ _id: id }, { shortId: id }] }).lean().exec();
    if (!exists) return id;
  }
  throw new Error("Failed to generate unique 9-digit order id after multiple attempts");
}

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

    // Normalize delivery email to lowercase for consistent querying
    const normalizedDeliveryInfo = {
      ...deliveryInfo,
      email: deliveryInfo?.email?.toLowerCase().trim() || "",
    };

    const newId = await generateUnique9DigitId();

    const newOrder = new Order({
      _id: newId,
      items,
      total,
      date: new Date(),
      status: "Pending",
      deliveryInfo: normalizedDeliveryInfo,
      shortId: newId,
      paymentMethod,
      
    });

    await newOrder.save();

    console.log("✅ Order Successfully Saved:", newOrder);
    // Send confirmation email asynchronously; don't block the API response
    sendOrderConfirmationEmail(newOrder)
      .then(() => console.log("✅ Confirmation email process finished (see logs)."))
      .catch((err) => console.error("❌ Confirmation email error:", err));

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
};

// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    console.log("📋 getUserOrders called - req.user:", req.user);
    console.log("📋 req.isAdmin:", req.isAdmin);

    if (req.isAdmin) {
      console.log("❌ Admin token used against user orders endpoint");
      return res.status(403).json({ message: "Forbidden: admin tokens are not allowed on this endpoint" });
    }

    const userEmail = req.user?.email?.toLowerCase();
    console.log("🔍 User email from token (lowercase):", userEmail);
    
    if (!userEmail) {
      console.log("❌ No user email found in token");
      return res.status(401).json({ message: "Unauthorized: missing user email" });
    }

    const orders = await Order.find({ 
      "deliveryInfo.email": { $regex: `^${userEmail}$`, $options: "i" } 
    }).sort({ date: -1 });
    
    console.log("✅ User query executed. Found orders:", orders.length);
    orders.forEach((order, idx) => {
      console.log(`   Order ${idx + 1}: ${order._id}, delivery email: ${order.deliveryInfo?.email}`);
    });
    
    return res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get All Orders for Admin
export const getAdminOrders = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const orders = await Order.find().sort({ date: -1 });
    console.log("✅ Admin viewing all orders. Count:", orders.length);
    return res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching admin orders:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    // Only allow admins to update order status
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Shipped",
      "Out for Delivery",
      "Ready for pickup",
      "Delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Fetch current order to enforce rules (e.g., Delivered is final)
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Cannot change status of a delivered order" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // If status changed to notify user, send status email asynchronously
    if (["Ready for pickup", "Out for Delivery"].includes(status)) {
      sendOrderStatusEmail(updatedOrder, status)
        .then(() => console.log("✅ Status email process finished (see logs)."))
        .catch((err) => console.error("❌ Status email error:", err));
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

    if (req.isAdmin) {
      return res.json(order);
    }

    const userEmail = req.user?.email?.toLowerCase();
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: missing user email" });
    }

    if (order.deliveryInfo?.email?.toLowerCase() !== userEmail) {
      return res.status(403).json({ message: "Forbidden: access restricted to your own orders" });
    }

    return res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};