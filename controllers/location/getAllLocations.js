import Location from "../../models/Location.js";
import { AppError } from "../../utils/AppError.js";

// Get all locations for the authenticated user's company

export const getAllLocations = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const locations = await Location.find({ company: companyId });
    res.status(200).json({ status: "success", data: locations });
  } catch (err) {
    next(err);
  }
};
