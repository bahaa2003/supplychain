import express from "express";
import { protectedRoute, allowedTo } from "../middleware/auth.middleware.js";
import { roleEnum } from "../enums/role.enum.js";
import { createPartnerConnection } from "../controllers/partnerConnection/createPartnerConnection.js";
import { getAllPartnerConnections } from "../controllers/partnerConnection/getAllPartnerConnections.js";
import { getPartnerConnectionById } from "../controllers/partnerConnection/getPartnerConnectionById.js";
import { updatePartnerConnectionStatus } from "../controllers/partnerConnection/updatePartnerConnectionStatus.js";
import { deletePartnerConnection } from "../controllers/partnerConnection/deletePartnerConnection.js";

const router = express.Router();

// Create a new partner connection (request partnership)
router.post(
  "/",
  protectedRoute,
  allowedTo("admin", "manager"),
  createPartnerConnection
);

// Get all partner connections for the current user's company
router.get(
  "/",
  protectedRoute,
  allowedTo(...roleEnum),
  getAllPartnerConnections
);

// Get a specific partner connection by ID
router.get(
  "/:id",
  protectedRoute,
  allowedTo(...roleEnum),
  getPartnerConnectionById
);

// Update status (accept/reject) of a partner connection
router.patch(
  "/:id/status",
  protectedRoute,
  allowedTo("admin", "manager"),
  updatePartnerConnectionStatus
);

// Delete a partner connection (cancel or remove partnership)
router.delete(
  "/:id",
  protectedRoute,
  allowedTo("admin", "manager"),
  deletePartnerConnection
);

export default router;
