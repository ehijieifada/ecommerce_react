import express from "express";
import { adminSignup, adminLogin, adminEmergency } from "../controllers/adminAuthController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiter for admin login to mitigate brute-force attempts
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 6, // limit each IP to 6 login requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many login attempts, please try again later." },
});

router.post("/signup", adminSignup); // Protected by ADMIN_SIGNUP_TOKEN if configured
router.post("/login", loginLimiter, adminLogin);
// Emergency admin endpoint (token protected) - no frontend exposure
router.post("/emergency", adminEmergency);

export default router;
