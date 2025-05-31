import Location from "../../models/Location.js";
import { AppError } from "../../utils/AppError.js";

// Get all locations for the authenticated user's company

export const getAllLocations = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      Location.find({ company: companyId }).skip(skip).limit(limit),
      Location.countDocuments({ company: companyId }),
    ]);

    res.status(200).json({
      status: "success",
      results: locations.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: locations,
    });
  } catch (err) {
    next(err);
  }
};
