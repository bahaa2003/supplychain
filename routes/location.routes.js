import express from "express";
import { deleteLocation } from "../controllers/location/deleteLocation.controller.js";
import { updateLocation } from "../controllers/location/updateLocation.controller.js";
import { createLocation } from "../controllers/location/createLocation.controller.js";
import { getLocationById } from "../controllers/location/getLocationById.controller.js";
import { getAllLocations } from "../controllers/location/getAllLocations.controller.js";
import { catchError } from "../utils/catchError.js";
import { allowedTo } from "../middlewares/auth.middleware.js";
import { locationValidator } from "../validators/location.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

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
