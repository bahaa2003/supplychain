import Product from "../../models/Product.schema.js";
import Location from "../../models/Location.schema.js";
import Company from "../../models/Company.schema.js";
import { AppError } from "../../utils/AppError.js";
import Inventory from "../../models/Inventory.schema.js";
import InventoryHistory from "../../models/InventoryHistory.schema.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";

const generateSku = () => {
  return `${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
};

import mongoose from "mongoose";

export const createProduct = async (req, res, next) => {
  // create a session
  const session = await mongoose.startSession();

  try {
    // start transaction
    await session.startTransaction();

    const userCompanyId = req.user.company?._id || req.user.company;

    // check if product with the same name already exists
    const existingProduct = await Product.findOne({
      productName: req.body.productName,
      company: userCompanyId,
    })
      .lean()
      .session(session);

    if (existingProduct) {
      return next(new AppError("Product with this name already exists", 400));
    }

    const {
      productName,
      sku = generateSku(),
      unitPrice,
      unit,
      category,
      isActive,
    } = req.body;

    console.log("Creating product with SKU:", sku);

    // create the product
    const product = await Product.create(
      [
        {
          company: userCompanyId,
          productName,
          sku,
          unitPrice,
          unit,
          category,
          isActive,
        },
      ],
      { session }
    );

    console.log("Product created:", product[0]);

    // check if the location exists
    const location = await Location.findOne({
      _id: req.body.location,
      company: userCompanyId,
    })
      .select("_id")
      .session(session);

    if (!location) {
      return next(new AppError("Location is required", 400));
    }

    // create the inventory
    const inventory = await Inventory.create(
      [
        {
          product: product[0]._id,
          company: userCompanyId,
          onHand: req.body.quantity || 0,
          reserved: 0,
          minimumThreshold: req.body.minimumThreshold || 10,
          lastUpdated: new Date(),
          location,
        },
      ],
      { session }
    );

    // create the inventory history if there is any quantity
    if (inventory[0].onHand || inventory[0].reserved) {
      await InventoryHistory.create(
        [
          {
            inventory: inventory[0]._id,
            company: userCompanyId,
            before: {
              onHand: 0,
              reserved: 0,
            },
            after: {
              onHand: inventory[0].onHand,
              reserved: inventory[0].reserved,
            },
            product: product[0]._id,
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

    console.log("Inventory created for product:", product[0]._id);

    res.status(201).json({
      status: "success",
      data: {
        product: product[0],
      },
    });
  } catch (err) {
    // abort all the operations in case of an error
    await session.abortTransaction();
    next(new AppError(err.message || "Failed to create product", 500));
  } finally {
    // end the session
    await session.endSession();
  }
};
