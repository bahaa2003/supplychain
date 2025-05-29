import { body } from "express-validator";
import mongoose from "mongoose";

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
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "staff", "platform_admin"])
    .withMessage("Invalid role"),
  body("company")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Company must be a valid MongoDB ObjectId");
      }
      return true;
    }),
];
