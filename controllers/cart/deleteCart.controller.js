import Cart from "../../models/Cart.js";

// حذف كارت الشركة الحالي فقط
export const deleteCart = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    await Cart.deleteOne({ company: companyId });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
