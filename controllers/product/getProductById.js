import Product from "../../models/Product.js";
import Attachment from "../../models/Attachment.js";
import { AppError } from "../../utils/AppError.js";

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;

    const product = await Product.findOne({ _id: id, company: companyId }).lean();
    if (!product) return next(new AppError("Product not found", 404));

    const images = await Attachment.find(
      { product: product._id, type: "product_image" },
      { fileUrl: 1, _id: 0 }
    );

    product.images = images.map((img) => img.fileUrl);

    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "Failed to get product", 500));
  }
};
