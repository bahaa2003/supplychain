import { body } from "express-validator";
import mongoose from "mongoose";
import { locationTypeEnum } from "../enums/locationType.enum.js";

export const locationValidator = () => [
  body("locationName")
    .notEmpty()
    .withMessage("Location name is required")
    .isString()
    .withMessage("Location name must be a string")
    .isLength({ min: 2, max: 60 })
    .withMessage("Location name must be between 2 and 60 characters"),
  body("type")
    .notEmpty()
    .withMessage("Location type is required")
    .isIn(locationTypeEnum)
    .withMessage("Invalid location type"),
  body("address.street")
    .optional()
    .isString()
    .withMessage("Street must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Street must be between 2 and 100 characters"),
  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("address.state")
    .optional()
    .isString()
    .withMessage("State must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("address.country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("address.zipCode")
    .optional()
    .isString()
    .withMessage("Zip code must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Zip code must be between 2 and 20 characters"),
  body("contactPerson.name")
    .optional()
    .isString()
    .withMessage("Contact person name must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("Contact person name must be between 2 and 40 characters"),
  body("contactPerson.email")
    .optional()
    .isEmail()
    .withMessage("Contact person email must be valid"),
  body("contactPerson.phone")
    .optional()
    .isString()
    .withMessage("Contact person phone must be a string")
    .isLength({ min: 5, max: 20 })
    .withMessage("Contact person phone must be between 5 and 20 characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("coordinates.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a number between -90 and 90"),
  body("coordinates.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a number between -180 and 180"),
];
