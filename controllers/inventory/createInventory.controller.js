import Location from "../../models/Location.schema.js";
import { AppError } from "../../utils/AppError.js";
import Inventory from "../../models/Inventory.schema.js";
import InventoryHistory from "../../models/InventoryHistory.schema.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";

const generateSku = () => {
  return `${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
};

import mongoose from "mongoose";

export const createInventory = async (req, res, next) => {
  // create a session
  const session = await mongoose.startSession();

  try {
    // start transaction
    await session.startTransaction();

    const userCompanyId = req.user.company?._id || req.user.company;

    const {
      productName,
      sku = generateSku(),
      unitPrice,
      unit,
      category,
      isActive,
      quantity,
      minimumThreshold,
      locationId,
    } = req.body;

    // check if product with the same name already exists
    const existingProduct = await Inventory.findOne({
      productName,
      company: userCompanyId,
    })
      .lean()
      .session(session);

    if (existingProduct) {
      return next(new AppError("Product with this name already exists", 400));
    }

    console.log("Creating product with SKU:", sku);

    // check if the location exists
    const location = await Location.findOne({
      _id: locationId,
      company: userCompanyId,
    })
      .select("_id")
      .session(session);

    if (!location) {
      return next(new AppError("Location is required", 400));
    }

    // create the product
    const [inventory] = await Inventory.create(
      [
        {
          company: userCompanyId,
          productName,
          sku,
          unitPrice,
          unit,
          category,
          isActive,
          onHand: quantity || 0,
          reserved: 0,
          minimumThreshold: minimumThreshold || 0,
          lastUpdated: new Date(),
          location: locationId,
        },
      ],
      { session }
    );

    console.log("Inventory created:", inventory);

    // create the inventory history if there is any quantity
    if (inventory.onHand || inventory.reserved) {
      await InventoryHistory.create(
        [
          {
            inventory: inventory._id,
            company: userCompanyId,
            before: {
              onHand: 0,
              reserved: 0,
            },
            after: {
              onHand: inventory.onHand,
              reserved: inventory.reserved,
            },
            quantity: req.body.quantity || 0,
            changeType: inventoryChangeType.INITIAL_STOCK,
            performedBy: req.user._id,
          },
        ],
        { session }
      );
    }

    // commit all the operations
    await session.commitTransaction();

    console.log("Inventory created");

    res.status(201).json({
      status: "success",
      data: {
        inventory,
      },
    });
  } catch (err) {
    // abort all the operations in case of an error
    await session.abortTransaction();
    next(new AppError(err.message || "Failed to create inventory", 500));
  } finally {
    // end the session
    await session.endSession();
  }
};
