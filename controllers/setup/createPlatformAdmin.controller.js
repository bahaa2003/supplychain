import User from '../../models/User.js';
import bcrypt from 'bcrypt';

export const createPlatformAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ role: 'platform_admin' });
  if (exists) {
    return res.status(400).json({ message: 'Platform admin already exists' });
  }

  //const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password,
    role: 'platform_admin',
    isEmailVerified: true
  });

  res.status(201).json({ message: 'Platform admin created successfully' });
};
