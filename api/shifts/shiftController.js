const Shift = require("./shiftModel");

exports.getAllShifts = async function (req, res) {
  let queryObj = { ...req.query };
  let excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  queryObj = JSON.parse(queryStr);

  let sort = "";
  let selected = "";

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    sort = sortBy;
  }

  if (req.query.fields) {
    const selectBy = req.query.fields.split(",").join(" ");
    selected = selectBy;
  }

  let limit = req.query.limit * 1 || 100;
  let page = req.query.page * 1 || 1;
  let skip = (page - 1) * limit;

  let total = await Shift.countDocuments();

  if (skip >= total) {
    res.status(404).json({
      status: "fail",
      message: "Page not found",
    });
    return;
  }

  Shift.find(queryObj)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .select(selected)
    .then((shifts) => {
      res.status(200).json({
        status: "success",
        results: shifts.length,
        data: shifts,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getShiftById = function (req, res) {
  Shift.findById(req.params.id)
    .then((shift) => {
      res.status(200).json({
        status: "success",
        data: shift,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.deleteShiftById = function (req, res) {
  Shift.findByIdAndDelete(req.params.id)
    .then((shift) => {
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
};

exports.updateShiftById = function (req, res) {
  const updatedShift = req.body;
  const id = req.params.id;

  Shift.findByIdAndUpdate(id, updatedShift, { new: true, runValidators: true })
    .then((shift) => {
      res.status(200).json({
        status: "success",
        data: shift,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.addShift = function (req, res) {
  const newShift = req.body;

  Shift.create(newShift)
    .then((shift) => {
      res.status(201).json({
        status: "success",
        data: shift,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getShiftsByUserId = function (req, res) {
  Shift.find({ user: req.params.id })
    .then((shifts) => {
      res.status(200).json({
        status: "success",
        data: shifts,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getShiftsByLocation = function (req, res) {
  Shift.find({ location: req.params.location })
    .then((shifts) => {
      res.status(200).json({
        status: "success",
        data: shifts,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getShiftsByDate = function (req, res) {
  let date = new Date(req.params.date).toISOString().slice(0, 10);

  Shift.find({})
    .then((shifts) => {
      shifts = shifts.filter((shift) => {
        return shift.start.toISOString().slice(0, 10) === date;
      });
      res.status(200).json({
        status: "success",
        data: shifts,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.getShiftsBetweenDates = function (req, res) {
  let start = new Date(req.params.start).toISOString().slice(0, 10);
  let end = new Date(req.params.end).toISOString().slice(0, 10);

  Shift.find({})
    .then((shifts) => {
      shifts = shifts.filter((shift) => {
        return (
          shift.start.toISOString().slice(0, 10) >= start &&
          shift.start.toISOString().slice(0, 10) <= end
        );
      });
      res.status(200).json({
        status: "success",
        data: shifts,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};
