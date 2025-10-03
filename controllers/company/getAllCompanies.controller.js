import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";

export const getAllCompanies = async (req, res, next) => {
  try {
    const { search, isApproved, size, indusrty, partnerStatus } = req.query;
    const companyId = req.user.company?._id || req.user.company;

    // get all partner connections for the current company
    const connections = companyId
      ? await PartnerConnection.find({
          $or: [{ requester: companyId }, { recipient: companyId }],
          ...(partnerStatus &&
            (partnerStatus !== "All" || partnerStatus === "None") && {
              status: partnerStatus,
            }),
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

    // company filter
    const filter = {
      _id: { $ne: companyId },
      companyName: { $regex: search || "", $options: "i" },
      ...((isApproved || companyId) && { isApproved: isApproved === "true" }),
      ...(size && { size }),
      ...(indusrty && { indusrty }),
    };

    if (companyId) filter.isApproved = true;

    if (partnerStatus && partnerStatus === "None") {
      filter._id = { $nin: Array.from(connectionMap.keys()), $ne: companyId };
    } else if (partnerStatus) {
      filter._id = { $in: Array.from(connectionMap.keys()), $ne: companyId };
    }

    const Companies = await Company.find(filter, { __v: false })
      .populate("createdBy", "name email")
      .lean();

    if (!Companies.length) {
      return res.status(404).json({
        status: "fail",
        message: "No companies found.",
      });
    }

    // add partnerStatus and documents to each company
    for (const company of Companies) {
      company.partnerStatus =
        connectionMap.get(company._id.toString()) || "None";
      if (req.user.role === "PLATFORM_ADMIN")
        company.documents = await Attachment.find(
          { ownerCompany: company._id, type: "company_document" },
          { fileUrl: 1, fileId: 1, status: 1, createdAt: 1, _id: 0 }
        ).lean();
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
