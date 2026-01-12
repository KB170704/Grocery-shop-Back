// configs/db.js
const mongoose = require('mongoose');

const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${process.env.PORT}`);
  } catch (err) {
    console.error(`Error: ${err.message} ❌`);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = dbConnection;
