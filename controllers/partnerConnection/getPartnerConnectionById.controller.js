import { AppError } from "../../utils/AppError.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";
export const getPartnerConnectionById = async (req, res) => {
  try {
    const companyUserId = req.user.company?._id || req.user.company;
    const { connectionId } = req.params;
    const connectionDoc = await PartnerConnection.findById(connectionId)
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
    if (!connectionDoc) {
      return next(new AppError("Partner connection not found", 404));
    }
    if (
      connectionDoc.requester._id.toString() !== companyUserId.toString() &&
      connectionDoc.recipient._id.toString() !== companyUserId.toString()
    ) {
      return next(
        new AppError("You are not authorized to view this connection", 403)
      );
    }
    const { requester, recipient, ...restOfConnection } =
      connectionDoc.toObject();
    let connection = {};
    if (requester._id.toString() === companyUserId.toString()) {
      connection = {
        ...restOfConnection,
        requesterRole: "requester",
        partner: recipient,
      };
    } else {
      connection = {
        ...restOfConnection,
        requesterRole: "recipient",
        partner: requester,
      };
    }
    res.status(200).json({ status: "success", data: connection });
  } catch (err) {
    next(new AppError(err.message || "Failed to get partner connection", 500));
  }
};
