import PartnerConnection from "../../models/PartnerConnection.js";
import Company from "../../models/Company.js";
import AppError from "../../utils/AppError.js";
import { createNotification } from "../../utils/notification/createNotification.js";

export const updatePartnerConnectionVisibilityController = async (
  req,
  res,
  next
) => {
  try {
    const { connectionId } = req.params;
    const { visibilitySettings } = req.body;
    const companyId = req.user.companyId;

    // Find the connection
    const connection = await PartnerConnection.findById(connectionId);
    if (!connection) {
      throw new AppError("Partner connection not found", 404);
    }

    // Verify the company has permission to update this connection
    if (
      ![
        connection.requester.toString(),
        connection.recipient.toString(),
      ].includes(companyId.toString())
    ) {
      throw new AppError(
        "You are not authorized to update this connection",
        403
      );
    }

    // Verify connection is active
    if (connection.status !== "Accepted") {
      throw new AppError(
        "Can only update visibility settings for active connections",
        400
      );
    }

    // Update visibility settings
    connection.visibilitySettings = {
      ...connection.visibilitySettings,
      ...visibilitySettings,
    };

    await connection.save();

    // Get company details for notification
    const otherCompanyId =
      connection.requester.toString() === companyId.toString()
        ? connection.recipient
        : connection.requester;

    const otherCompany = await Company.findById(otherCompanyId);

    // Create notification for the other company
    await createNotification({
      type: "Partner Visibility Updated",
      data: {
        partnerCompany: req.user.company.name,
        connectionId: connection._id,
      },
      recipient: otherCompanyId,
    });

    // Populate connection details
    await connection.populate([
      { path: "requester", select: "name logo" },
      { path: "recipient", select: "name logo" },
    ]);

    res.status(200).json({
      success: true,
      message: "Partner connection visibility settings updated successfully",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};
