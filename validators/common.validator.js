import { param } from "express-validator";

/**
 * Creates a validator to check if a URL parameter is a valid MongoDB ID.
 * @param {string} fieldName - The name of the parameter field to validate.
 * @returns {ValidationChain} An express-validator validation chain.
 */
export const validateMongoId = (fieldName) => {
  return param(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isMongoId()
    .withMessage(`Invalid ${fieldName} format`);
};
