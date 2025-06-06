import PartnerConnection from "../../models/PartnerConnection.js";
import Company from "../../models/Company.js";
import AppError from "../../utils/AppError.js";
import { createNotification } from "../../utils/notification/createNotification.js";

export const updatePartnerConnectionStatusController = async (
  req,
  res,
  next
) => {
  try {
    const { connectionId } = req.params;
    const { status, rejectionReason } = req.body;
    const updatedBy = req.user._id;
    const companyId = req.user.companyId;

    // Find the connection
    const connection = await PartnerConnection.findById(connectionId);
    if (!connection) {
      throw new AppError("Partner connection not found", 404);
    }

    // Verify the company has permission to update this connection
    if (connection.recipient.toString() !== companyId.toString()) {
      throw new AppError(
        "You are not authorized to update this connection",
        403
      );
    }

    // Validate status transition
    if (connection.status === "Accepted" && status === "Pending") {
      throw new AppError("Cannot change status from Accepted to Pending", 400);
    }

    if (connection.status === "Terminated") {
      throw new AppError("Cannot update a terminated connection", 400);
    }

    // Update connection status
    connection.status = status;
    if (status === "Accepted") {
      connection.acceptedBy = updatedBy;
      connection.acceptedAt = new Date();
    } else if (status === "Rejected") {
      connection.rejectionReason = rejectionReason;
    }

    await connection.save();

    // Get company details for notification
    const requesterCompany = await Company.findById(connection.requester);
    const recipientCompany = await Company.findById(connection.recipient);

    // Create notification for requester
    await createNotification({
      type: "Partner Request Update",
      data: {
        recipientCompany: recipientCompany.name,
        status,
        rejectionReason,
        connectionId: connection._id,
      },
      recipient: connection.requester,
    });

    // Populate connection details
    await connection.populate([
      { path: "requester", select: "name logo" },
      { path: "recipient", select: "name logo" },
      { path: "invitedBy", select: "name email" },
      { path: "acceptedBy", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: `Partner connection ${status.toLowerCase()} successfully`,
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};
