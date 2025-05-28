import Inventory from "../../models/Inventory";

// Create new inventory item (for the user's company only)

export const createInventory = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const inventory = await Inventory.create({
      ...req.body,
      company: companyId,
    });
    res.status(201).json({ status: "success", data: inventory });
  } catch (err) {
    next(err);
  }
};
