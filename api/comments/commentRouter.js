const express = require("express");
const router = express.Router();
const commentController = require("./commentController");
const authController = require("../users/authController");

router.get(
  "/",
  authController.protect,
  authController.isAdmin,
  commentController.getAllComments
);
router.post("/", authController.protect, commentController.createComment);
router.get("/:id", authController.protect, commentController.getComment);
router.patch("/:id", authController.protect, commentController.updateComment);
router.delete(
  "/:id",
  authController.protect,
  authController.isAdmin,
  commentController.deleteComment
);
router.get(
  "/user/:id",
  authController.protect,
  commentController.getCommentsByUser
);

module.exports = router;
