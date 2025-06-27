import { body, param } from "express-validator";
import mongoose from "mongoose";

const partnershipTypes = [
  "Supplier",
  "Manufacturer",
  "Logistics",
  "Warehouse",
  "Retailer",
  "Other",
];

export const createPartnerConnectionValidator = () => [
  param("recipientId")
    .notEmpty()
    .withMessage("Recipient company ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid recipient company ID");
      }
      return true;
    }),
  body("partnershipType")
    .optional()
    .notEmpty()
    .withMessage("Partnership type is required")
    .isIn(partnershipTypes)
    .withMessage(
      `Partnership type must be one of: ${partnershipTypes.join(", ")}`
    ),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

export const updatePartnerConnectionStatusValidator = () => [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "Pending",
      "Cancelled",
      "Active",
      "Rejected",
      "Inactive",
      "Completed",
      "Expired",
      "Terminated",
    ])
    .withMessage(
      "Status must be one of: Pending, Cancelled, Active, Rejected, Inactive, Completed, Expired, Terminated"
    ),
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Rejection reason cannot exceed 500 characters"),
];
