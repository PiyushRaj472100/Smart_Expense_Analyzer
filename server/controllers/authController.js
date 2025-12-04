import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);

  const user = new User({ name, email, passwordHash: hash });
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, user });
};
