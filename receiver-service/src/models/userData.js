// src/models/userData.js
const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  inserted_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserData", userDataSchema);
