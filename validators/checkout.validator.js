import { body } from "express-validator";

const validateCartIdValidator = [
  body("cartId")
    .notEmpty()
    .withMessage("Cart ID is required")
    .isMongoId()
    .withMessage("Invalid Cart ID format"),
];

export { validateCartIdValidator };
