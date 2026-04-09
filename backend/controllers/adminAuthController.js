import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const attachTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

// Admin Signup
export const adminSignup = async (req, res) => {
  const { email, password } = req.body;
  // Protect signup in production: require ADMIN_SIGNUP_TOKEN (env) to be provided
  try {
    const serverToken = process.env.ADMIN_SIGNUP_TOKEN;
    // If a server token is configured, require it. If not configured, signup is allowed (useful for local dev).
    if (serverToken) {
      const provided = req.headers["x-signup-token"] || req.body.token;
      if (!provided || provided !== serverToken) {
        return res.status(403).json({ message: "Signup is disabled or invalid signup token" });
      }
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Emergency endpoint for production: create or reset admin using a one-time token
// Usage (POST /api/admin/emergency):
// Headers: { 'x-admin-token': '<ADMIN_EMERGENCY_TOKEN>' }
// Body: { action: 'create'|'reset', email: '...', password: '...' }
export const adminEmergency = async (req, res) => {
  try {
    const provided = req.headers["x-admin-token"] || req.body.token;
    const secret = process.env.ADMIN_EMERGENCY_TOKEN;
    if (!secret) return res.status(500).json({ message: "Emergency admin token not configured on server" });
    if (!provided || provided !== secret) return res.status(403).json({ message: "Forbidden" });

    const { action, email, password } = req.body;
    if (!action || !email || !password) return res.status(400).json({ message: "action, email and password are required" });

    const now = new Date().toISOString();
    const clientIp = req.ip || req.connection?.remoteAddress || "unknown";
    const logDir = path.resolve("./backend/logs");
    try { fs.mkdirSync(logDir, { recursive: true }); } catch (e) { /* ignore */ }
    const logFile = path.join(logDir, "admin_emergency.log");

    if (action === "create") {
      const existing = await Admin.findOne({ email });
      if (existing) {
        const msg = `${now} | ${clientIp} | create | ${email} | failed: already exists\n`;
        fs.appendFileSync(logFile, msg);
        return res.status(400).json({ message: "Admin already exists" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ email, password: hashed });
      await newAdmin.save();
      const msg = `${now} | ${clientIp} | create | ${email} | success\n`;
      fs.appendFileSync(logFile, msg);
      return res.status(201).json({ message: "Admin created" });
    } else if (action === "reset") {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        const msg = `${now} | ${clientIp} | reset | ${email} | failed: not found\n`;
        fs.appendFileSync(logFile, msg);
        return res.status(404).json({ message: "Admin not found" });
      }
      admin.password = await bcrypt.hash(password, 10);
      await admin.save();
      const msg = `${now} | ${clientIp} | reset | ${email} | success\n`;
      fs.appendFileSync(logFile, msg);
      return res.json({ message: "Password reset" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("adminEmergency error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        isAdmin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    attachTokenCookie(res, token);
    res.json({ email, isAdmin: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
