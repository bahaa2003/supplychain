import express from "express";
import { get_all_employee } from "../controllers/users/users.controller.js";
import { catchError } from "../utils/catchError.js";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protectedRoute);

router.get(
  "/get-all-employee",
  allowedTo("admin"),
  catchError(get_all_employee)
);

export default router;
