import { body } from "express-validator";
import mongoose from "mongoose";
import { currencyEnum } from "../enums/currency.enum.js";
import { unitEnum } from "../enums/unit.enum.js";

export const createProductValidator = () => [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Product name must be a string")
    .isLength({ min: 2, max: 60 })
    .withMessage("Product name must be between 2 and 60 characters"),
  body("company")
    .not()
    .exists()
    .withMessage("Company field should not be provided"),
  body("sku").not().exists().withMessage("sku field should not be provided"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("unitPrice")
    .notEmpty()
    .withMessage("Unit price is required")
    .isNumeric()
    .withMessage("Unit price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be 0 or greater"),
  body("currency")
    .optional()
    .isIn(currencyEnum)
    .withMessage(`Currency must be one of: ${currencyEnum.join(", ")}`),
  body("unit")
    .optional()
    .isIn(unitEnum)
    .withMessage(`Unit must be one of: ${unitEnum.join(", ")}`),
  body("weight.value")
    .optional()
    .isNumeric()
    .withMessage("Weight value must be a number")
    .isFloat({ min: 0 }),
  body("weight.unit")
    .optional()
    .isIn(["kg", "lb", "g", "oz"])
    .withMessage("Invalid weight unit"),
  body("dimensions.length")
    .optional()
    .isNumeric()
    .withMessage("Length must be a number")
    .isFloat({ min: 0 }),
  body("dimensions.width")
    .optional()
    .isNumeric()
    .withMessage("Width must be a number")
    .isFloat({ min: 0 }),
  body("dimensions.height")
    .optional()
    .isNumeric()
    .withMessage("Height must be a number")
    .isFloat({ min: 0 }),
  body("dimensions.unit")
    .optional()
    .isIn(["cm", "in", "m", "ft"])
    .withMessage("Invalid dimension unit"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string (URL)"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
];

export const updateProductValidator = () => [
  body("name")
    .optional()
    .isString()
    .withMessage("Product name must be a string")
    .isLength({ min: 2, max: 60 })
    .withMessage("Product name must be between 2 and 60 characters"),
  body("company")
    .not()
    .exists()
    .withMessage("Company field should not be provided"),
  body("sku").not().exists().withMessage("sku field should not be provided"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("unitPrice")
    .optional()
    .isNumeric()
    .withMessage("Unit price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be 0 or greater"),
  body("currency")
    .optional()
    .isIn(currencyEnum)
    .withMessage(`Currency must be one of: ${currencyEnum.join(", ")}`),
  body("unit")
    .optional()
    .isIn(unitEnum)
    .withMessage(`Unit must be one of: ${unitEnum.join(", ")}`),
  body("weight.value")
    .optional()
    .isNumeric()
    .withMessage("Weight value must be a number")
    .isFloat({ min: 0 }),
  body("weight.unit")
    .optional()
    .isIn(["kg", "lb", "g", "oz"])
    .withMessage("Invalid weight unit"),
  body("dimensions.length")
    .optional()
    .isNumeric()
    .withMessage("Length must be a number")
    .isFloat({ min: 0 }),
  body("dimensions.width")
    .optional()
    .isNumeric()
    .withMessage("Width must be a number")
    .isFloat({ min: 0 }),
  body("dimensions.height")
    .optional()
    .isNumeric()
    .withMessage("Height must be a number")
    .isFloat({ min: 0 }),
  body("dimensions.unit")
    .optional()
    .isIn(["cm", "in", "m", "ft"])
    .withMessage("Invalid dimension unit"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings")
    .custom((value) => {
      if (value && value.length > 5) {
        throw new Error("You can upload a maximum of 5 images");
      }
      return true;
    }),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string (URL)"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
];
