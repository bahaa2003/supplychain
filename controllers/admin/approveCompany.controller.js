import Company from '../../models/Company.js';
import { AppError } from '../../utils/AppError.js';

export const approveCompany = async (req, res, next) => {
  const { id } = req.params;

  const company = await Company.findById(id);
  if (!company) return next(new AppError('Company not found', 404));

  company.isApproved = true;
  await company.save();

  res.status(200).json({
    status: 'success',
    message: 'Company approved successfully.'
  });
};
