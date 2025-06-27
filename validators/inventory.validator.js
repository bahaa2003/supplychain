import { body } from "express-validator";
import mongoose from "mongoose";
export const createinventoryValidator = () => [
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
  body(["inttialQuantity"])
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
