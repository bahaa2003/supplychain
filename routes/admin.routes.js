import express from "express";
import { getAllCompanies } from "../controllers/company/getAllCompanies.controller.js";
import { approveCompany } from "../controllers/company/approveCompany.controller.js";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.use(protectedRoute, allowedTo("platform_admin"));

router.get("/companies", catchError(getAllCompanies));
router.patch("/approve-company/:id", catchError(approveCompany));

export default router;
