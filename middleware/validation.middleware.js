import { validationResult } from "express-validator";
import { httpStatusText } from "../utils/httpStatusText.js";
import { AppError } from "../utils/AppError.js";

export function validationExecution(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsMsg = errors.array().map((ele) => ele.msg);
    const error = AppError(errorsMsg, 400);
    return next(error);
  }
  next();
}
