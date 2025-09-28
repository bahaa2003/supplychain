import express from "express";
import { getAllCompanies } from "../controllers/company/getAllCompanies.controller.js";
import { approveCompany } from "../controllers/company/approveCompany.controller.js";
import { getCompanyById } from "../controllers/company/getCompanyById.controller.js";
import { getMyCompany } from "../controllers/company/getMyCompany.controller.js";
import { roles } from "../enums/role.enum.js";
import { allowedTo } from "../middlewares/auth.middleware.js";

import { catchError } from "../utils/catchError.js";
const router = express.Router();

router.get(
  "/",
  allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF, roles.PLATFORM_ADMIN),
  catchError(getAllCompanies)
);

router.patch(
  "/approve-company/:id",
  allowedTo(roles.PLATFORM_ADMIN),
  catchError(approveCompany)
);

router.get(
  "/:companyId",
  allowedTo(roles.ADMIN, roles.MANAGER, roles.PLATFORM_ADMIN),
  catchError(getCompanyById)
);

router.get(
  "/info/myCompany",
  allowedTo(roles.ADMIN, roles.MANAGER),
  catchError(getMyCompany)
);

export default router;
