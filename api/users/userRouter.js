const express = require("express");
const router = express.Router();
const userController = require("./userController");
const authController = require("./authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.patch("/updateMe", authController.protect, authController.updateMe);
router.patch("/deleteMe", authController.protect, authController.deleteMe);

router.get(
  "/",
  authController.protect,
  authController.isAdmin,
  userController.getAllUsers
);
router.post(
  "/",
  authController.protect,
  authController.isAdmin,
  userController.createUser
);
router.get("/:id", authController.protect, userController.getUserById);
router.patch("/:id", authController.protect, userController.updateUserById);
router.delete(
  "/:id",
  authController.protect,
  authController.isAdmin,
  userController.deleteUser
);

module.exports = router;
