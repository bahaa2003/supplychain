import Location from "../../models/Location.js";
import { AppError } from "../../utils/AppError.js";

// Delete location (only if it belongs to the user's company)

export const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const location = await Location.findOneAndDelete({
      _id: id,
      company: companyId,
    });
    if (!location) return next(new AppError("Location not found", 404));
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(new AppError(err.message || "Failed to delete location", 500));
  }
};
