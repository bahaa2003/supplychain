import addToCartService from "../../services/cart/addToCart.service.js";
import getCartsService from "../../services/cart/getCarts.service.js";
import updateCartItemService from "../../services/cart/updateCartItem.service.js";
import removeCartItemService from "../../services/cart/removeCartItem.service.js";
import { AppError } from "../../utils/AppError.js";

export const addToCart = async (req, res, next) => {
  // The buyer's company ID should be available from the authenticated user's session
  // Assuming req.user.companyId exists from a previous middleware
  const buyerCompanyId = req.user.companyId;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return next(new AppError("Product ID and quantity are required", 400));
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    return next(new AppError("Quantity must be a positive number", 400));
  }

  try {
    const cart = await addToCartService({
      buyerCompanyId,
      productId,
      quantity,
    });
    return res.status(200).json({
      status: "success",
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    return next(
      new AppError(error.message || "Failed to add product to cart", 500)
    );
  }
};

export const getCarts = async (req, res, next) => {
  const buyerCompanyId = req.user.companyId;

  try {
    const carts = await getCartsService({ buyerCompanyId });
    return res.status(200).json({
      status: "success",
      message: "Carts retrieved successfully",
      data: carts,
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to retrieve carts", 500));
  }
};

export const updateCartItem = async (req, res, next) => {
  const buyerCompanyId = req.user.companyId;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number" || quantity <= 0) {
    return next(new AppError("Quantity must be a positive number.", 400));
  }

  try {
    const cart = await updateCartItemService({
      buyerCompanyId,
      cartItemId,
      quantity,
    });
    if (!cart) {
      return res.status(200).json({
        status: "success",
        message: "Item updated and cart was removed as it became empty.",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    return next(
      new AppError(error.message || "Failed to update cart item", 500)
    );
  }
};

export const removeCartItem = async (req, res, next) => {
  const buyerCompanyId = req.user.companyId;
  const { cartItemId } = req.params;

  try {
    const cart = await removeCartItemService({ buyerCompanyId, cartItemId });
    if (!cart) {
      return res.status(200).json({
        status: "success",
        message: "Item removed and cart was deleted as it became empty.",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (error) {
    return next(
      new AppError(error.message || "Failed to remove cart item", 500)
    );
  }
};
