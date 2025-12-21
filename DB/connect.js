import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
  }
};

export default connectDB;
