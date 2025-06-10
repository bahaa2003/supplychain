import { body } from "express-validator";
import mongoose from "mongoose";
import { orderStatusEnum } from "../enums/orderStatus.enum.js";

export const createOrderValidator = () => [
  body("buyer")
    .not()
    .exists()
    .withMessage("buyer field should not be provided"),
  body("createdBy")
    .not()
    .exists()
    .withMessage("createdBy field should not be provided"),
  body("orderNumber")
    .not()
    .exists()
    .withMessage("orderNumber field should not be provided"),
  body("status")
    .not()
    .exists()
    .withMessage("status field should not be provided"),
  body("paymentStatus")
    .not()
    .exists()
    .withMessage("paymentStatus field should not be provided"),

  body("supplier")
    .notEmpty()
    .withMessage("Supplier is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Supplier must be a valid ObjectId"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be a non-empty array"),
  body("items.*.product")
    .notEmpty()
    .withMessage("Product is required for each item")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Product must be a valid ObjectId"),
  body("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each item")
    .isNumeric()
    .withMessage("Quantity must be a number")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.unitPrice")
    .notEmpty()
    .withMessage("Unit price is required for each item")
    .isNumeric()
    .withMessage("Unit price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be 0 or greater"),
  body("items.*.subtotal")
    .optional()
    .isNumeric()
    .withMessage("Subtotal must be a number"),

  body("totalAmount")
    .notEmpty()
    .withMessage("Total amount is required")
    .isNumeric()
    .withMessage("Total amount must be a number"),

  body("currency")
    .optional()
    .isString()
    .withMessage("Currency must be a string"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
  body("requestedDeliveryDate")
    .optional()
    .isISO8601()
    .withMessage("Requested delivery date must be a valid date"),
  body("deliveryAddress")
    .optional()
    .isObject()
    .withMessage("Delivery address must be an object"),
  body("billingAddress")
    .optional()
    .isObject()
    .withMessage("Billing address must be an object"),
  body("paymentTerms")
    .optional()
    .isString()
    .withMessage("Payment terms must be a string"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
];

export const updateOrderStatusValidator = () => [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(orderStatusEnum)
    .withMessage(`Status must be one of: ${orderStatusEnum.join(", ")}`),
  // امنع إرسال أي حقول أخرى
  body([
    "buyer",
    "createdBy",
    "orderNumber",
    "paymentStatus",
    "items",
    "supplier",
    "totalAmount",
    "currency",
    "notes",
    "requestedDeliveryDate",
    "deliveryAddress",
    "billingAddress",
    "paymentTerms",
    "tags",
  ])
    .not()
    .exists()
    .withMessage("Only status can be updated in this request"),
];
