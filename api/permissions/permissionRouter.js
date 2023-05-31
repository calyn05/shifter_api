const express = require("express");
const router = express.Router();
const authController = require("../users/authController");
const permissionController = require("./permissionController");

router.get(
  "/",
  authController.protect,
  authController.isAdmin,
  permissionController.getAllPermissions
);

module.exports = router;
