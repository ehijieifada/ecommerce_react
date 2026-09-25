import express from "express";
import { getBannerSettings, updateBannerSelection } from "../controllers/bannerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBannerSettings);
router.put("/:type", requireAuth, updateBannerSelection);

export default router;