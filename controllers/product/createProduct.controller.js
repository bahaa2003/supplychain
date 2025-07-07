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

export const createProduct = async (req, res, next) => {
  try {
    const userCompanyId = req.user.company?._id || req.user.company;

    const existingProduct = await Product.findOne({
      productName: req.body.productName,
      company: userCompanyId,
    }).lean();

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
    const product = await Product.create({
      company: userCompanyId,
      productName,
      sku,
      unitPrice,
      unit,
      category,
      isActive,
    });
    console.log("Product created:", product);
    const defaultLocation = await Location.findOne({
      _id: req.body.location,
      company: userCompanyId,
    }).select("_id");
    if (!defaultLocation) {
      return next(new AppError("Location is required", 400));
    }

    // After normal product creation, create inventory
    const inventory = await Inventory.create({
      product: product._id,
      company: userCompanyId,
      onHand: req.body.initialQuantity || 0,
      reserved: 0,
      minimumThreshold: req.body.minimumThreshold || 10,
      lastUpdated: new Date(),
      location: defaultLocation,
    });
    if (inventory.onHand || inventory.reserved) {
      await InventoryHistory.create({
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
        product: product._id,
        quantity: req.body.initialQuantity || 0,
        changeType: inventoryChangeType.INITIAL_STOCK,
        performedBy: req.user._id,
      });
    }

    console.log("Inventory created for product:", product._id);
    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to create product", 500));
  }
};
