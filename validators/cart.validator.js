import { body, param } from "express-validator";

const addToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
];

const updateCartItemValidator = [
  param("cartItemId")
    .notEmpty()
    .withMessage("Cart item ID is required")
    .isMongoId()
    .withMessage("Invalid cart item ID format"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
];

const removeCartItemValidator = [
  param("cartItemId")
    .notEmpty()
    .withMessage("Cart item ID is required")
    .isMongoId()
    .withMessage("Invalid cart item ID format"),
];

export { addToCartValidator, updateCartItemValidator, removeCartItemValidator };
