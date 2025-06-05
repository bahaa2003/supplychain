import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const getPartnerConnectionById = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const connection = await PartnerConnection.findById(req.params.id).populate(
      "requester recipient invitedBy acceptedBy"
    );
    if (!connection) throw new AppError("Partner connection not found", 404);
    if (
      connection.requester.toString() !== companyId.toString() &&
      connection.recipient.toString() !== companyId.toString()
    ) {
      throw new AppError("Not authorized to view this partner connection", 403);
    }
    res.status(200).json({ status: "success", data: connection });
  } catch (err) {
    throw new AppError(err.message || "Failed to get partner connection", 500);
  }
};
