import catchError from "../../utils/catchError.js";
import AppError from "../../utils/AppError.js";
import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import httpStatusText from "../../utils/httpStatusText.js";

const validateProduct = catchError(async (req, res, next) => {
  const { sku, quantity, unitPrice, supplierId } = req.body;

  // 1. Find the product by SKU for the given supplier
  const product = await Product.findOne({
    sku,
    company: supplierId,
    isActive: true,
  });

  if (!product) {
    return next(
      new AppError(
        "Product with this SKU not found for the specified supplier.",
        404
      )
    );
  }

  // 2. Find the inventory record for that product
  const inventory = await Inventory.findOne({
    product: product._id,
    company: supplierId,
  });

  if (!inventory) {
    return next(
      new AppError("Inventory record not found for this product.", 404)
    );
  }

  // 3. Check for price changes
  if (product.unitPrice !== unitPrice) {
    return res.status(409).json({
      status: httpStatusText.FAIL,
      error: "PRICE_CHANGED",
      data: {
        sku,
        quantity,
        currentPrice: product.unitPrice,
        requestedPrice: unitPrice,
      },
    });
  }

  // 4. Check for sufficient stock
  if (inventory.available < quantity) {
    return res.status(409).json({
      status: httpStatusText.FAIL,
      error: "INSUFFICIENT_STOCK",
      data: {
        sku,
        requestedQuantity: quantity,
        availableQuantity: inventory.available,
      },
    });
  }

  // 5. If everything is OK
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      sku,
      quantity,
      unitPrice,
      available: true,
    },
  });
});

export default validateProduct;
