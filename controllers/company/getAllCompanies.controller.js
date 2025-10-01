import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";

export const getAllCompanies = async (req, res, next) => {
  try {
    const { status, search, size, indusrty } = req.query;
    const companyId = req.user.company?._id || req.user.company;

    const filter = {
      isApproved: status !== "pending",
      _id: { $ne: companyId },
      companyName: { $regex: search || "", $options: "i" },
      ...(size && { size }),
      ...(indusrty && { indusrty }),
    };

    const Companies = await Company.find(filter, { __v: false })
      .populate("createdBy", "name email")
      .lean();

    if (!Companies) {
      return res.status(404).json({
        status: "fail",
        message: "No companies found.",
      });
    }

    // add connection status to each company
    const connections = companyId
      ? await PartnerConnection.find({
          $or: [{ requester: companyId }, { recipient: companyId }],
        }).lean()
      : [];

    const connectionMap = new Map(
      connections.map((conn) => [
        conn.requester.toString() === companyId?.toString()
          ? conn.recipient.toString()
          : conn.requester.toString(),
        conn.status,
      ])
    );

    // ✅ add connection and documents to each company
    for (const company of Companies) {
      company.partnerStatus = connectionMap.get(company._id.toString()) || null;
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
    console.error("Error in get Companies:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Server error while fetching companies.",
    });
  }
};
