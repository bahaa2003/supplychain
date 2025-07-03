import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { AppError } from "../../utils/AppError.js";

// Update inventory item (only if it belongs to the user's company)
export const updateInventory = async (req, res, next) => {
  try {
    const { inventryId } = req.params;
    const { location, minimumThreshold, onHand, reserved, changeReason } =
      req.body;
    const userCompanyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.findOne({
      _id: inventryId,
      company: userCompanyId,
    });
    if (!inventory) return next(new AppError("Inventory not found", 404));
    if (location) inventory.location = location;
    if (minimumThreshold) inventory.minimumThreshold = minimumThreshold;
    let inventoryHistory;
    if (
      (reserved && inventory.reserved - reserved !== 0) ||
      (onHand && inventory.onHand - onHand !== 0)
    ) {
      inventoryHistory = await InventoryHistory.create({
        performedBy: req.user._id,
        company: userCompanyId,
        inventory: inventryId,
        product: inventory.product,
        changeType: inventoryChangeType.ADJUSTMENT,
        changeReason: changeReason || "Manual adjustment quantity",
        quantityChange: {
          onHand: onHand - inventory.onHand, // Positive change
          reserved: reserved - inventory.reserved, // Assuming reserved is not affected
        },
        before: {
          onHand: inventory.onHand,
          reserved: inventory.reserved, // Assuming reserved is not affected
        },
        after: {
          onHand: onHand,
          reserved: reserved, // Assuming reserved is not affected
        },
      });
    }
    inventory.onHand = onHand;
    inventory.reserved = reserved;
    inventory.save();
    return res
      .status(200)
      .json({ status: "success", data: { inventory, inventoryHistory } });
  } catch (err) {
    next(new AppError(err.message || "Failed to update inventory", 500));
  }
};
