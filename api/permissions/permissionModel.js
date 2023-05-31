const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  description: {
    type: String,
    required: [true, "Please enter a description"],
    lowercase: true,
    trim: true,
  },
});

module.exports = mongoose.model("Permission", permissionSchema);
