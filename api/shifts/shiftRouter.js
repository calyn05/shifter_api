const express = require("express");
const router = express.Router();
const shiftController = require("./shiftController");
const authController = require("../users/authController");

router.get(
  "/",
  authController.protect,
  authController.isAdmin,
  shiftController.getAllShifts
);
router.post("/", authController.protect, shiftController.addShift);
router.get("/:id", authController.protect, shiftController.getShiftById);
router.patch("/:id", authController.protect, shiftController.updateShiftById);
router.delete(
  "/:id",
  authController.protect,
  authController.isAdmin,
  shiftController.deleteShiftById
);
router.get(
  "/user/:id",
  authController.protect,
  authController.isAdmin,
  shiftController.getShiftsByUserId
);
router.get(
  "/location/:location",
  authController.protect,
  shiftController.getShiftsByLocation
);
router.get(
  "/date/:date",
  authController.protect,
  shiftController.getShiftsByDate
);
router.get(
  "/date/:start/:end",
  authController.protect,
  shiftController.getShiftsBetweenDates
);

module.exports = router;
