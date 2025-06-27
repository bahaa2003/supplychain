import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";
import Inventory from "../../models/Inventory.js";

const generateSku = () => {
  return `${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
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
      company: companyId,
      productName,
      sku,
      unitPrice,
      unit,
      category,
      isActive,
    });
    console.log("Product created:", product);
    const defaultLocation = req.body.location || user.company?.location;

    // After normal product creation, create inventory
    await Inventory.create({
      product: product._id,
      company: companyId,
      onHand: req.body.initialQuantity || 0,
      minimumThreshold: req.body.minimumThreshold || 10,
      lastUpdated: new Date(),
      location: defaultLocation,
    });

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
