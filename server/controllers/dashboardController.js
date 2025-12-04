import Transaction from "../models/Transaction.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // DAILY
    const dailyTotal = await Transaction.aggregate([
      { $match: { userId, date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // MONTHLY
    const monthlyTotal = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // YEARLY
    const yearlyTotal = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // CATEGORY SUMMARY
    const categoryTotals = await Transaction.aggregate([
      { $match: { userId } },
      { $group: {
          _id: "$category",
          total: { $sum: "$amount" }
      }},
      { $project: { category: "$_id", total: 1, _id: 0 } }
    ]);

    // LAST 5 transactions
    const lastFive = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const txCount = await Transaction.countDocuments({ userId });

    res.json({
      dailyTotal: dailyTotal[0]?.total || 0,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      yearlyTotal: yearlyTotal[0]?.total || 0,
      categoryTotals,
      txCount,
      lastFive
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Dashboard error" });
  }
};
