import express from "express";
import { allowedTo, protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPartnerConnectionValidator,
  updatePartnerConnectionStatusValidator,
} from "../validators/partnerConnection.validator.js";
import createPartnerConnection from "../controllers/partnerConnection/createPartnerconnction.controller.js";
import getAllPartnerConnections from "../controllers/partnerConnection/getAllPartnerConnections.controller.js";
import getPartnerConnectionById from "../controllers/partnerConnection/getPartnerConnectionById.controller.js";
import updatePartnerConnection from "../controllers/partnerConnection/updatePartnerConnection.controller.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Create partner connection
router.post(
  "/",
  allowedTo("admin"),
  validate(createPartnerConnectionValidator()),
  createPartnerConnection
);

// Update partner connection status
router.patch(
  "/:connectionId/",
  allowedTo("admin"),
  validate(updatePartnerConnectionStatusValidator()),
  updatePartnerConnection
);

router.get("/", allowedTo("admin"), getAllPartnerConnections);
// Get partner connection by ID
router.get("/:connectionId", allowedTo("admin"), getPartnerConnectionById);
export default router;
