import Inventory from "../../models/Inventory.schema.js";
import InventoryHistory from "../../models/InventoryHistory.schema.js";
import { AppError } from "../../utils/AppError.js";

// Get inventory and History by ID (only if it belongs to the user's company)

export const getInventoryById = async (req, res, next) => {
  try {
    const { inventryId } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.findOne({
      _id: inventryId,
      company: companyId,
    })
      .select({
        __v: false,
      })
      .populate("company location");
    if (!inventory) return next(new AppError("Inventory not found", 404));

    const inventoryHistory = await InventoryHistory.find({
      inventory: inventryId,
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
