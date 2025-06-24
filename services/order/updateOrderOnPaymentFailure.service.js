import Order from "../../models/Order.js";

/**
 * Handles the logic for a failed payment.
 * Updates order status to 'Failed'.
 * @param {string} stripePaymentIntentId - The payment intent ID from Stripe.
 * @returns {Promise<void>}
 */
export default async function updateOrderOnPaymentFailure(
  stripePaymentIntentId
) {
  try {
    const order = await Order.findOne({ stripePaymentIntentId });
    if (!order) {
      console.error(
        "Order not found for failed payment intent:",
        stripePaymentIntentId
      );
      return;
    }

    // Don't update if it's already been successfully processed
    if (order.paymentStatus === "Paid") {
      console.log(
        `Order ${order._id} was already paid, ignoring payment failure event.`
      );
      return;
    }

    order.status = "Failed"; // A new status might be needed, e.g., in enums
    order.paymentStatus = "Failed";
    await order.save();

    console.log(`Updated order ${order._id} to Failed due to payment failure.`);
  } catch (error) {
    console.error("Error processing failed payment:", error);
    throw error;
  }
}
