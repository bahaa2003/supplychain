import Location from "../../models/Location.schema.js";
import { AppError } from "../../utils/AppError.js";

// Update location (only if it belongs to the user's company)

export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const location = await Location.findOneAndUpdate(
      { _id: id, company: companyId },
      req.body,
      { new: true }
    );
    if (!location) return next(new AppError("Location not found", 404));
    res.status(200).json({ status: "success", data: location });
  } catch (err) {
    next(new AppError(err.message || "Failed to update location", 500));
  }
};
