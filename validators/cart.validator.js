import { body } from "express-validator";

export const cartItemValidators = [
  body("items.*.product")
    .isString()
    .withMessage("Product must be a string")
    .notEmpty()
    .withMessage("Product is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be at least 0"),
  body("items.*.subtotal")
    .isFloat({ min: 0 })
    .withMessage("Subtotal must be at least 0"),
];

export const createCartValidator = [
  body("setAllOrNot")
    .optional()
    .isBoolean()
    .withMessage("setAllOrNot must be boolean"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one item"),
  ...cartItemValidators,
];

export const updateCartValidator = [
  body("setAllOrNot")
    .optional()
    .isBoolean()
    .withMessage("setAllOrNot must be boolean"),
  body("items").optional().isArray().withMessage("Items must be an array"),
  ...cartItemValidators,
];
