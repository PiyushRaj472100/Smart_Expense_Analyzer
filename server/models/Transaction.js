import mongoose from "mongoose";

const TxSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "Other" },
  date: { type: Date, required: true },   // <--- THIS IS IMPORTANT
  paymentMethod: { type: String, default: "OTHER" },
  aiGenerated: { type: Boolean, default: false }
});

export default mongoose.model("Transaction", TxSchema);
