const User = require("./userModel");
const promisify = require("util").promisify;
const jwt = require("jsonwebtoken");
const config = require("../../config");
const email = require("../../email");

const signToken = (id) => {
  return jwt.sign({ id }, config.secret.jwt, {
    expiresIn: config.expireTime,
  });
};

exports.signup = function (req, res) {
  let newUser = new User(req.body);
  newUser
    .save()
    .then((user) => {
      let token = signToken(user._id);
      res
        .cookie("jwt", token, {
          expires: new Date(Date.now() + config.cookieExpireTime),
          httpOnly: true,
          secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        })
        .status(201)
        .json({
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
};

exports.login = function (req, res) {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          status: "fail",
          message: "User not found",
        });
      } else {
        if (!user.authenticate(password)) {
          return res.status(400).json({
            status: "fail",
            message: "Incorrect password",
          });
        } else {
          let token = signToken(user._id);

          res
            .cookie("jwt", token, {
              expires: new Date(Date.now() + config.cookieExpireTime),
              httpOnly: true,
              secure:
                req.secure || req.headers["x-forwarded-proto"] === "https",
            })
            .status(200)
            .json({
              status: "success",
              data: user,
            });
        }
      }
    })
    .catch((err) => {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    });
};

exports.logout = function (req, res) {
  res.clearCookie("jwt").status(200).json({
    status: "success",
    message: "Successfully logged out",
  });
};

exports.protect = async function (req, res, next) {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in",
    });
  }

  let decoded = null;

  try {
    decoded = await promisify(jwt.verify)(token, config.secret.jwt);
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token",
    });
  }

  let user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "User does not exist",
    });
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: "fail",
      message: "User recently changed password. Please log in again",
    });
  }

  req.user = user;
  next();
};

exports.isAdmin = function (req, res, next) {
  if (
    req.user &&
    req.user.permissions &&
    req.user.permissions.description.includes("admin")
  ) {
    next();
  } else {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to perform this action",
    });
  }
};

exports.forgotPassword = async function (req, res) {
  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  try {
    let resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    let resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/user/resetPassword/${resetToken}`;

    let message = `Forgot your password? 
      Submit a PATCH request with your new password to:
      ${resetURL}
      If you didn't forget your password, please ignore this email.`;

    await email({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: "fail",
      message: "Server error",
      err,
    });
  }
};

exports.resetPassword = async function (req, res) {
  let user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or has expired",
    });
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;

  user.resetPasswordExpire = undefined;

  await user.save();

  let token = signToken(user._id);

  res
    .cookie("jwt", token, {
      expires: new Date(Date.now() + config.cookieExpireTime),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    })
    .status(200)
    .json({
      status: "success",
      message: "Password updated successfully",
    });
};

exports.updatePassword = async function (req, res) {
  let user = await User.findById(req.user._id).select("+password");

  if (!(await user.authenticate(req.body.currentPassword))) {
    return res.status(401).json({
      status: "fail",
      message: "Your current password is wrong",
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  let token = signToken(user._id);

  res
    .cookie("jwt", token, {
      expires: new Date(Date.now() + config.cookieExpireTime),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    })
    .status(200)
    .json({
      status: "success",
    });
};

exports.updateMe = async function (req, res) {
  if (req.body.password) {
    return res.status(400).json({
      status: "fail",
      message:
        "This route is not for password updates. Please use /updateMyPassword",
    });
  }

  let filteredBody = filterObj(req.body, "firstName", "lastName", "email");

  let user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: user,
  });
};

exports.deleteMe = async function (req, res) {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
};

function filterObj(obj, ...allowedFields) {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
}
