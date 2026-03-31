import express from "express";
import { generateResponse } from "../controllers/genaiController.js";

const router = express.Router();

// POST /api/genai
router.post("/", generateResponse);

export default router;
