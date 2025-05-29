import { body } from "express-validator";
import mongoose from "mongoose";

export const productValidator = () => [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Product name must be a string")
    .isLength({ min: 2, max: 60 })
    .withMessage("Product name must be between 2 and 60 characters"),
  body("company")
    .notEmpty()
    .withMessage("Company is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Company must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("sku")
    .notEmpty()
    .withMessage("SKU is required")
    .isString()
    .withMessage("SKU must be a string")
    .isLength({ min: 2, max: 30 })
    .withMessage("SKU must be between 2 and 30 characters"),
  body("unitPrice")
    .notEmpty()
    .withMessage("Unit price is required")
    .isNumeric()
    .withMessage("Unit price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be 0 or greater"),
  body("currency")
    .optional()
    .isString()
    .withMessage("Currency must be a string")
    .isLength({ min: 2, max: 10 })
    .withMessage("Currency must be between 2 and 10 characters"),
  body("unit")
    .optional()
    .isString()
    .withMessage("Unit must be a string")
    .isLength({ min: 1, max: 10 })
    .withMessage("Unit must be between 1 and 10 characters"),
  body("weight.value")
    .optional()
    .isNumeric()
    .withMessage("Weight value must be a number")
    .isFloat({ min: 0 })
    .withMessage("Weight value must be 0 or greater"),
  body("weight.unit")
    .optional()
    .isIn(["kg", "lb", "g", "oz"])
    .withMessage("Invalid weight unit"),
  body("dimensions.length")
    .optional()
    .isNumeric()
    .withMessage("Length must be a number")
    .isFloat({ min: 0 })
    .withMessage("Length must be 0 or greater"),
  body("dimensions.width")
    .optional()
    .isNumeric()
    .withMessage("Width must be a number")
    .isFloat({ min: 0 })
    .withMessage("Width must be 0 or greater"),
  body("dimensions.height")
    .optional()
    .isNumeric()
    .withMessage("Height must be a number")
    .isFloat({ min: 0 })
    .withMessage("Height must be 0 or greater"),
  body("dimensions.unit")
    .optional()
    .isIn(["cm", "in", "m", "ft"])
    .withMessage("Invalid dimension unit"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
];
