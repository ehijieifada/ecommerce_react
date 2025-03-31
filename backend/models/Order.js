import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      size: String,
      images: { type: [String], required: true },  // Ensure images are required
    },
  ],
  total: Number,
  date: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" },
  deliveryInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: { type: String, default: "stripe" },
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
