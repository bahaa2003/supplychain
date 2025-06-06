import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPartnerConnectionValidator,
  updatePartnerConnectionStatusValidator,
} from "../validators/partnerConnection.validator.js";
import {
  createPartnerConnectionController,
  updatePartnerConnectionStatusController,
  updatePartnerConnectionVisibilityController,
  terminatePartnerConnectionController,
} from "../controllers/partnerConnection/index.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Create partner connection
router.post(
  "/",
  restrictTo("admin", "platform_admin"),
  validate(createPartnerConnectionValidator()),
  createPartnerConnectionController
);

// Update partner connection status
router.patch(
  "/:connectionId/status",
  restrictTo("admin", "platform_admin"),
  validate(updatePartnerConnectionStatusValidator()),
  updatePartnerConnectionStatusController
);

// Update partner connection visibility settings
router.patch(
  "/:connectionId/visibility",
  restrictTo("admin", "platform_admin"),
  updatePartnerConnectionVisibilityController
);

// Terminate partner connection
router.post(
  "/:connectionId/terminate",
  restrictTo("admin", "platform_admin"),
  terminatePartnerConnectionController
);

export default router;
