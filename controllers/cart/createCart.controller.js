import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import AppError from "../../utils/AppError.js";

// إنشاء كارت جديد لشركة (واحد فقط لكل شركة ولكل مورد)
export const createCart = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { supplierId, setAllOrNot = true, items = [] } = req.body;
    if (!supplierId) throw new AppError("supplierId is required", 400);
    // cant repeat supplierId for the same company
    const exists = await Cart.findOne({
      company: companyId,
      supplier: supplierId,
    });
    if (exists)
      throw new AppError(
        "Cart already exists for this company and supplier",
        400
      );
    const cart = await Cart.create({
      company: companyId,
      supplier: supplierId,
      setAllOrNot,
      items,
    });
    res.status(201).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};
