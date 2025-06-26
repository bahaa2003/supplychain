import { body, param } from "express-validator";
import { orderStatusEnum } from "../enums/orderStatus.enum.js";
import { isValidObjectId } from "../utils/mongoose.js";

const validateObjectId = (field, message) => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required.`)
    .custom((value) => isValidObjectId(value))
    .withMessage(message);
};

export const createOrderValidator = [
  body("supplierId")
    .notEmpty()
    .withMessage("Supplier ID is required.")
    .custom((value) => isValidObjectId(value))
    .withMessage("Invalid supplier ID."),

  body("deliveryLocationId")
    .notEmpty()
    .withMessage("Delivery location ID is required.")
    .custom((value) => isValidObjectId(value))
    .withMessage("Invalid delivery location ID."),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item."),

  body("items.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each item.")
    .custom((value) => isValidObjectId(value))
    .withMessage("Invalid product ID in items."),

  body("items.*.quantity")
    .isInt({ gt: 0 })
    .withMessage("Item quantity must be a positive integer."),

  body("notes").optional().isString().withMessage("Notes must be a string."),

  body("requestedDeliveryDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid requested delivery date."),
];

export const orderIdValidator = [
  param("id").custom(isValidObjectId).withMessage("Invalid order ID."),
];

export const updateOrderStatusValidator = [
  ...orderIdValidator,
  body("status").isIn(orderStatusEnum).withMessage("Invalid order status."),
  body("notes").optional().isString(),
];
