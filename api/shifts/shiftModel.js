const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please enter a title"],
    unique: [true, "Title already exists"],
    lowercase: true,
    trim: true,
  },
  start: {
    type: Date,
    required: [true, "Please enter a start time"],
  },
  end: {
    type: Date,
    required: [true, "Please enter a end time"],
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  wage: {
    type: Number,
    required: [true, "Please enter a wage / hour"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The shift must belong to a user"],
  },
  location: {
    type: String,
    required: [true, "Please enter a location"],
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter a description"],
    lowercase: true,
    trim: true,
  },
});

shiftSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName",
  });
  next();
});

module.exports = mongoose.model("Shift", shiftSchema);
