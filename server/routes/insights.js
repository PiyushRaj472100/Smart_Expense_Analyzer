import express from "express";
import auth from "../middleware/auth.js";  // ✔ default import


import {
  getDailyInsights,
  getMonthlyInsights,
  getYearlyInsights,
  getCategoryInsights,
  getInsightsSummary,
} from "../controllers/insightsController.js";

const router = express.Router();

router.get("/daily", auth, getDailyInsights);
router.get("/monthly", auth, getMonthlyInsights);
router.get("/yearly", auth, getYearlyInsights);
router.get("/category", auth, getCategoryInsights);
router.get("/summary", auth, getInsightsSummary);

export default router;
