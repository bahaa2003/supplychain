import express from "express";
import { getPendingCompanies } from "../controllers/admin/getPendingCompanies.controller.js";
import { approveCompany } from "../controllers/admin/approveCompany.controller.js";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.use(protectedRoute, allowedTo("platform_admin"));

router.get("/pending-companies", catchError(getPendingCompanies));
router.patch("/approve-company/:id", catchError(approveCompany));

export default router;
