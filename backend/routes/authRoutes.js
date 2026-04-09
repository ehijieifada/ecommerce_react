import express from "express";
import { userSignup, userLogin, authMe, authLogout } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/me", authMe);
router.post("/logout", authLogout);

export default router;
