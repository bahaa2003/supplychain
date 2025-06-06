import { body } from "express-validator";
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
  body("recipient")
    .notEmpty()
    .withMessage("Recipient company ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid recipient company ID");
      }
      return true;
    }),
  body("partnershipType")
    .notEmpty()
    .withMessage("Partnership type is required")
    .isIn(partnershipTypes)
    .withMessage(
      `Partnership type must be one of: ${partnershipTypes.join(", ")}`
    ),
  body("visibilitySettings")
    .optional()
    .isObject()
    .withMessage("Visibility settings must be an object"),
  body("visibilitySettings.orders")
    .optional()
    .isBoolean()
    .withMessage("Orders visibility must be a boolean"),
  body("visibilitySettings.inventory")
    .optional()
    .isBoolean()
    .withMessage("Inventory visibility must be a boolean"),
  body("visibilitySettings.documents")
    .optional()
    .isBoolean()
    .withMessage("Documents visibility must be a boolean"),
  body("visibilitySettings.shipments")
    .optional()
    .isBoolean()
    .withMessage("Shipments visibility must be a boolean"),
  body("visibilitySettings.analytics")
    .optional()
    .isBoolean()
    .withMessage("Analytics visibility must be a boolean"),
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
    .isIn(["Accepted", "Rejected"])
    .withMessage("Status must be either 'Accepted' or 'Rejected'"),
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Rejection reason cannot exceed 500 characters"),
];
