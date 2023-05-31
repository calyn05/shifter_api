const Comment = require("./commentModel");
const User = require("../users/userModel");

exports.getAllComments = function (req, res) {
  Comment.find()
    .then((comments) => {
      res.status(200).json({
        status: "success",
        data: comments,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getComment = function (req, res) {
  Comment.findById(req.params.id)
    .then((comment) => {
      res.status(200).json({
        status: "success",
        data: comment,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.createComment = function (req, res) {
  const newComment = req.body;
  Comment.create(newComment)
    .then((comment) => {
      res.status(201).json({
        status: "success",
        data: comment,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "fail",
        message: err,
      });
    });
};

exports.updateComment = function (req, res) {
  let id = req.params.id;
  let updatedComment = req.body;
  let date = new Date();
  updatedComment.updated = date;

  Comment.findByIdAndUpdate(id, updatedComment, {
    new: true,
    runValidators: true,
  })
    .then((comment) => {
      res.status(200).json({
        status: "success",
        data: comment,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.deleteComment = function (req, res) {
  Comment.findByIdAndDelete(req.params.id)
    .then((comment) => {
      res.status(204).json({
        status: "success",
        data: comment,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getCommentsByUser = function (req, res) {
  Comment.find({ user: req.params.id })
    .then((comments) => {
      res.status(200).json({
        status: "success",
        data: comments,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};
