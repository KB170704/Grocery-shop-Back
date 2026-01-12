require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dbConnection = require('./configs/db');

// Routers
const userRoutes = require("./Routes/user");
const menuRouter = require('./Routes/menu');
const contactRoutes = require('./Routes/contact');
const paymentRoutes = require('./Routes/payment');
const chargeRoutes = require("./Routes/chargeRoutes");

// Models
const Contact = require('./Models/contact');
const Menu = require('./Models/menu');
const User = require('./Models/user');
const Payment = require('./Models/order');

// Middleware
const { authenticateJWT, authorizeRoles } = require('./middleware/auth');

const app = express();

// Connect to MongoDB Atlas
dbConnection();

// View engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(cors({
    origin: ['https://kaushik-six.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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

// Admin pages
app.get("/home", authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    try {
        const contacts = await Contact.find();
        const menuItems = await Menu.find();
        const users = await User.find();
        const orders = await Payment.find();

        res.render("home", { contacts, menuItems, users, orders });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.get("/menu", authenticateJWT, authorizeRoles('admin'), async (req, res) => {
    try {
        const menuItems = await Menu.find();
        res.render('menu', { menuItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Default & login routes
app.get('/', (req, res) => res.render('login'));

app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid password');

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 1000
        }).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Test route
app.get("/Back-End-Says", (req, res) => res.send("Backend running"));

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));