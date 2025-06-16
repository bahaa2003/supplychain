import Company from "../../models/Company.js";
import Attachment from "../../models/Attachment.js";

export const getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find(
      { isApproved: false },
      { __v: false }
    ).populate("createdBy", "name email isEmailVerified").lean();

    const activeCompanies = companies.filter(
      (company) => company.createdBy && company.createdBy.isEmailVerified
    );

    if (activeCompanies.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No pending companies found.",
      });
    }

    // ✅ هات المستندات المرتبطة بكل شركة
    for (const company of activeCompanies) {
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
          _id: 0,
        }
      ).lean();

      company.documents = documents;
    }

    res.status(200).json({
      status: "success",
      data: activeCompanies,
    });
  } catch (err) {
    console.error("❌ Error in getPendingCompanies:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Server error while fetching companies.",
    });
  }
};
