import Company from '../../models/Company.js';

export const getPendingCompanies = async (req, res, next) => {
  const companies = await Company.find({ isApproved: false }).populate('createdBy', 'name email');
  res.status(200).json({
    status: 'success',
    results: companies.length,
    data: companies
  });
};
