import Cart from "../../models/Cart.js";
import AppError from "../../utils/AppError.js";

// تعديل كارت الشركة الحالي فقط
export const updateCart = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const cart = await Cart.findOne({ company: companyId });
    if (!cart) throw new AppError("Cart not found for this company", 404);
    const { setAllOrNot, items } = req.body;
    if (setAllOrNot !== undefined) cart.setAllOrNot = setAllOrNot;
    if (items) cart.items = items;
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};
