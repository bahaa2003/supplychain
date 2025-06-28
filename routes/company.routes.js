import express from "express";
import { getAllCompanies } from "../controllers/company/getAllCompanies.controller.js";
import { approveCompany } from "../controllers/company/approveCompany.controller.js";
import { allowedTo } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.get(
  "/",
  allowedTo("admin", "manager", "staff", "platform_admin"),
  catchError(getAllCompanies)
);
router.patch(
  "/approve-company/:id",
  allowedTo("platform_admin"),
  catchError(approveCompany)
);

export default router;
