import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const getAllPartnerConnections = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    // params status
    const { status } = req.query;
    const connections = await PartnerConnection.find({
      $or: [{ requester: companyId }, { recipient: companyId }],
      status,
    })
      .populate("requester recipient invitedBy acceptedBy")
      .sort({ createdAt: -1 });
    res.status(200).json({ status: "success", data: connections });
  } catch (err) {
    throw new AppError(err.message || "Failed to get partner connections", 500);
  }
};
