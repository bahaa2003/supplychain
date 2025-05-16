import speakeasy from 'speakeasy';
import User from '../../models/User.js';
import { AppError } from '../../utils/AppError.js';

export const verify2FA = async (req, res, next) => {
  const user = req.user;
  const { token } = req.body;

  if (!user.twoFactorSecret)
    return next(new AppError('2FA is not enabled for this user', 400));

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  });

  if (!verified) return next(new AppError('Invalid 2FA code', 401));

  user.twoFactorEnabled = true;
  await user.save();

  res.status(200).json({ message: '2FA activated successfully.' });
};
