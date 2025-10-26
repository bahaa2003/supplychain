import { body } from "express-validator";
import {
  companyIndustriesEnum,
  companySizesEnum,
} from "../enums/company.enum.js";
import { isValidObjectId } from "../utils/mongoose.js";

export const companyValidator = () => [
  body("companyName")
    .notEmpty()
    .withMessage("Company name is required")
    .isString()
    .withMessage("Company name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Company name must be between 2 and 50 characters"),
  body("industry")
    .optional()
    .isIn(companyIndustriesEnum)
    .withMessage(
      `Industry must be one of: ${companyIndustriesEnum.join(", ")}`
    ),
  body("size")
    .optional()
    .isIn(companySizesEnum)
    .withMessage(`Size must be one of: ${companySizesEnum.join(", ")}`),
  body("location")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Location must be a valid MongoDB ObjectId"),
  body("isApproved")
    .optional()
    .isBoolean()
    .withMessage("isApproved must be boolean"),
];
