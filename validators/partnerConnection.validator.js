import { body, param } from "express-validator";
import { isValidObjectId } from "../utils/mongoose.js";
import { partnerConnectionStatusEnum } from "../enums/partnerConnectionStatus.enum.js";

export const createPartnerConnectionValidator = () => [
  param("recipientId")
    .notEmpty()
    .withMessage("Recipient company ID is required")
    .custom(isValidObjectId)
    .withMessage("Invalid recipient company ID"),
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
    .isIn(partnerConnectionStatusEnum)
    .withMessage(
      `Status must be one of: ${partnerConnectionStatusEnum.join(", ")}`
    ),
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Rejection reason cannot exceed 500 characters"),
];
