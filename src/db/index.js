import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbName = process.env.DB_NAME; // Retrieve DB_NAME from environment variables
    if (!dbName) {
      throw new Error("DB_NAME environment variable is not defined.");
    }

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${dbName}`
    );
    console.log(
      `\n MongoDB connected DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
