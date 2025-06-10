import Invoice from '../../models/Invoice.js';

export const getCompanyInvoices = async (req, res, next) => {
  const companyId = req.user.company;

  const invoices = await Invoice.find({
    $or: [{ issuer: companyId }, { receiver: companyId }]
  })
    .populate('issuer receiver createdBy relatedOrder')
    .sort({ issueDate: -1 });

  res.status(200).json({
    message: 'Company invoices retrieved successfully',
    count: invoices.length,
    invoices
  });
};
