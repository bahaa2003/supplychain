import PartnerConnection from "../../models/PartnerConnection.js";
import Company from "../../models/Company.js";
import User from "../../models/User.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";

/**
 * Create a new partner connection request
 */
export const createPartnerConnection = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const { partnershipType, notes, priority = "medium", tags = [] } = req.body;
    const requester = req.user.company?._id || req.user.company;
    const invitedBy = req.user._id;

    // Validate that requester is not trying to connect to themselves
    if (requester.toString() === recipientId.toString()) {
      throw new AppError(
        "Cannot create partnership with your own company",
        400
      );
    }

    // Check if recipient company exists and is active
    const recipientCompany = await Company.findById(recipientId);
    if (!recipientCompany) {
      throw new AppError("Recipient company not found", 404);
    }

    if (recipientCompany.status === "inactive") {
      throw new AppError("Cannot send request to inactive company", 400);
    }

    // Check if requester company exists and is active
    const requesterCompany = await Company.findById(requester);
    if (!requesterCompany) {
      throw new AppError("Your company profile not found", 404);
    }

    if (requesterCompany.status === "inactive") {
      throw new AppError(
        "Your company must be active to send partnership requests",
        400
      );
    }

    // Check for existing connections between these companies
    const existingConnection = await PartnerConnection.findOne({
      $or: [
        { requester: requester, recipient: recipientId },
        { requester: recipientId, recipient: requester },
      ],
    });

    if (existingConnection) {
      const statusMessages = {
        Pending:
          "A pending partnership request already exists between these companies",
        Active: "An active partnership already exists between these companies",
        Inactive:
          "A suspended partnership exists between these companies. Please contact support.",
        Terminated:
          "A terminated partnership exists between these companies. Previous issues may need resolution.",
        Rejected:
          "A partnership request was previously rejected. Please wait before sending another request.",
        Completed:
          "A completed partnership exists. You can create a new one if needed.",
        Expired: "An expired partnership exists. You can create a new one.",
        Cancelled: "A cancelled partnership exists. You can create a new one.",
      };

      // Allow new connections only for certain statuses
      const allowNewConnection = ["Completed", "Expired", "Cancelled"];

      if (!allowNewConnection.includes(existingConnection.status)) {
        throw new AppError(
          statusMessages[existingConnection.status] ||
            "A partnership connection already exists",
          400
        );
      }
    }

    // Create new connection
    const connectionData = {
      requester,
      recipient: recipientId,
      partnershipType,
      notes: notes?.trim(),
      invitedBy,
      status: "Pending",
    };

    const connection = await PartnerConnection.create(connectionData);

    // Get recipient company owner for notification
    const recipientOwner = await User.find(
      { company: recipientId, role: "admin" },
      { email: 1, name: 1 }
    );

    // Create notification for recipient
    if (recipientOwner?.owner) {
      await createNotification({
        type: "PartnerRequest",
        data: {
          requesterCompany:
            requesterCompany.name || requesterCompany.companyName,
          partnershipType,
          connectionId: connection._id,
          priority,
        },
        recipients: [recipientOwner.owner._id],
      });
    }

    // Populate connection for response
    await connection.populate([
      {
        path: "requester",
        select: "companyName name industry size location logo",
        populate: {
          path: "location",
          select: "locationName country state city",
        },
      },
      {
        path: "recipient",
        select: "companyName name industry size location logo",
        populate: {
          path: "location",
          select: "locationName country state city",
        },
      },
      { path: "invitedBy", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Partnership request sent successfully",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};
