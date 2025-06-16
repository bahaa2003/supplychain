import { generateInvoiceFromOrder } from "../controllers/invoice/generateInvoiceFromOrder.controller.js";
import { getCompanyInvoices } from "../controllers/invoice/getCompanyInvoices.controller.js";
import { getSingleInvoice } from "../controllers/invoice/getSingleInvoice.controller.js";
import { downloadInvoicePdf } from "../controllers/invoice/downloadInvoicePdf.controller.js";

import { protectedRoute } from "./../middleware/auth.middleware";

import express from "express";
const router = express.Router();

router.post("/from-order/:orderId", protectedRoute, generateInvoiceFromOrder);
router.get("/", protectedRoute, getCompanyInvoices);
router.get("/:invoiceId", protectedRoute, getSingleInvoice);
router.get("/:invoiceId/pdf", protectedRoute, downloadInvoicePdf);
export default router;
