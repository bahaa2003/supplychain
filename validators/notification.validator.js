import { body } from "express-validator";
import mongoose from "mongoose";
import { notificationTypeEnum } from "../enums/notificationType.enum.js";
import { notificationRelatedEnum } from "../enums/notificationRelated.enum.js";
import { notificationPriorityEnum } from "../enums/notificationPriority.enum.js";

export const notificationValidator = () => [
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(notificationTypeEnum)
    .withMessage(`Type must be one of: ${notificationTypeEnum.join(", ")}`),
  body("data")
    .notEmpty()
    .withMessage("Data is required")
    .isObject()
    .withMessage("Data must be an object"),
  body("recipient")
    .notEmpty()
    .withMessage("Recipient is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Recipient must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string"),
  body("related")
    .optional()
    .isIn(notificationRelatedEnum)
    .withMessage(
      `Related must be one of: ${notificationRelatedEnum.join(", ")}`
    ),
  body("relatedId")
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("relatedId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("priority")
    .optional()
    .isIn(notificationPriorityEnum)
    .withMessage(
      `Priority must be one of: ${notificationPriorityEnum.join(", ")}`
    ),
  body("actionRequired")
    .optional()
    .isBoolean()
    .withMessage("actionRequired must be boolean"),
  body("actionLink")
    .optional()
    .isString()
    .withMessage("actionLink must be a string"),
  body("sentVia.email")
    .optional()
    .isBoolean()
    .withMessage("sentVia.email must be boolean"),
  body("sentVia.inApp")
    .optional()
    .isBoolean()
    .withMessage("sentVia.inApp must be boolean"),
  body("sentVia.sms")
    .optional()
    .isBoolean()
    .withMessage("sentVia.sms must be boolean"),
];

export const bulkNotificationValidator = () => [
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(notificationTypeEnum)
    .withMessage(`Type must be one of: ${notificationTypeEnum.join(", ")}`),
  body("data")
    .notEmpty()
    .withMessage("Data is required")
    .isObject()
    .withMessage("Data must be an object"),
  body("recipients")
    .notEmpty()
    .withMessage("Recipients is required")
    .isArray()
    .withMessage("Recipients must be an array")
    .custom((value) => {
      if (!value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("All recipients must be valid MongoDB ObjectIds");
      }
      return true;
    }),
];
