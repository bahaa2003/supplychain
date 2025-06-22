import PartnerConnection from "../../models/PartnerConnection.js";
import Company from "../../models/Company.js";
import AppError from "../../utils/AppError.js";
import { createNotification } from "../../utils/notification/createNotification.js";

export const createPartnerConnection = async (req, res, next) => {
  try {
    const { recipient, partnershipType, visibilitySettings, notes } = req.body;
    const requester = req.user.companyId;
    const invitedBy = req.user._id;

    // Check if recipient company exists
    const recipientCompany = await Company.findById(recipient);
    if (!recipientCompany) {
      throw new AppError("Recipient company not found", 404);
    }

    // Check if requester company exists
    const requesterCompany = await Company.findById(requester);
    if (!requesterCompany) {
      throw new AppError("Requester company not found", 404);
    }

    // Check if connection already exists
    const existingConnection = await PartnerConnection.findOne({
      $or: [
        { requester, recipient },
        { requester: recipient, recipient: requester },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === "Pending") {
        throw new AppError("A pending connection request already exists", 400);
      } else if (existingConnection.status === "Accepted") {
        throw new AppError("Connection already exists", 400);
      } else if (existingConnection.status === "Terminated") {
        throw new AppError("This connection was previously terminated", 400);
      }
    }

    // Create new connection
    const connection = await PartnerConnection.create({
      requester,
      recipient,
      partnershipType,
      visibilitySettings,
      notes,
      invitedBy,
    });

    // Create notification for recipient
    await createNotification({
      type: "PartnerRequest",
      data: {
        requesterCompany: requesterCompany.name,
        partnershipType,
        connectionId: connection._id,
      },
      recipient: recipient,
    });

    // Populate connection details
    await connection.populate([
      { path: "requester", select: "name logo" },
      { path: "recipient", select: "name logo" },
      { path: "invitedBy", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Partner connection request sent successfully",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};
