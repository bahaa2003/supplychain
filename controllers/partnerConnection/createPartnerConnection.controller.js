import PartnerConnection from "../../models/PartnerConnection.schema.js";
import Company from "../../models/Company.schema.js";
import User from "../../models/User.schema.js";
import { AppError } from "../../utils/AppError.js";
import { notificationType } from "../../enums/notificationType.enum.js";
import createNotification from "../../services/notification.service.js";
import { roles } from "../../enums/role.enum.js";
import { partnerConnectionStatus } from "../../enums/partnerConnectionStatus.enum.js";

/**
 * Create a new partner connection request
 */
export const createPartnerConnection = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const { partnershipType, notes } = req.body;
    const requester = req.user.company?._id || req.user.company;
    const invitedBy = req.user._id;

    // Validate that requester is not trying to connect to themselves
    if (requester.toString() === recipientId.toString()) {
      return next(
        new AppError("Cannot create partnership with your own company", 400)
      );
    }

    // Check if recipient company exists and is active
    const recipientCompany = await Company.findById(recipientId);
    if (!recipientCompany) {
      return next(new AppError("Recipient company not found", 404));
    }

    if (recipientCompany.status === partnerConnectionStatus.INACTIVE) {
      return next(new AppError("Recipient company is inactive", 400));
    }

    // Check if requester company exists and is active
    const requesterCompany = await Company.findById(requester);
    if (!requesterCompany) {
      return next(new AppError("Your company profile not found", 404));
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
      const allowNewConnection = [
        partnerConnectionStatus.CANCELLED,
        partnerConnectionStatus.EXPIRED,
        partnerConnectionStatus.COMPLETED,
      ];

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
      status: partnerConnectionStatus.PENDING, // Default status for new requests
    };

    const connection = await PartnerConnection.create(connectionData);

    // Get recipient company owner for notification
    const recipientOwner = await User.findOne(
      { company: recipientId, role: roles.ADMIN },
      { _id: 1, email: 1, name: 1 }
    );

    // Create notification for recipient
    if (recipientOwner) {
      await createNotification(
        notificationType.PARTNER_REQUEST,
        {
          requesterCompany: requesterCompany.companyName,
          partnershipType,
        },
        [recipientOwner._id]
      );
    }

    // Populate connection for response
    await connection.populate([
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
