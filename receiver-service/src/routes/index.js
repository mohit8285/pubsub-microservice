// src/routes/index.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const UserData = require("../models/userData");
const { validateUserData } = require("../utils/validator");
const logger = require("../utils/logger");

const router = express.Router();

// POST endpoint to receive user data
router.post("/receiver", async (req, res) => {
  try {
    // Validate incoming data
    const { error, value } = validateUserData(req.body);

    if (error) {
      logger.error("Validation error:", error.details);
      return res.status(400).json({
        status: "error",
        message: "Invalid data",
        details: error.details,
      });
    }

    // Generate UUID and timestamp
    const id = uuidv4();
    const inserted_at = new Date();

    // Create user data object
    const userData = {
      id,
      ...value,
      inserted_at,
    };

    // Save to database
    const newUserData = new UserData(userData);
    await newUserData.save();

    // Publish to Redis for the listener service
    const redisClient = req.app.locals.redisClient;
    await redisClient.publish("user-data-channel", JSON.stringify(userData));

    logger.info(`Data received and published with ID: ${id}`);

    res.status(201).json({
      status: "success",
      data: userData,
    });
  } catch (err) {
    logger.error("Error processing request:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to process request",
    });
  }
});

module.exports = router;
