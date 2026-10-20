const mongoose = require('mongoose');

const connectDB = async () => {
  // Accept either name: .env.example documents MONGO_URI, older deployments use MONGODB_URI.
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('MongoDB Error: neither MONGO_URI nor MONGODB_URI is set');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
