require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const dbConnection = require('./configs/db');

// Routers
const userRoutes = require("./Routes/user");
const menuRouter = require('./Routes/menu');
const contactRoutes = require('./Routes/contact');
const paymentRoutes = require('./Routes/payment');
const chargeRoutes = require("./Routes/chargeRoutes");

// Models (ONLY used for admin dashboard)
const Contact = require('./Models/contact');
const Menu = require('./Models/menu');
const Payment = require('./Models/order');

// Middleware
const { authenticateJWT, authorizeRoles } = require('./middleware/auth');

const app = express();

// DB connection
dbConnection();

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// CORS (safe)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/menu", menuRouter);
app.use("/contact", contactRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/charges", chargeRoutes);

// Admin dashboard
app.get("/home", authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const contacts = await Contact.find();
  const menuItems = await Menu.find();
  const users = await require('./Models/User').find();
  const orders = await Payment.find();
  res.render("home", { contacts, menuItems, users, orders });
});

// Login page
app.get('/', (req, res) => res.render('login'));

// Login API
app.post('/user/login', async (req, res) => {
  const User = require('./Models/User');
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid password');

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,  // change to true if using HTTPS
    sameSite: 'Lax'
  }).json({ message: 'Login success' });
});

// Test
app.get("/Back-End-Says", (req, res) => res.send("Backend running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
