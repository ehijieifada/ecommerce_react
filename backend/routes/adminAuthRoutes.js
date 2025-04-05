import express from "express";
import { adminSignup, adminLogin } from "../controllers/adminAuthController.js";

const router = express.Router();

router.post("/signup", adminSignup); // One-time use
router.post("/login", adminLogin);

export default router;
