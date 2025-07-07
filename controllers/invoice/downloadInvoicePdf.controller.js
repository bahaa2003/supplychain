import Invoice from "../../models/Invoice.schema.js";
import createInvoicePdf from "../../services/invoice.service.js";
import { AppError } from "../../utils/AppError.js";

export const downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await Invoice.findById(invoiceId).populate(
      "issuer receiver createdBy items.product"
    );
    if (!invoice) {
      return next(new AppError("Invoice not found", 404));
    }
    const pdfBuffer = createInvoicePdf(invoice);
    if (!pdfBuffer) {
      return next(new AppError("Failed to generate PDF", 500));
    }
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${invoice.invoiceNumber}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
