import Transaction from "../models/Transaction.js";
import axios from "axios";

// ============================
// CREATE TRANSACTION
// ============================
export const createTransaction = async (req, res) => {
  const data = req.body;
  data.userId = req.user.id;

  // Convert incoming date string → Date object (IMPORTANT)
  data.date = new Date(data.date);

  // Infer payment method from title (basic UPI detection)
  if (!data.paymentMethod && data.title) {
    const t = data.title.toLowerCase();
    if (t.includes("phonepe")) data.paymentMethod = "PHONEPE";
    else if (t.includes("google pay") || t.includes("gpay")) data.paymentMethod = "GOOGLE_PAY";
    else if (t.includes("paytm")) data.paymentMethod = "PAYTM";
    else if (t.includes("upi")) data.paymentMethod = "UPI_OTHER";
    else data.paymentMethod = "OTHER";
  }

  try {
    // AI Auto Category (optional)
    try {
      const ai = await axios.post(`${process.env.AI_URL}/categorize`, {
        title: data.title,
        amount: data.amount,
      });

      if (ai.data?.category) {
        data.category = ai.data.category;
        data.aiGenerated = true;
      }
    } catch (err) {
      console.log("AI service unavailable");
    }

    const tx = await Transaction.create(data);
    res.json(tx);

  } catch (err) {
    console.error("Transaction Error:", err);
    res.status(500).json({ error: "Transaction failed" });
  }
};



// ============================
// GET ALL USER TRANSACTIONS
// ============================
export const getTransactions = async (req, res) => {
  const items = await Transaction.find({ userId: req.user.id })
    .sort({ date: -1 });

  res.json(items);
};

// ============================
// DASHBOARD STATISTICS API
// ============================
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    // Start of today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 1️⃣ DAILY EXPENSE
    const dailyAgg = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const dailyTotal = dailyAgg[0]?.total || 0;

    // 2️⃣ MONTHLY EXPENSE
    const monthlyAgg = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const monthlyTotal = monthlyAgg[0]?.total || 0;

    // 3️⃣ YEARLY EXPENSE
    const yearlyAgg = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const yearlyTotal = yearlyAgg[0]?.total || 0;

    // 4️⃣ TOTAL TRANSACTIONS
    const txCount = await Transaction.countDocuments({ userId });

    // 5️⃣ CATEGORY SUMMARY
    const categoryAgg = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const categoryTotals = categoryAgg.map((c) => ({
      category: c._id,
      total: c.total
    }));

    // 6️⃣ RECENT 5 TRANSACTIONS
    const lastFive = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    return res.json({
      dailyTotal,
      monthlyTotal,
      yearlyTotal,
      txCount,
      categoryTotals,
      lastFive
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Dashboard error" });
  }
};

