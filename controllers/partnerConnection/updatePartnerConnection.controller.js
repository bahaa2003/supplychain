import Company from "../../models/Company.js";
import AppError from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";

export const updatePartnerConnection = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const updatedBy = req.user._id;
    const companyId = req.user.companyId;
    const connection = req.connection; // connection is fetched from middleware

    // Verify the company has permission to update this connection
    if (connection.recipient.toString() !== companyId.toString()) {
      throw new AppError(
        "You are not authorized to update this connection",
        403
      );
    }
    //verify permission to update status
    if (
      [
        connection.requester.toString(),
        connection.recipient.toString(),
      ].includes(updatedBy.toString()) === false
    ) {
      throw new AppError(
        "You are not authorized to update this connection status",
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
    } else if (status === "terminated") {
      connection.terminate(updatedBy, rejectionReason);
    }

    await connection.save();

    // Get company details for notification
    const recipientCompany = await Company.findById(connection.recipient);
    // Create notification for requester
    await createNotification({
      type: "partnerRequestUpdate",
      data: {
        recipientCompany: recipientCompany.name,
        status,
      },
      recipient: requster_user._id,
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
