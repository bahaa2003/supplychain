import User from "../../models/User.schema.js";
import bcrypt from "bcrypt";

export const createPlatformAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ role: "platform_admin" });
  console.log("Checking for existing platform admin:", exists);
  if (exists) {
    return res.status(400).json({ message: "Platform admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "platform_admin",
    isEmailVerified: true,
  });

  res.status(201).json({ message: "Platform admin created successfully" });
};
