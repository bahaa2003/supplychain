import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppError } from '../../utils/AppError.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, companyId: user.company },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate('company');
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  if (user.company && !user.company.isApproved)
    throw new AppError('Your company is awaiting approval.', 403);

  if (user.twoFactorEnabled) {
    return res.status(200).json({
      message: '2FA code required',
      twoFactor: true,
      userId: user._id,
    });
  }

  const token = generateToken(user);
  res.status(200).json({ status: 'success', token });
};
