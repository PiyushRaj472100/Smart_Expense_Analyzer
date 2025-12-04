import express from "express";
import auth from "../middleware/auth.js"; // ✔

import {
  createTransaction,
  getTransactions
} from "../controllers/txController.js";

const router = express.Router();

router.post("/", auth, createTransaction);
router.get("/", auth, getTransactions);

export default router;
