import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";

export const getAllCompanies = async (req, res, next) => {
  try {
    const { status } = req.query;
    const companyId = req.user.company?._id || req.user.company;
    let isApproved = true;
    if (status === "pending") {
      isApproved = false;
    }
    const Companies = await Company.find(
      { isApproved, _id: { $ne: companyId } },
      { __v: false }
    )
      // createdby and location
      .populate("createdBy", "name email")
      // .populate("location", "locationName city country")
      .lean();

    if (!Companies) {
      return res.status(404).json({
        status: "fail",
        message: "No pending companies found.",
      });
    }

    // ✅ هات المستندات المرتبطة بكل شركة
    for (const company of Companies) {
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
      data: Companies,
    });
  } catch (err) {
    console.error("❌ Error in get Companies:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Server error while fetching companies.",
    });
  }
};
