import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";

// Valid status transitions
const VALID_TRANSITIONS = {
  Pending: ["Active", "Rejected", "Cancelled"],
  Active: ["Inactive", "Completed", "Terminated", "Expired"],
  Inactive: ["Active", "Terminated", "Expired"],
  Rejected: [],
  Completed: [],
  Terminated: [],
  Expired: [],
  Cancelled: [],
};

// Role permissions
const ROLE_PERMISSIONS = {
  requester: {
    Pending: ["Cancelled"],
    Active: ["Inactive", "Completed", "Terminated"],
    Inactive: ["Active", "Terminated"],
  },
  recipient: {
    Pending: ["Active", "Rejected"],
    Active: ["Inactive", "Completed", "Terminated"],
    Inactive: ["Active", "Terminated"],
  },
};

/**
 * Get user role in the connection
 */
const getUserRole = (connection, companyId) => {
  if (connection.requester.toString() === companyId.toString()) {
    return "requester";
  }
  if (connection.recipient.toString() === companyId.toString()) {
    return "recipient";
  }
  return null;
};

/**
 * Check if status transition is valid
 */
const isValidTransition = (currentStatus, newStatus) => {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

/**
 * Check if user has permission to change status
 */
const hasPermission = (userRole, currentStatus, newStatus) => {
  return (
    ROLE_PERMISSIONS[userRole]?.[currentStatus]?.includes(newStatus) || false
  );
};

/**
 * Update partner connection status
 */
export const updatePartnerConnection = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const { connectionId } = req.params;
    const updatedBy = req.user._id;
    const companyId = req.user.company?._id || req.user.company;
    const connection = await PartnerConnection.findById(connectionId);

    // Validate required fields
    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    // Get user role
    const userRole = getUserRole(connection, companyId);
    if (!userRole) {
      return next(
        new AppError("You are not authorized to access this connection", 403)
      );
    }

    // Validate status transition
    if (!isValidTransition(connection.status, status)) {
      return next(
        new AppError(
          `Invalid status transition from ${connection.status} to ${status}`,
          400
        )
      );
    }

    // Check permissions
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
      Rejected: "Rejection reason is required",
      Terminated: "Termination reason is required",
      Inactive: "Suspension reason is required",
    };

    if (["Rejected", "Terminated", "Inactive"].includes(status) && !reason) {
      return next(new AppError(reasonValidations[status], 400));
    }

    // Prepare update data
    const updateData = {
      status,
      lastInteractionAt: new Date(),
    };

    // Update specific fields based on status
    switch (status) {
      case "Active":
        updateData.acceptedBy = updatedBy;
        updateData.acceptedAt = new Date();
        break;

      case "Rejected":
        updateData.rejectionReason = reason.trim();
        updateData.suspensionReason = "";
        updateData.terminationReason = "";
        updateData.rejectedBy = updatedBy;
        updateData.rejectedAt = new Date();
        break;

      case "Inactive":
        updateData.suspensionReason = reason.trim();
        updateData.terminationReason = "";
        updateData.rejectedBy = "";
        updateData.suspendedBy = updatedBy;
        updateData.suspendedAt = new Date();
        break;

      case "Terminated":
        updateData.terminationReason = reason.trim();
        updateData.rejectedBy = "";
        updateData.suspendedBy = "";
        updateData.terminatedBy = updatedBy;
        updateData.terminatedAt = new Date();
        updateData.terminationType = "Terminated";
        break;

      case "Completed":
        updateData.terminatedBy = updatedBy;
        updateData.terminatedAt = new Date();
        updateData.terminationType = "Completed";
        break;

      case "Expired":
        updateData.terminatedBy = updatedBy;
        updateData.terminatedAt = new Date();
        updateData.terminationType = "Expired";
        break;

      case "Cancelled":
        updateData.terminatedBy = updatedBy;
        updateData.terminatedAt = new Date();
        updateData.terminationType = "Cancelled";
        break;
    }

    // Apply updates
    Object.assign(connection, updateData);
    console.log("save connection", connection);
    await connection.save();
    // Populate for response
    await connection.populate([
      {
        path: "requester",
        select: "companyName logo industry",
        populate: {
          path: "location",
          select: "locationName country state city",
        },
      },
      {
        path: "recipient",
        select: "companyName logo industry",
        populate: {
          path: "location",
          select: "locationName country state city",
        },
      },
      { path: "invitedBy", select: "name email" },
      { path: "acceptedBy", select: "name email" },
      { path: "rejectedBy", select: "name email" },
      { path: "suspendedBy", select: "name email" },
      { path: "terminatedBy", select: "name email" },
    ]);
    // Send notification
    await createNotification({
      type: "partnerRequestUpdate",
      data: {
        recipientCompany: connection.recipient.companyName,
        status,
        reason,
      },
      recipients: connection.invitedBy,
    });

    const statusMessages = {
      Active: "Partnership activated successfully",
      Rejected: "Partnership request rejected",
      Cancelled: "Partnership request cancelled",
      Inactive: "Partnership suspended",
      Completed: "Partnership completed successfully",
      Terminated: "Partnership terminated",
      Expired: "Partnership marked as expired",
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
