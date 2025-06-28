import Company from "../../models/Company.js";
import User from "../../models/User.js";
import sendEmail from "../../services/email.service.js";
import Attachment from "../../models/Attachment.js";
import { AppError } from "../../utils/AppError.js";

export const approveCompany = async (req, res, next) => {
  const { id } = req.params;

  const company = await Company.findById(id).populate(
    "createdBy",
    "name email"
  );
  if (!company) return next(new AppError("Company not found", 404));

  company.isApproved = true;
  const admin = await User.findOne({ company: company._id, role: "admin" }); // تصحيح: استخدم findOne بدل findBy
  await company.save();

  // إرسال البريد الإلكتروني
  await sendEmail(
    "companyWelcome",
    { companyName: company.name, adminName: admin?.name },
    admin
  );

  // جلب مستندات الشركة
  const documents = await Attachment.find(
    {
      ownerCompany: company._id,
      type: "company_document",
    },
    {
      fileUrl: 1,
      fileId: 1,
      status: 1,
      createdAt: 1,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Company approved successfully.",
    company: {
      id: company._id,
      name: company.name,
      industry: company.industry,
      location: company.location,
      createdBy: company.createdBy,
      isApproved: company.isApproved,
    },
    documents,
  });
};
