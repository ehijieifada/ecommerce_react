import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const COOKIE_NAME = "token";
const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
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

export const requestPasswordReset = async (req, res) => {
  const normalizedEmail = typeof req.body?.email === "string"
    ? req.body.email.toLowerCase().trim()
    : "";
  const responseMessage = "Password reset instructions have been sent.";

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      user.passwordResetToken = createHash("sha256").update(resetToken).digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const requestOrigin = req.get("origin");
      const allowedFrontendOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://blisstechiq.netlify.app",
        "https://blisstechiq.shop",
      ];
      const frontendUrl = process.env.FRONTEND_URL || (
        allowedFrontendOrigins.includes(requestOrigin)
          ? requestOrigin
          : process.env.NODE_ENV === "production" || process.env.RENDER === "true"
            ? "https://blisstechiq.netlify.app"
            : "http://localhost:5173"
      );
      const resetUrl = new URL("/reset-password", frontendUrl);
      resetUrl.searchParams.set("token", resetToken);

      sendPasswordResetEmail(normalizedEmail, resetUrl.toString())
        .catch((error) => console.error("Password reset email error:", error));
    }

    return res.json({ message: responseMessage });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.json({ message: responseMessage });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== "string" || typeof password !== "string" || !token || !password) {
    return res.status(400).json({ message: "Reset token and new password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  try {
    const hashedToken = createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "This password reset link is invalid. Request a new one and use the latest email." });
    }
    if (!user.passwordResetExpires || user.passwordResetExpires <= new Date()) {
      return res.status(400).json({ message: "This password reset link has expired. Request a new one." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Unable to reset password. Please try again." });
  }
};
