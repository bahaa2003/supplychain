import Inventory from "../../models/Inventory.js";

// Get all inventory items for the authenticated user's company
export const getAllInventory = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.find({ company: companyId }).populate(
      "product company location"
    );
    res.status(200).json({ status: "success", data: inventory });
  } catch (err) {
    next(err);
  }
};
