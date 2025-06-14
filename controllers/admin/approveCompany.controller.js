import Company from "../../models/Company.js";
import User from "../../models/User.js";
import sendEmail from "../../services/email.service.js";
import { AppError } from "../../utils/AppError.js";

export const approveCompany = async (req, res, next) => {
  const { id } = req.params;

  const company = await Company.findById(id);
  if (!company) return next(new AppError("Company not found", 404));

  company.isApproved = true;
  const admin = User.findBy({ company: company._id, role: "admin" });
  await company.save();
  await sendEmail(
    "companyApproved",
    { companyName: company.name, adminName: admin.name },
    company.admins
  );
  res.status(200).json({
    status: "success",
    message: "Company approved successfully.",
  });
};
