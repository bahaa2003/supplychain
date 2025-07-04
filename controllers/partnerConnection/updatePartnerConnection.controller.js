import PartnerConnection from "../../models/PartnerConnection.js";
import User from "../../models/User.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import {
  VALID_TRANSITIONS,
  ROLE_PERMISSIONS,
  partnerConnectionStatus,
} from "../../enums/partnerConnectionStatus.enum.js";
import { roles } from "../../enums/role.enum.js";

const getUserRole = (connection, companyId) => {
  if (connection.requester.toString() === companyId.toString())
    return "requester";
  if (connection.recipient.toString() === companyId.toString())
    return "recipient";
  return null;
};

const isValidTransition = (currentStatus, newStatus) =>
  VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;

const hasPermission = (userRole, currentStatus, newStatus) =>
  ROLE_PERMISSIONS[userRole]?.[currentStatus]?.includes(newStatus) || false;

export const updatePartnerConnection = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const { connectionId } = req.params;
    const updatedBy = req.user._id;
    const userCompanyId = req.user.company?._id || req.user.company;

    const connection = await PartnerConnection.findById(connectionId);

    // Validations
    if (!status) return next(new AppError("Status is required", 400));
    if (!connection) return next(new AppError("Connection not found", 404));

    const userRole = getUserRole(connection, userCompanyId);
    if (!userRole)
      return next(
        new AppError("You are not authorized to access this connection", 403)
      );
    if (!isValidTransition(connection.status, status)) {
      return next(
        new AppError(
          `Invalid status transition from ${connection.status} to ${status}`,
          400
        )
      );
    }
    if (!hasPermission(userRole, connection.status, status)) {
      return next(
        new AppError(
          `You don't have permission to change status from ${connection.status} to ${status}`,
          403
        )
      );
    }

    // Validate required reasons
    const reasonValidations = {
      [partnerConnectionStatus.REJECTED]: "Rejection reason is required",
      [partnerConnectionStatus.TERMINATED]: "Termination reason is required",
      [partnerConnectionStatus.INACTIVE]: "Suspension reason is required",
    };
    if (reasonValidations[status] && !reason) {
      return next(new AppError(reasonValidations[status], 400));
    }

    // Prepare update data
    const updateData = { status, lastInteractionAt: new Date() };

    // Clear all previous status fields
    const clearFields = {
      rejectionReason: undefined,
      rejectedBy: undefined,
      rejectedAt: undefined,
      inactiveReason: undefined,
      inactiveBy: undefined,
      inactiveAt: undefined,
      terminationReason: undefined,
      terminatedBy: undefined,
      terminatedAt: undefined,
      terminationType: undefined,
    };

    // Update specific fields based on status
    if (status === partnerConnectionStatus.ACTIVE) {
      const inactivecompany = await User.findById(connection.inactiveBy);
      if (
        inactivecompany &&
        inactivecompany.company.toString() !== userCompanyId.toString()
      ) {
        return next(
          new AppError(
            "You are not authorized to activate this connection",
            403
          )
        );
      }
      Object.assign(updateData, {
        acceptedBy: updatedBy,
        acceptedAt: new Date(),
      });
    } else if (status === partnerConnectionStatus.REJECTED) {
      Object.assign(updateData, clearFields, {
        rejectionReason: reason.trim(),
        rejectedBy: updatedBy,
        rejectedAt: new Date(),
        terminationType: partnerConnectionStatus.REJECTED,
      });
    } else if (status === partnerConnectionStatus.INACTIVE) {
      Object.assign(updateData, clearFields, {
        inactiveReason: reason.trim(),
        inactiveBy: updatedBy,
        inactiveAt: new Date(),
      });
    } else if (status === partnerConnectionStatus.TERMINATED) {
      Object.assign(updateData, clearFields, {
        terminationReason: reason.trim(),
        terminatedBy: updatedBy,
        terminatedAt: new Date(),
        terminationType: partnerConnectionStatus.TERMINATED,
      });
    } else if (
      [
        partnerConnectionStatus.COMPLETED,
        partnerConnectionStatus.EXPIRED,
        partnerConnectionStatus.CANCELLED,
      ].includes(status)
    ) {
      Object.assign(updateData, clearFields, {
        terminatedBy: updatedBy,
        terminatedAt: new Date(),
        terminationType: status,
      });
    }

    // Apply updates and save
    Object.assign(connection, updateData);
    await connection.save();

    // Populate for response
    await connection.populate([
      {
        path: "requester",
        select: "_id companyName logo industry",
        populate: {
          path: "location",
          select: "locationName country state city",
        },
      },
      {
        path: "recipient",
        select: "_id companyName logo industry",
        populate: {
          path: "location",
          select: "locationName country state city",
        },
      },
      { path: "invitedBy", select: "name email" },
      { path: "acceptedBy", select: "name email" },
      { path: "rejectedBy", select: "name email" },
      { path: "inactiveBy", select: "name email" },
      { path: "terminatedBy", select: "name email" },
    ]);

    // Send notification
    const receiveCompanyNotification =
      userCompanyId.toString() === connection.requester._id.toString()
        ? connection.recipient
        : connection.requester;

    const recipientsNotification = await User.find({
      company: receiveCompanyNotification._id,
      role: { $in: [roles.ADMIN, roles.MANAGER] },
    })
      .select("_id")
      .lean();

    await createNotification(
      notificationType.PARTNER_CONNECTION_UPDATE,
      {
        status,
        rejectionReason: connection.rejectionReason,
        terminationReason: connection.terminationReason,
        inactiveReason: connection.inactiveReason,
        recipientCompany: receiveCompanyNotification.companyName,
      },
      recipientsNotification
    );

    const statusMessages = {
      [partnerConnectionStatus.ACTIVE]: "Partnership activated successfully",
      [partnerConnectionStatus.REJECTED]: "Partnership request rejected",
      [partnerConnectionStatus.CANCELLED]: "Partnership request cancelled",
      [partnerConnectionStatus.INACTIVE]: "Partnership suspended",
      [partnerConnectionStatus.COMPLETED]: "Partnership completed successfully",
      [partnerConnectionStatus.TERMINATED]: "Partnership terminated",
      [partnerConnectionStatus.EXPIRED]: "Partnership marked as expired",
    };

    res.status(200).json({
      success: true,
      message:
        statusMessages[status] ||
        `Partnership ${status.toLowerCase()} successfully`,
      data: connection,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
