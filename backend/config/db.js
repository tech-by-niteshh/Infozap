const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in the .env file.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }

  console.log("MongoDB connected successfully");
  return mongoose.connection;
};

module.exports = connectDB;
