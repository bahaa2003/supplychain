import express from "express";
import { getAllInventory } from "../controllers/inventory/getAllInventory.controller.js";
import { updateInventory } from "../controllers/inventory/updateInventory.controller.js";
import { getInventoryById } from "../controllers/inventory/getInventoryById.controller.js";
import { catchError } from "../utils/catchError.js";
import { allowedTo } from "../middlewares/auth.middleware.js";
import { updateInventoryValidator } from "../validators/inventory.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.get(
  "/",
  allowedTo("admin", "manager", "staff"),
  catchError(getAllInventory)
);

router
  .route("/:inventryId")
  .get(allowedTo("admin", "manager", "staff"), catchError(getInventoryById))
  .patch(
    allowedTo("admin", "manager"),
    validate(updateInventoryValidator()),
    catchError(updateInventory)
  );

export default router;
