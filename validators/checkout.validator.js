import { body } from "express-validator";

export const validateCartIdValidator = () => [
  body("cartId")
    .notEmpty()
    .withMessage("Cart ID is required")
    .isMongoId()
    .withMessage("Invalid Cart ID format"),
];
