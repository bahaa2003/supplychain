import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

export function validationExecution(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsMsg = errors.array().map((ele) => ele.msg);
    const error = new AppError(errorsMsg, 400);
    return next(error);
  }
  next();
}
