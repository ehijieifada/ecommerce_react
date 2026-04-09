import mongoose from "mongoose";

// Use a short string _id so the DB object id can be a 9-digit numeric string.
const orderSchema = new mongoose.Schema({
  _id: { type: String },
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
  // Short numeric order id for display (max 9 digits). Generated at creation.
  shortId: { type: String, unique: true, index: true },
  // Note: no createdBy fields in original schema
});

const order = mongoose.model("Order", orderSchema);
export default order;
