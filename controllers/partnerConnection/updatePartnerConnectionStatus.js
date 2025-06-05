import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const updatePartnerConnectionStatus = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { status, rejectionReason } = req.body;
    const connection = await PartnerConnection.findById(req.params.id);
    if (!connection) throw new AppError("Partner connection not found", 404);
    // Only recipient can accept/reject
    if (connection.recipient.toString() !== companyId.toString()) {
      throw new AppError(
        "Not authorized to update this partner connection",
        403
      );
    }
    if (!["Accepted", "Rejected"].includes(status)) {
      throw new AppError(
        "Invalid status. Only 'Accepted' or 'Rejected' allowed.",
        400
      );
    }
    connection.status = status;
    if (status === "Accepted") {
      connection.acceptedBy = req.user._id;
      connection.acceptedAt = new Date();
      connection.rejectionReason = undefined;
    } else if (status === "Rejected") {
      connection.rejectionReason = rejectionReason;
      connection.acceptedBy = undefined;
      connection.acceptedAt = undefined;
    }
    await connection.save();
    res.status(200).json({ status: "success", data: connection });
  } catch (err) {
    throw new AppError(
      err.message || "Failed to update partner connection status",
      500
    );
  }
};
