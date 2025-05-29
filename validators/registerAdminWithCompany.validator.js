import { body } from "express-validator";

export const registerAdminWithCompanyValidator = () => [
  body("name")
    .notEmpty().withMessage("Admin name is required")
    .isString().withMessage("Admin name must be a string")
    .isLength({ min: 2, max: 40 }).withMessage("Admin name must be between 2 and 40 characters"),
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8, max: 80 }).withMessage("Password must be between 8 and 80 characters"),
  body("companyName")
    .notEmpty().withMessage("Company name is required")
    .isString().withMessage("Company name must be a string")
    .isLength({ min: 2, max: 50 }).withMessage("Company name must be between 2 and 50 characters"),
  body("industry")
    .optional().isString().withMessage("Industry must be a string")
    .isLength({ min: 2, max: 50 }).withMessage("Industry must be between 2 and 50 characters"),
  body("size")
    .optional().isString().withMessage("Size must be a string")
    .isLength({ min: 1, max: 20 }).withMessage("Size must be between 1 and 20 characters"),
  body("location")
    .optional().isString().withMessage("Location must be a string")
    .isLength({ min: 2, max: 100 }).withMessage("Location must be between 2 and 100 characters"),
];
