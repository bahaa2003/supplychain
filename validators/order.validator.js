import { body, param } from "express-validator";
import { orderStatusEnum } from "../enums/orderStatus.enum.js";

export const createOrderValidator = () => [
  param("supplierId")
    .notEmpty()
    .withMessage("Supplier ID is required")
    .isMongoId()
    .withMessage("Supplier ID must be a valid MongoDB ObjectId"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.sku").notEmpty().withMessage("Product sku is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1")
    .toInt(),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
  body("requestedDeliveryDate")
    .optional()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Delivery date must be in the future");
      }
      return true;
    }),
];

export const updateOrderValidator = () => [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(orderStatusEnum)
    .withMessage(`Status must be one of: "${orderStatusEnum.join(", ")}"`),
  body("notes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
  body("confirmedDeliveryDate")
    .optional()
    .isISO8601()
    .withMessage("Confirmed delivery date must be a valid ISO date"),
];

export const returnOrderValidator = () => [
  body("returnItems")
    .isArray({ min: 1 })
    .withMessage("At least one item must be returned"),
  body("returnItems.*.sku")
    .notEmpty()
    .withMessage("Product sku is required for each return item"),
  body("returnItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1 for each return item")
    .toInt(),
  body("returnItems.*.reason")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Reason must be less than 200 characters"),
  body("returnReason")
    .notEmpty()
    .withMessage("Return reason is required")
    .isString()
    .isLength({ max: 500 })
    .withMessage("Return reason must be less than 500 characters"),
  body("isPartialReturn")
    .optional()
    .isBoolean()
    .withMessage("isPartialReturn must be boolean")
    .toBoolean(),
];
