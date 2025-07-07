import Inventory from "../../models/Inventory.schema.js";
import { AppError } from "../../utils/AppError.js";
// Delete inventory item (only if it belongs to the user's company)

export const deleteInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.findOneAndDelete({
      _id: id,
      company: companyId,
    });
    if (!inventory) return next(new AppError("Inventory not found", 404));
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(new AppError(err.message || "Failed to delete inventory", 500));
  }
};
