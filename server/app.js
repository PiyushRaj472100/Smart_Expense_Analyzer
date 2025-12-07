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

//app.use(cors());
// CORS Configuration - Allow requests from frontend (Vercel) and localhost
// This fixes CORS issues when deploying frontend on Vercel and backend on Render
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',      // Local Vite dev server
      'http://localhost:3000',       // Alternative local port
      'https://smart-expense-analyzer.vercel.app', // Production Vercel URL
      /^https:\/\/.*\.vercel\.app$/, // Any Vercel preview deployments
    ];
    
    // Check if origin matches allowed origins
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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
