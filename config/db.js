import mongoose from "mongoose";

const connectDB = async (retries = 3, delay = 10000) => {
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected...");
      return; // success
    } catch (err) {
      console.error(`MongoDB connection failed: ${err.message}`);
      retries--;

      if (retries === 0) {
        console.error("All retries failed. Exiting...");
        process.exit(1);
      }

      console.log(
        `Retrying in ${delay / 1000} seconds... (${retries} attempts left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
