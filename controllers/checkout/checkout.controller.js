import validateCartService from "../../services/checkout/validateCart.service.js";
import createPaymentIntentService from "../../services/checkout/createPaymentIntent.service.js";
import { AppError } from "../../utils/AppError.js";

export const validateCartForCheckout = async (req, res, next) => {
  const buyerCompanyId = req.user.companyId;
  const { cartId } = req.body;

  if (!cartId) {
    return next(new AppError("Cart ID is required", 400));
  }

  try {
    const validationResult = await validateCartService({
      cartId,
      buyerCompanyId,
    });

    if (!validationResult.isValid) {
      return res
        .status(409) // 409 Conflict
        .json({
          status: "error",
          message: "Cart has issues that need to be resolved before checkout.",
          data: validationResult,
        });
    }

    return res.status(200).json({
      status: "success",
      message: "Cart is valid and ready for checkout.",
      data: validationResult,
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to validate cart", 500));
  }
};

export const createPaymentIntent = async (req, res, next) => {
  const buyerCompanyId = req.user.companyId;
  const buyerUserId = req.user._id; // Assuming user ID is also in req.user
  const { cartId } = req.body;

  if (!cartId) {
    return next(new AppError("Cart ID is required", 400));
  }

  try {
    const { clientSecret, orderId } = await createPaymentIntentService({
      cartId,
      buyerCompanyId,
      buyerUserId,
    });
    return res.status(200).json({
      status: "success",
      message: "Payment Intent created successfully.",
      data: { clientSecret, orderId },
    });
  } catch (error) {
    return next(
      new AppError(error.message || "Failed to create Payment Intent", 500)
    );
  }
};
