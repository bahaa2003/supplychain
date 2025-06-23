import Product from "../../models/Product.js";
import Attachment from "../../models/Attachment.js";
import { AppError } from "../../utils/AppError.js";
import { uploadToImageKit } from "../../middleware/upload.middleware.js";
import Inventory from "../../models/Inventory.js";

const generateSku = () => {
  return `SKU-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
};

export const createProduct = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;

    const existingProduct = await Product.findOne({
      name: req.body.name,
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
      batchNumber: req.body.batchNumber || "",
    });

    const files = req.files?.length ? req.files : [];
    const attachments = [];

    for (const file of files) {
      if (
        !file.mimetype.startsWith("image") &&
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/jpeg"
      ) {
        continue;
      }

      const result = await uploadToImageKit(file, "products");

      const attachment = await Attachment.create({
        type: "product_image",
        fileUrl: result.url,
        fileId: result.fileId,
        ownerCompany: companyId,
        product: product._id,
        relatedTo: "Product",
        uploadedBy: req.user._id,
        status: "approved",
      });

      attachments.push(attachment);
    }

    res.status(201).json({
      status: "success",
      data: {
        product,
        attachments,
      },
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to create product", 500));
  }
};
