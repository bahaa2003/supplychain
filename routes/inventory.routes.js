import express from "express";
import { getAllInventory } from "../controllers/inventory/getAllInventory.controller.js";
import { deleteInventory } from "../controllers/inventory/deleteInventory.controller.js";
import { updateInventory } from "../controllers/inventory/updateInventory.controller.js";
import { createInventory } from "../controllers/inventory/createInventory.controller.js";
import { getInventoryById } from "../controllers/inventory/getInventoryById.controller.js";
import { catchError } from "../utils/catchError.js";
import { protectedRoute, allowedTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectedRoute);

router.get(
  "/",
  allowedTo("admin", "manager", "staff"),
  catchError(getAllInventory)
);
router.get(
  "/:id",
  allowedTo("admin", "manager", "staff"),
  catchError(getInventoryById)
);
router.post("/", allowedTo("admin", "manager"), catchError(createInventory));
router.patch(
  "/:id",
  allowedTo("admin", "manager"),
  catchError(updateInventory)
);
router.delete("/:id", allowedTo("admin"), catchError(deleteInventory));

export default router;
