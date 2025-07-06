import Stripe from "stripe";
import Company from "../../models/Company.js";
import { AppError } from "../../utils/AppError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      throw new AppError("Only admins can upgrade subscription", 403);
    }

    const { priceId } = req.body;
    if (!priceId) {
      throw new AppError("Price ID is required", 400);
    }

    const company = await Company.findById(user.company);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    let stripeCustomerId = company.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: company.companyName,
      });
      stripeCustomerId = customer.id;

      company.subscription.stripeCustomerId = stripeCustomerId;
      await company.save();
    }

   const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  customer: stripeCustomerId,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  success_url: `${process.env.FRONTEND_URL}/subscription-success`,
  cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
  metadata: {
    companyId: company._id.toString(),
  },
  subscription_data: {
    metadata: {
      companyId: company._id.toString(),
    },
  },
});


    res.status(200).json({
      status: "success",
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
};
