const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require("./api/users/userRouter");
const shiftRouter = require("./api/shifts/shiftRouter");
const permissionRouter = require("./api/permissions/permissionRouter");
const commentRouter = require("./api/comments/commentRouter");
const config = require("./config");

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/shifts", shiftRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/comments", commentRouter);

const PORT = config.port;

const db = config.getDbConnectionString();

const OPT = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(db, OPT)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
