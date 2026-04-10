import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "none",   // REQUIRED for cross-site
  secure: true,       // MUST be true in production (HTTPS)
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getTokenFromCookie = (req) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));

  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

const attachTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

const clearTokenCookie = (res) => {
  res.cookie(COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
};

// User Signup
export const userSignup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email: normalizedEmail, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// User Login
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    console.log("🔐 Login attempt with email:", normalizedEmail);
    console.log("🔐 User found in DB:", user ? `yes (${user.email})` : "no");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    attachTokenCookie(res, token);
    console.log("✅ Login successful. JWT payload email:", user.email);
    res.json({ email: user.email, isAdmin: false });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const authMe = async (req, res) => {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      return res.status(200).json({ user: null });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = {
      email: payload.email,
      isAdmin: !!payload.isAdmin,
      userId: payload.userId,
      adminId: payload.adminId,
    };
    return res.status(200).json({ user });
  } catch (error) {
    console.error("authMe error:", error);
    return res.status(200).json({ user: null });
  }
};

export const authLogout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};
