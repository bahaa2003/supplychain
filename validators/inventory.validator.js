import { body } from "express-validator";
import mongoose from "mongoose";
import { unitEnum } from "../enums/unit.enum.js";

export const createinventoryValidator = () => [
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
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage("Invalid product ID in items."),
];

export const updateInventoryValidator = () => [
  body("productName")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Product name is required."),
  body("sku").optional().isString().withMessage("SKU must be string."),
  body("unitPrice")
    .optional()
    .isFloat({ gte: 0 })
    .withMessage("Unit price must be a non-negative number."),
  body("unit").optional().isIn(unitEnum).withMessage("Invalid unit."),
  body("description").optional().isString(),
  body("category").optional().isString(),
  body("isActive").optional().isBoolean(),
  body(["quantity"])
    .not()
    .exists()
    .withMessage(
      "You cannot update quantity fields directly. Use stock adjustment endpoints."
    ),
  body("location")
    .optional()
    .isMongoId()
    .withMessage("Location must be a valid ObjectId")
    .custom((value) => isValidObjectId(value))
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
