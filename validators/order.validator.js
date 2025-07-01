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

export const updateOrderStatusValidator = () => [
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

export const addOrderItemValidator = () => [
  param("orderId").isMongoId().withMessage("Invalid order ID"),

  body("sku")
    .notEmpty()
    .withMessage("SKU is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("SKU must be between 1 and 50 characters")
    .trim(),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

export const editOrderItemValidator = () => [
  param("orderId").isMongoId().withMessage("Invalid order ID"),

  param("itemId").isMongoId().withMessage("Invalid item ID"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

export const removeOrderItemValidator = () => [
  param("orderId").isMongoId().withMessage("Invalid order ID"),
  param("itemId").isMongoId().withMessage("Invalid item ID"),
];
