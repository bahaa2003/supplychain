import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import { AppError } from "../../utils/AppError.js";
import { uploadToImageKit } from "../../middlewares/upload.middleware.js";

export const updateCompanyLogo = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) return next(new AppError("Company not found", 404));

    if (!req.file) return next(new AppError("Logo file is required", 400));

    const result = await uploadToImageKit(req.file, "company_logos", company.companyName);


    const logoAttachment = await Attachment.create({
      type: "company_logo",
      fileUrl: result.url,
      fileId: result.fileId,
      ownerCompany: company._id,
      uploadedBy: req.user._id,
      relatedTo: "Company",
      status: "approved",
      description: "Updated company logo",
    });

    company.logo = logoAttachment._id;
    await company.save();

    res.status(200).json({
      status: "success",
      message: "Company logo updated successfully",
      data: {
        companyId: company._id,
        logo: logoAttachment.fileUrl,
        attachmentId: logoAttachment._id,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
