import PartnerConnection from "../../models/PartnerConnection.js";
import Company from "../../models/Company.js";
import AppError from "../../utils/AppError.js";
import { createNotification } from "../../utils/notification/createNotification.js";

export const terminatePartnerConnectionController = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    const { terminationReason } = req.body;
    const companyId = req.user.companyId;
    const terminatedBy = req.user._id;

    // Find the connection
    const connection = await PartnerConnection.findById(connectionId);
    if (!connection) {
      throw new AppError("Partner connection not found", 404);
    }

    // Verify the company has permission to terminate this connection
    if (
      ![
        connection.requester.toString(),
        connection.recipient.toString(),
      ].includes(companyId.toString())
    ) {
      throw new AppError(
        "You are not authorized to terminate this connection",
        403
      );
    }

    // Verify connection is not already terminated
    if (connection.status === "Terminated") {
      throw new AppError("This connection is already terminated", 400);
    }

    // Terminate the connection
    await connection.terminate(terminatedBy, terminationReason);

    // Get company details for notification
    const otherCompanyId =
      connection.requester.toString() === companyId.toString()
        ? connection.recipient
        : connection.requester;

    const otherCompany = await Company.findById(otherCompanyId);
    const terminatingCompany = await Company.findById(companyId);

    // Create notification for the other company
    await createNotification({
      type: "Partner Connection Terminated",
      data: {
        partnerCompany: terminatingCompany.name,
        terminationReason,
        connectionId: connection._id,
      },
      recipient: otherCompanyId,
    });

    // Populate connection details
    await connection.populate([
      { path: "requester", select: "name logo" },
      { path: "recipient", select: "name logo" },
      { path: "terminatedBy", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Partner connection terminated successfully",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};
