import { AppError } from "../../utils/AppError.js";
import {
  companyIndustriesEnum,
  companySizesEnum,
  companySizesNumberEnum,
  subscriptionPlansEnum,
  subscriptionStatusesEnum,
} from "../../enums/company.enum.js";
import { locationTypeEnum } from "../../enums/locationType.enum.js";
import { currencyEnum } from "../../enums/currency.enum.js";
import { inventoryChangeTypeEnum } from "../../enums/inventoryChangeType.enum.js";
import { unitEnum } from "../../enums/unit.enum.js";
import { partnerConnectionStatusEnum } from "../../enums/partnerConnectionStatus.enum.js";
import { roleEnum } from "../../enums/role.enum.js";

export const getEnum = async (req, res, next) => {
  try {
    const { enumName } = req.params;
    const data = {};
    switch (enumName) {
      case "companyIndustries":
        data.enum = companyIndustriesEnum;
        break;
      case "companySizes":
        data.enum = companySizesEnum;
        break;
      case "companySizesNumber":
        data.enum = companySizesNumberEnum;
        break;
      case "subscriptionPlans":
        data.enum = subscriptionPlansEnum;
        break;
      case "subscriptionStatuses":
        data.enum = subscriptionStatusesEnum;
        break;
      case "locationType":
        data.enum = locationTypeEnum;
        break;
      case "currency":
        data.enum = currencyEnum;
        break;
      case "inventoryChangeType":
        data.enum = inventoryChangeTypeEnum;
        break;
      case "unit":
        data.enum = unitEnum;
        break;
      case "partnerConnectionStatus":
        data.enum = partnerConnectionStatusEnum;
        break;
      case "userRoles":
        data.enum = roleEnum;
        break;
    }
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to get enum", 500));
  }
};
