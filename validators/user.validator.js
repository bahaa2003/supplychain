import { body } from "express-validator";
import mongoose from "mongoose";
import { roleEnum } from "../enums/role.enum.js";
import { isValidObjectId } from "../utils/mongoose.js";

export const userValidator = () => [
  body("name")
    .notEmpty()
    .withMessage("User name is required")
    .isString()
    .withMessage("User name must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("User name must be between 2 and 40 characters"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ max: 100 })
    .withMessage("Password must be between 8 and 100 characters")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol"
    ),
  body("role")
    .optional()
    .isIn(roleEnum)
    .withMessage(`Role must be one of: ${roleEnum.join(", ")}`),
  body("company")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Company must be a valid MongoDB ObjectId"),
];
