import Product from "../../models/Product.js";
import Attachment from "../../models/Attachment.js";
import { AppError } from "../../utils/AppError.js";
import Inventory from "../../models/Inventory.js";

const generateSku = () => {
  return `SKU-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
};

export const createProduct = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;

    const existingProduct = await Product.findOne({
      productName: req.body.productName,
      company: companyId,
    }).lean();

    if (existingProduct) {
      return next(new AppError("Product with this name already exists", 400));
    }

    const product = await Product.create({
      ...req.body,
      company: companyId,
      sku: generateSku(),
    });

    // After normal product creation, create inventory
    await Inventory.create({
      product: product._id,
      company: companyId,
      currentQuantity: req.body.initialQuantity || 0,
      reservedQuantity: req.body.reservedQuantity || 0,
      availableQuantity: req.body.initialQuantity || 0,
      minimumThreshold: req.body.minimumThreshold || 10,
      maximumThreshold: req.body.maximumThreshold || 100,
      lastUpdated: new Date(),
    });

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
