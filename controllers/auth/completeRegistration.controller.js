import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { AppError } from '../../utils/AppError.js';
import bcrypt from 'bcrypt';

export const completeRegistration = async (req, res, next) => {
  const { token } = req.query;
  const { name, password } = req.body;

  if (!token) return next(new AppError('Token is required', 400));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email, status: 'invited' });

  if (!user) return next(new AppError('Invalid or expired invitation token', 400));

  user.name = name;
  user.password = password;
  user.status = 'active';
  user.inviteToken = undefined;

  await user.save();

  res.status(200).json({ message: 'Registration completed successfully. You can now login.' });
};
