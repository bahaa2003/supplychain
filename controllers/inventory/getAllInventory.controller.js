import Inventory from "../../models/Inventory.schema.js";

// Get all inventory items for the authenticated user's company
export const getAllInventory = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [inventory, total] = await Promise.all([
      Inventory.find(
        { company: companyId },
        { __v: false, supplierInfo: false }
      )
        .populate([
          {
            path: "product",
            select: "productName sku unitPrice unit category isActive _id ",
          },
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
      Inventory.countDocuments({ company: companyId }),
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
