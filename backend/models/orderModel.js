import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      size: String,
      images: { type: [String], required: true }, 
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

const order = mongoose.model("Order", orderSchema);
export default order;
