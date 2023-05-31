const mongoose = require("mongoose");
const userModel = require("../users/userModel");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The comment must belong to a user"],
  },
  description: {
    type: String,
    required: [true, "Please enter a description"],
    lowercase: true,
    trim: true,
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

// Save object id in user comments array

commentSchema.pre("save", async function () {
  const user = await userModel.findById(this.user);
  user.comments.push({ _id: this._id });
  await user.save();
});

// Populate user field

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName",
  });
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
