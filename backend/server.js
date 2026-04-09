import express from "express";
import mongoose, { connect } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables before importing routes/controllers that may read them
dotenv.config();

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js"; 
import genaiRoutes from "./routes/genaiRoutes.js";
import connectCloudinary from "./cloudinaryConfig.js";

const app = express();
connectCloudinary();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://blisstechiq.netlify.app'
  ],
  credentials: true
}));
// Dev helper: expose whether Authorization header was present on responses and log it
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (auth) {
      console.log('[server] Request had Authorization header (redacted):', auth.length > 24 ? `${auth.slice(0,12)}...${auth.slice(-8)}` : auth);
      res.setHeader('X-Debug-Auth', 'present');
    } else {
      console.log('[server] Request had NO Authorization header');
      res.setHeader('X-Debug-Auth', 'missing');
    }
    next();
  });
}
app.use("/uploads", express.static("uploads"));
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes); //  User Auth Routes
app.use("/api/admin", adminAuthRoutes); //  Admin Auth Routes
app.use("/api/genai", genaiRoutes); // server-side Gemini proxy

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Admin Panel Backend is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
