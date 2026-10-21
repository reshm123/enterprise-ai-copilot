
import mongoose from "mongoose";

async function connectionDb() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(uri);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
}

export default connectionDb;
export { connectionDb as connectDatabase };
