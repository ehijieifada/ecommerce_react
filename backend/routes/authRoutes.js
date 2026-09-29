import express from "express";
import {
	userSignup,
	userLogin,
	authMe,
	authLogout,
	requestPasswordReset,
	resetPassword,
} from "../controllers/authController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const passwordResetRequestLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many reset requests. Please try again later." },
});

const passwordResetLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many reset attempts. Please try again later." },
});

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/forgot-password", passwordResetRequestLimiter, requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.get("/me", authMe);
router.post("/logout", authLogout);

export default router;
