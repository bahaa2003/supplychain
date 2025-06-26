import mongoose from "mongoose";

/**
 * Checks if a value is a valid Mongoose ObjectId.
 * @param {string} id The value to check.
 * @returns {boolean} True if the value is a valid ObjectId, false otherwise.
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
