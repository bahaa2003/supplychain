import { body } from "express-validator";
import mongoose from "mongoose";
import { unitEnum } from "../enums/unit.enum.js";
import { isValidObjectId } from "../utils/mongoose.js";

export const createProductValidator = () => [
  body("productName")
    .isString()
    .notEmpty()
    .withMessage("Product name is required."),
  body("sku").isString().notEmpty().withMessage("SKU is required."),
  body("unitPrice")
    .isFloat({ gte: 0 })
    .withMessage("Unit price must be a non-negative number."),
  body("unit").isIn(unitEnum).withMessage("Invalid unit."),
  body("category").optional().isString(),
];

export const updateProductValidator = () => [
  body("productName")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Product name is required."),
  body("sku").optional().isString().notEmpty().withMessage("SKU is required."),
  body("unitPrice")
    .optional()
    .isFloat({ gte: 0 })
    .withMessage("Unit price must be a non-negative number."),
  body("unit").optional().isIn(unitEnum).withMessage("Invalid unit."),
  body("description").optional().isString(),
  body("category").optional().isString(),
  body("isActive").optional().isBoolean(),
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
