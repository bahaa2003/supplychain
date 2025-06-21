import express from "express";
import { deleteLocation } from "../controllers/location/deleteLocation.js";
import { updateLocation } from "../controllers/location/updateLocation.js";
import { createLocation } from "../controllers/location/createLocation.js";
import { getLocationById } from "../controllers/location/getLocationById.js";
import { getAllLocations } from "../controllers/location/getAllLocations.js";
import { catchError } from "../utils/catchError.js";
import { allowedTo } from "../middleware/auth.middleware.js";
import { locationValidator } from "../validators/location.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/",
  allowedTo("admin", "manager", "staff"),
  catchError(getAllLocations)
);
router.get(
  "/:id",
  allowedTo("admin", "manager", "staff"),
  catchError(getLocationById)
);
router.post(
  "/",
  allowedTo("admin", "manager"),
  validate(locationValidator()),
  catchError(createLocation)
);
router.put(
  "/:id",
  allowedTo("admin", "manager"),
  validate(locationValidator()),
  catchError(updateLocation)
);
router.delete("/:id", allowedTo("admin"), catchError(deleteLocation));

export default router;
