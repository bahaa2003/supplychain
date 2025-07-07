import Invoice from "../../models/Invoice.schema.js";
import { AppError } from "../../utils/AppError.js";

export const getSingleInvoice = async (req, res, next) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId).populate(
    "issuer receiver createdBy relatedOrder items.product"
  );

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    message: "Invoice details loaded",
    invoice,
  });
};
