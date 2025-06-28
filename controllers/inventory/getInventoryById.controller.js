import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import { AppError } from "../../utils/AppError.js";

// Get inventory by ID (only if it belongs to the user's company)

export const getInventoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.findOne({
      _id: id,
      company: companyId,
    })
      .select({
        __v: false,
        company: false,
        location: false,
        product: false,
      })
      .populate("product company location");
    if (!inventory) return next(new AppError("Inventory not found", 404));

    const inventoryHistory = await InventoryHistory.find({
      inventory: inventory._id,
    })
      .select({
        __v: false,
        inventory: false,
        company: false,
        product: false,
      })
      .populate([
        { path: "performedBy", select: "name email" },
        { path: "company", select: "companyName" },
      ])
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      data: { inventory, inventoryHistory },
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to get inventory", 500));
  }
};
