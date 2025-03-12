const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "https://darulfalah.in", 
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(cors());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
