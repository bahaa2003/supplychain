import express from "express";
import { getCompanyKPIs } from "../controllers/analytics/kpi.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.get("/kpis", protectedRoute, catchError(getCompanyKPIs));

export default router;
