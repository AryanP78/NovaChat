import mongoose from "mongoose";

export async function connectDb() {
  try {
    const mongouri = process.env.MONGO_URI;

    if (!mongouri) {
      throw new Error("MONGO URI is required");
    }
    await mongoose.connect(mongouri);
    console.log("Mongo DB connected");
  } catch (error) {
    console.error("MongoDB connection error", error.message);
    process.exit(1);
  }
}
