import PartnerConnection from "../models/partnerConnection.model.js";
import { AppError } from "../utils/AppError.js";
import { catchError } from "../utils/catchError.js";

export const checkConnection = (company1, company2) => {
  return catchError(async (req, res, next) => {
    const check = await PartnerConnection.findOne({
      $or: [
        { requester: { $in: [company1, company2] } },
        { recipient: { $in: [company1, company2] } },
      ],
      status: "Accepted",
    });
    if (check) next();
    else {
      return next(
        new AppError("No connection found between the companies", 404)
      );
    }
  });
};
