import Company from '../../models/Company.js';
import User from '../../models/User.js';

export const getPendingCompanies = async (req, res, next) => {
  // Get all pending companies
  const companies = await Company.find({ isApproved: false }).lean();
  // Filter companies by checking for an admin user with verified email
  const filteredCompanies = [];
  for (const company of companies) {
    const hasVerifiedAdmin = await User.exists({ company: company._id, role: 'admin', isEmailVerified: true });
    if (hasVerifiedAdmin) {
      filteredCompanies.push(company);
    }
  }
  res.status(200).json({
    status: 'success',
    results: filteredCompanies.length,
    data: filteredCompanies
  });
};
