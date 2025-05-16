import User from '../../models/User.js';
import crypto from 'crypto';
import { AppError } from '../../utils/AppError.js';

export const resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token) return next(new AppError('Token is required', 400));

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError('Token invalid or expired', 400));

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangeAt = Date.now();

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful. You can now login.'
  });
};
