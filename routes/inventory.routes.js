import express from "express";
import { getAllInventory } from "../controllers/inventory/getAllInventory.controller.js";
// import { deleteInventory } from "../controllers/inventory/deleteInventory.controller.js";
import { updateInventory } from "../controllers/inventory/updateInventory.controller.js";
import { getInventoryById } from "../controllers/inventory/getInventoryById.controller.js";
import { catchError } from "../utils/catchError.js";
import { allowedTo } from "../middleware/auth.middleware.js";
import { updateInventoryValidator } from "../validators/inventory.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/",
  allowedTo("admin", "manager", "staff"),
  catchError(getAllInventory)
);

router
  .get(
    "/:id",
    allowedTo("admin", "manager", "staff"),
    catchError(getInventoryById)
  )
  .patch(
    "/:id",
    allowedTo("admin", "manager"),
    validate(updateInventoryValidator()),
    catchError(updateInventory)
  );
// .delete("/:id", allowedTo("admin"), catchError(deleteInventory));

export default router;
