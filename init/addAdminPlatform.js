import User from "../models/User.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
dotenv.config();
connectDB();

const createPlatformAdminIfNotExists = async () => {
  const existingAdmin = await User.findOne({ role: "platform_admin" });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("12345678", 12);

    await User.create({
      name: "Platform Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "platform_admin",
      isEmailVerified: true,
    });

    console.log(" Default Platform Admin created: admin@gmail.com / 12345678");
  } else {
    console.log(" Platform Admin already exists");
  }
};

createPlatformAdminIfNotExists()
  .then(() => {
    console.log("Platform admin check completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error creating platform admin:", error);
    process.exit(1);
  });
