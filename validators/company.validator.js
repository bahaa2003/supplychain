import { body } from "express-validator";
import mongoose from "mongoose";

export const companyValidator = () => [
  body("name")
    .notEmpty()
    .withMessage("Company name is required")
    .isString()
    .withMessage("Company name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Company name must be between 2 and 50 characters"),
  body("industry")
    .optional()
    .isString()
    .withMessage("Industry must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Industry must be between 2 and 50 characters"),
  body("size")
    .optional()
    .isString()
    .withMessage("Size must be a string")
    .isLength({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20 characters"),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("createdBy")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("createdBy must be a valid user ID");
      }
      return true;
    }),
  body("isApproved")
    .optional()
    .isBoolean()
    .withMessage("isApproved must be boolean"),
];
