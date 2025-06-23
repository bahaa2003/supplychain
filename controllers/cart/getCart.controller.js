import Cart from "../../models/Cart.js";
import AppError from "../../utils/AppError.js";

// جلب كارت الشركة الحالي فقط
export const getCart = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const cart = await Cart.findOne({ company: companyId }).populate("items.product");
    if (!cart) throw new AppError("Cart not found for this company", 404);
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};
