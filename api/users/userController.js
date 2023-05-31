const currentUser = require("./userModel");

exports.getAllUsers = async (req, res) => {
  let queryObj = { ...req.query };
  let excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  queryObj = JSON.parse(queryStr);

  let sort = "";
  let selected = "";

  if (req.query.sort) {
    sort = req.query.sort.split(",").join(" ");
  }

  if (req.query.fields) {
    selected = req.query.fields.split(",").join(" ");
  }

  let page = req.query.page * 1 || 1;
  let limit = req.query.limit * 1 || 100;
  let skip = (page - 1) * limit;
  let total = await currentUser.countDocuments();

  if (skip >= total) {
    res.status(404).json({
      status: "fail",
      message: "Page not found",
    });
    return;
  }

  currentUser
    .find(queryObj)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .select(selected)
    .then((users) => {
      res.status(200).json({
        status: "success",
        results: users.length,
        data: users,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.createUser = async (req, res) => {
  try {
    const newUser = req.body;
    const user = await currentUser.create(newUser);
    res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getUserById = (req, res) => {
  let id = req.params.id;
  try {
    currentUser
      .findById(id)
      .populate({
        path: "comments",
        select: "-__v",
      })
      .then((user) => {
        res.status(200).json({
          status: "success",
          data: user,
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: "fail",
          message: err,
        });
      });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateUserById = async (req, res) => {
  let id = req.params.id;
  try {
    currentUser
      .findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .then((user) => {
        res.status(200).json({
          status: "success",
          data: user,
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: "fail",
          message: err,
        });
      });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  let id = req.params.id;
  try {
    currentUser
      .findByIdAndDelete(id)
      .then(() => {
        res.status(200).json({
          status: "success",
          data: null,
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: "fail",
          message: err,
        });
      });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};
