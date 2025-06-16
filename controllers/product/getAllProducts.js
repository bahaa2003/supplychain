import Product from "../../models/Product.js";
import Attachment from "../../models/Attachment.js";
import { AppError } from "../../utils/AppError.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ company: companyId }, { __v: false })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ company: companyId }),
    ]);

    const productIds = products.map(p => p._id);

    const attachments = await Attachment.find(
      {
        product: { $in: productIds },
        type: "product_image",
      },
      { product: 1, fileUrl: 1 }
    ).lean();

    const imagesMap = {};
    attachments.forEach(att => {
      const pid = att.product.toString();
      if (!imagesMap[pid]) imagesMap[pid] = [];
      imagesMap[pid].push(att.fileUrl);
    });

    for (const product of products) {
      product.images = imagesMap[product._id.toString()] || [];
    }

    res.status(200).json({
      status: "success",
      results: products.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch products", 500));
  }
};
