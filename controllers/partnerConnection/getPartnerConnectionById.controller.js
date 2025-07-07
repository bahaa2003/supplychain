import { AppError } from "../../utils/AppError.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";
export const getPartnerConnectionById = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = await PartnerConnection.findById(connectionId)
      .select({
        requester: 1,
        recipient: 1,
        partnershipType: 1,
        status: 1,
        notes: 1,
        createdAt: 1,
      })
      .populate([
        {
          path: "requester",
          select: "companyName industry size location logo",
          populate: {
            path: "location",
            select: "locationName country state city",
          },
        },
        {
          path: "recipient",
          select: "companyName industry size location logo",
          populate: {
            path: "location",
            select: "locationName country state city",
          },
        },
        {
          path: "invitedBy",
          select: "name email",
        },
      ]);
    if (!connection) {
      return next(new AppError("Partner connection not found", 404));
    }
    res.status(200).json({ status: "success", data: connection });
  } catch (err) {
    next(new AppError(err.message || "Failed to get partner connection", 500));
  }
};
