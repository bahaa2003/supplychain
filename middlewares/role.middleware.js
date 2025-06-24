import { AppError } from "../utils/AppError.js";

/**
 * Middleware to check if the authenticated user has a 'supplier' role.
 * This is a placeholder and assumes a role system is in place.
 */
export const isSupplier = async (req, _, next) => {
  // Assuming the user's role is attached to the req.user object
  // from the protectedRoute middleware.
  if (req.user && req.user.role === "supplier") {
    next();
  } else {
    return next(
      new AppError("Forbidden: This action is restricted to suppliers.", 403)
    );
  }
};

/**
 * Middleware to check if the authenticated user has a 'buyer' role.
 */
export const isBuyer = async (req, _, next) => {
  if (req.user && req.user.role === "buyer") {
    next();
  } else {
    return next(
      new AppError("Forbidden: This action is restricted to buyers.", 403)
    );
  }
};
