import { body } from "express-validator";
import mongoose from "mongoose";
import { unitEnum } from "../enums/unit.enum.js";
import { isValidObjectId } from "../utils/mongoose.js";
export const createinventoryValidator = () => [
  body("productName")
    .notEmpty()
    .withMessage("Product name is required.")
    .isString()
    .withMessage("Product name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Product name must be between 2 and 50 characters"),
  body("sku")
    .notEmpty()
    .withMessage("SKU is required.")
    .isString()
    .withMessage("SKU must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("SKU must be between 2 and 50 characters"),
  body("unitPrice")
    .notEmpty()
    .withMessage("Unit price is required.")
    .isFloat({ gte: 0 })
    .withMessage("Unit price must be a non-negative number."),
  body("unit")
    .notEmpty()
    .withMessage("Unit is required.")
    .isIn(unitEnum)
    .withMessage(`Unit must be one of: ${unitEnum.join(", ")}`),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("onHand")
    .optional()
    .isNumeric()
    .withMessage("On hand quantity must be a number"),
  body("minimumThreshold")
    .optional()
    .isNumeric()
    .withMessage("Minimum threshold must be a number"),
  body("location")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid product ID in items."),
];

export const updateInventoryValidator = () => [
  body("productName")
    .optional()
    .isString()
    .withMessage("Product name must be a string"),
  body("sku").optional().isString().withMessage("SKU must be string."),
  body("unitPrice")
    .optional()
    .isFloat({ gte: 0 })
    .withMessage("Unit price must be a non-negative number."),
  body("unit")
    .optional()
    .isIn(unitEnum)
    .withMessage(`Unit must be one of: ${unitEnum.join(", ")}`),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("quantity")
    .not()
    .exists()
    .withMessage(
      "You cannot update quantity fields directly. Use stock adjustment endpoints."
    ),
  body("location")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid product ID in items."),
  body("minimumThreshold")
    .optional()
    .isNumeric()
    .withMessage("Minimum threshold must be a number"),
  body("status").optional().isString().withMessage("Status must be a string"),
];

export const validateProductRequestValidator = () => [
  body("sku").isString().notEmpty().withMessage("Product SKU is required."),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer."),
  body("unitPrice")
    .isFloat({ gte: 0 })
    .withMessage("Unit price must be a non-negative number."),
  body("supplierId")
    .custom(isValidObjectId)
    .withMessage("Invalid supplier ID."),
];
