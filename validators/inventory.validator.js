import { body } from "express-validator";
import mongoose from "mongoose";

export const updateInventoryValidator = () => [
  body(["currentQuantity", "reservedQuantity", "availableQuantity"])
    .not()
    .exists()
    .withMessage(
      "You cannot update quantity fields directly. Use stock adjustment endpoints."
    ),
  body("location")
    .optional()
    .isMongoId()
    .withMessage("Location must be a valid ObjectId"),
  body("minimumThreshold")
    .optional()
    .isNumeric()
    .withMessage("Minimum threshold must be a number"),
  body("maximumThreshold")
    .optional()
    .isNumeric()
    .withMessage("Maximum threshold must be a number"),
  body("reorderPoint")
    .optional()
    .isNumeric()
    .withMessage("Reorder point must be a number"),
  body("reorderQuantity")
    .optional()
    .isNumeric()
    .withMessage("Reorder quantity must be a number"),
  body("batchNumber")
    .optional()
    .isString()
    .withMessage("Batch number must be a string"),
  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),
  body("status").optional().isString().withMessage("Status must be a string"),
];
