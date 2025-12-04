import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// Helper to build an optional paymentMethod filter
const buildMatch = (userId, method) => {
  const match = { userId };
  if (method && method !== "ALL") {
    match.paymentMethod = method;
  }
  return match;
};

// ---------- DAILY INSIGHTS ----------
export const getDailyInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method } = req.query; // optional payment method filter

    const daily = await Transaction.aggregate([
      { $match: buildMatch(userId, method) },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const series = daily.map((d) => ({
      label: `${String(d._id.day).padStart(2, "0")}/${String(d._id.month).padStart(2, "0")}/${d._id.year}`,
      value: d.total,
    }));

    res.json({ series });
  } catch (err) {
    res.status(500).json({ error: "Daily Insights Error" });
  }
};


// ---------- MONTHLY INSIGHTS ----------
export const getMonthlyInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method } = req.query;

    const monthly = await Transaction.aggregate([
      { $match: buildMatch(userId, method) },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const series = monthly.map((m) => ({
      label: `${String(m._id.month).padStart(2, "0")}/${m._id.year}`,
      value: m.total,
    }));

    res.json({ series });
  } catch (err) {
    res.status(500).json({ error: "Monthly Insights Error" });
  }
};


// ---------- YEARLY INSIGHTS ----------
export const getYearlyInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method } = req.query;

    const yearly = await Transaction.aggregate([
      { $match: buildMatch(userId, method) },
      {
        $group: {
          _id: { year: { $year: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1 } }
    ]);

    const series = yearly.map((y) => ({
      label: `${y._id.year}`,
      value: y.total,
    }));

    res.json({ series });
  } catch (err) {
    res.status(500).json({ error: "Yearly Insights Error" });
  }
};


// ---------- CATEGORY INSIGHTS ----------
export const getCategoryInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method } = req.query;

    const categories = await Transaction.aggregate([
      { $match: buildMatch(userId, method) },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const series = categories.map((c) => ({
      category: c._id,
      total: c.total,
    }));

    res.json({ series });
  } catch (err) {
    res.status(500).json({ error: "Category Insights Error" });
  }
};


// ---------- SUMMARY / AI INSIGHTS ----------
export const getInsightsSummary = async (req, res) => {
	try {
		const userId = req.user.id;

		const now = new Date();
		const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

		// current month total
		const thisMonthAgg = await Transaction.aggregate([
			{ $match: { userId, date: { $gte: startOfThisMonth } } },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]);
		const thisMonthTotal = thisMonthAgg[0]?.total || 0;

		// previous month total
		const prevMonthAgg = await Transaction.aggregate([
			{ $match: { userId, date: { $gte: startOfPrevMonth, $lt: startOfThisMonth } } },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]);
		const prevMonthTotal = prevMonthAgg[0]?.total || 0;

		let changePercent = null;
		if (prevMonthTotal > 0) {
			changePercent = ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
		}

		// top category (all time)
		const topCategoryAgg = await Transaction.aggregate([
			{ $match: { userId } },
			{ $group: { _id: "$category", total: { $sum: "$amount" } } },
			{ $sort: { total: -1 } },
			{ $limit: 1 },
		]);
		const topCategory = topCategoryAgg[0]
			? { category: topCategoryAgg[0]._id, total: topCategoryAgg[0].total }
			: null;

		// biggest spending day in last 60 days
		const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
		const biggestDayAgg = await Transaction.aggregate([
			{ $match: { userId, date: { $gte: sixtyDaysAgo } } },
			{
				$group: {
					_id: {
						day: { $dayOfMonth: "$date" },
						month: { $month: "$date" },
						year: { $year: "$date" },
					},
					total: { $sum: "$amount" },
				},
			},
			{ $sort: { total: -1 } },
			{ $limit: 1 },
		]);

		let biggestDay = null;
		if (biggestDayAgg[0]) {
			const d = biggestDayAgg[0]._id;
			const label = `${String(d.day).padStart(2, "0")}/${String(d.month).padStart(2, "0")}/${d.year}`;
			biggestDay = { date: label, total: biggestDayAgg[0].total };
		}

		// Build a friendly summary string
		let summary = "";
		if (!thisMonthTotal && !prevMonthTotal) {
			summary = "No spending data yet. Start adding transactions to see insights.";
		} else {
			summary += `You have spent approximately ${thisMonthTotal.toFixed(0)} this month.`;
			if (changePercent !== null) {
				const dir = changePercent >= 0 ? "more" : "less";
				summary += ` That is ${Math.abs(changePercent).toFixed(1)}% ${dir} than last month.`;
			}
			if (topCategory) {
				summary += ` Your top category overall is ${topCategory.category} (${topCategory.total.toFixed(0)}).`;
			}
			if (biggestDay) {
				summary += ` Your biggest single day in the last 60 days was ${biggestDay.date} (${biggestDay.total.toFixed(0)}).`;
			}
		}

		return res.json({
			thisMonthTotal,
			prevMonthTotal,
			changePercent,
			topCategory,
			biggestDay,
			summary,
		});
	} catch (err) {
		console.error("Insights summary error", err);
		res.status(500).json({ error: "Insights summary error" });
	}
};
