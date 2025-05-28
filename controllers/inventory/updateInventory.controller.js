import Inventory from "../../models/Inventory";
import { AppError } from "../../utils/AppError";

// Update inventory item (only if it belongs to the user's company)

export const updateInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.findOneAndUpdate(
      { _id: id, company: companyId },
      req.body,
      { new: true }
    );
    if (!inventory) return next(new AppError("Inventory not found", 404));
    res.status(200).json({ status: "success", data: inventory });
  } catch (err) {
    next(err);
  }
};
