import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/AppError.js';
import { sendTeamInviteEmail } from '../../utils/email.js';

export const inviteUser = async (req, res, next) => {
  const { email, role } = req.body;
  const admin = req.user;

  if (admin.role !== 'admin')
    return next(new AppError('Only admins can invite team members.', 403));

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('User already exists', 400));

  const token = jwt.sign(
    { email, companyId: admin.company._id, role },
    process.env.JWT_SECRET,
    { expiresIn: '2d' }
  );

  await User.create({
    email,
    role,
    company: admin.company._id,
    status: 'invited',
    inviteToken: token,
  });

const inviteLink = `${process.env.FRONTEND_URL}/complete-registration?token=${token}`;

  await sendTeamInviteEmail(email, inviteLink, admin.name);

  res.status(201).json({
    message: 'User invited successfully.',
    inviteLink,
  });
};
