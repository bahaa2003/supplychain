import Location from "../../models/Location.schema.js";
import { AppError } from "../../utils/AppError.js";

export const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const location = await Location.findOne({ _id: id, company: companyId });
    if (!location) return next(new AppError("Location not found", 404));
    res.status(200).json({ status: "success", data: location });
  } catch (err) {
    next(new AppError(err.message || "Failed to get location", 500));
  }
};
