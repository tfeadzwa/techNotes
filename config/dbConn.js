const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (err) {
    console.log(`${err.name}: ${err.message}`);
  }
};

module.exports = { connectDB };
