import { populate } from "dotenv";
import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const getAllPartnerConnections = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    // params status
    const { status } = req.query;
    let filter = {
      $or: [
        // all connections except cancelled
        {
          $and: [
            {
              $or: [
                { requester: { $in: [companyId] } },
                { recipient: { $in: [companyId] } },
              ],
            },
            { status: { $ne: "Cancelled" } },
          ],
        },
        // cancelled connections only from your side
        {
          requester: { $in: [companyId] },
          status: "Cancelled",
        },
      ],
    };

    if (status) {
      filter.status = status;
    }
    const connections = await PartnerConnection.find(filter)
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
      ])
      .sort({ createdAt: -1 });

    console.log("Connections:", connections);
    if (connections && connections.length > 0) {
      return res.status(200).json({ status: "success", data: connections });
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "No partner connections found" });
    }
  } catch (err) {
    throw new AppError(err.message || "Failed to get partner connections", 500);
  }
};
