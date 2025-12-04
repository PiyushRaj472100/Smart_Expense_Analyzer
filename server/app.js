import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import insightRoutes from "./routes/insights.js";
import dashboardRoutes from "./routes/dashboard.js";
import auth from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const app = express();

app.use(cors());
app.use(express.json());

// PUBLIC ROUTE
app.use("/auth", authRoutes);

// PROTECTED ROUTES
app.use("/transactions", auth, transactionRoutes);
app.use("/insights", auth, insightRoutes);
app.use("/dashboard", auth, dashboardRoutes);

const PORT = process.env.PORT || 4000;

console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
