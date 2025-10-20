import Inventory from "../../models/Inventory.schema.js";
import { AppError } from "../../utils/AppError.js";

// Get all inventory items for the authenticated user's company
export const getAllInventory = async (req, res, next) => {
  try {
    const companyId =
      req.query.companyId || req.user.company?._id || req.user.company;
    const { locationId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = { company: companyId };
    if (locationId) {
      filter.location = locationId;
    }
    const [inventory, total] = await Promise.all([
      Inventory.find(filter, { __v: false })
        .populate([
          {
            path: "company",
            select: "companyName _id",
          },
          {
            path: "location",
            select: "locationName",
          },
        ])
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: "success",
      results: inventory.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: inventory,
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch inventory", 500));
  }
};
