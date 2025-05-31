import Inventory from "../../models/Inventory.js";

// Get all inventory items for the authenticated user's company
export const getAllInventory = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [inventory, total] = await Promise.all([
      Inventory.find({ company: companyId })
        .populate("product company location")
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments({ company: companyId }),
    ]);

    res.status(200).json({
      status: "success",
      results: inventory.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};
