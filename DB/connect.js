import mongoose from "mongoose";
import dotenv from 'dotenv'
import path from "path";
dotenv.config({ path: path.resolve("./.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
  }
};

export default connectDB;
