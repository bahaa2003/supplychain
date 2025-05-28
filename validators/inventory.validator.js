import { body } from "express-validator";
import mongoose from "mongoose";

export const inventoryValidator = () => [
  body("product")
    .notEmpty()
    .withMessage("Product is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Product must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("company")
    .notEmpty()
    .withMessage("Company is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Company must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("location")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Location must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("currentQuantity")
    .notEmpty()
    .withMessage("Current quantity is required")
    .isNumeric()
    .withMessage("Current quantity must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Current quantity must be between 0 and 1,000,000"),
  body("reservedQuantity")
    .optional()
    .isNumeric()
    .withMessage("Reserved quantity must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Reserved quantity must be between 0 and 1,000,000"),
  body("availableQuantity")
    .optional()
    .isNumeric()
    .withMessage("Available quantity must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Available quantity must be between 0 and 1,000,000"),
  body("minimumThreshold")
    .optional()
    .isNumeric()
    .withMessage("Minimum threshold must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Minimum threshold must be between 0 and 1,000,000"),
  body("maximumThreshold")
    .optional()
    .isNumeric()
    .withMessage("Maximum threshold must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Maximum threshold must be between 0 and 1,000,000"),
  body("reorderPoint")
    .optional()
    .isNumeric()
    .withMessage("Reorder point must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Reorder point must be between 0 and 1,000,000"),
  body("reorderQuantity")
    .optional()
    .isNumeric()
    .withMessage("Reorder quantity must be a number")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Reorder quantity must be between 0 and 1,000,000"),
  body("lastUpdated")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Last updated must be a valid date"),
  body("batchNumber")
    .optional()
    .isString()
    .withMessage("Batch number must be a string")
    .isLength({ min: 1, max: 40 })
    .withMessage("Batch number must be between 1 and 40 characters"),
  body("expiryDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Expiry date must be a valid date"),
  body("status")
    .optional()
    .isIn(["In Stock", "Low Stock", "Out of Stock", "Discontinued"])
    .withMessage("Invalid status value"),
];
