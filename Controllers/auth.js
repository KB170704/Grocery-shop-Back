const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register
exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ message: "Registered successfully", user });
  } catch (err) {
    res.status(400).json({ message: "Registration failed", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  res
    .cookie("token", token, { httpOnly: true })
    .json({ message: "Login successful", token, role: user.role });
};
