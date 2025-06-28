import PartnerConnection from "../models/PartnerConnection.js";
import { AppError } from "../utils/AppError.js";

// Middleware to check if there's an active partner connection
export const checkPartnerConnection = async (req, res, next) => {
  try {
    const { user } = req;
    const { supplier } = req.body;

    if (!supplier) {
      return next(new AppError("Supplier is required", 400));
    }

    // Check if there's an active connection between the companies
    const connection = await PartnerConnection.findOne({
      $or: [
        { requester: user.company, recipient: supplier },
        { requester: supplier, recipient: user.company },
      ],
      status: "Active",
    });

    if (!connection) {
      return next(
        new AppError(
          "No active partnership exists with this supplier. Please establish a partnership first.",
          400
        )
      );
    }

    // Add connection info to request for potential future use
    req.partnerConnection = connection;

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can access order based on company relationships
export const checkOrderAccess = async (req, res, next) => {
  try {
    const { user } = req;
    const { order } = req; // Assuming order is already loaded in previous middleware

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check if user's company is either buyer or supplier
    const isBuyer = order.buyer.toString() === user.company.toString();
    const isSupplier = order.supplier.toString() === user.company.toString();

    if (!isBuyer && !isSupplier) {
      return next(new AppError("You don't have access to this order", 403));
    }

    // Add role information to request
    req.orderRole = isBuyer ? "buyer" : "supplier";

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to verify partnership is still active for existing orders
export const verifyActivePartnership = async (req, res, next) => {
  try {
    const { order } = req; // Assuming order is already loaded

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check if partnership is still active
    const connection = await PartnerConnection.findOne({
      $or: [
        { requester: order.buyer, recipient: order.supplier },
        { requester: order.supplier, recipient: order.buyer },
      ],
      status: "Active",
    });

    if (!connection) {
      return next(
        new AppError(
          "Partnership is no longer active. Contact your partner to resolve this issue.",
          400
        )
      );
    }

    req.partnerConnection = connection;
    next();
  } catch (error) {
    next(error);
  }
};
