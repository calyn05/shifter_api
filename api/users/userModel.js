const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: [true, "Email already exists"],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  firstName: {
    type: String,
    required: [true, "Please enter a first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please enter a last name"],
    trim: true,
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  permissions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission",
    required: [true, "The user must have at least one permission"],
  },

  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Encrypt password using bcrypt

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = bcrypt.genSaltSync(12);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  this.select("-resetPasswordToken -resetPasswordExpire");
  next();
});

// Assign permissions to user

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "permissions",
    select: "-__v",
  });

  next();
});

// Populate comments

userSchema.pre(/^find/, function (next) {
  if (this.getOptions._recursed) {
    return next();
  }
  this.populate({
    path: "comments",
    select: "-__v",
  });
  this.getOptions._recursed = true;
  next();
});

userSchema.methods = {
  authenticate: function (password) {
    return bcrypt.compareSync(password, this.password);
  },

  changedPasswordAfter: function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  },

  createPasswordResetToken: function () {
    let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.resetPasswordToken = "";
    for (let i = 0; i < str.length; i++) {
      let index = Math.floor(Math.random() * str.length);
      this.resetPasswordToken += str[index];
    }
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return this.resetPasswordToken;
  },

  matchPassword: function (enteredPassword) {
    return bcrypt.compareSync(enteredPassword, this.password);
  },

  toJSON: function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
  },
};

module.exports = mongoose.model("User", userSchema);
