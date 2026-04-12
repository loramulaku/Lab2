const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

module.exports = { connectMongoDB };
