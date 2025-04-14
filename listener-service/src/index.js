// src/index.js
const mongoose = require("mongoose");
const { createClient } = require("redis");
const dotenv = require("dotenv");
const UserDataCopy = require("./models/userDataCopy");
const logger = require("./utils/logger");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("Listener service connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error:", err));

// Initialize Redis subscriber client
const subscriber = createClient({
  url: process.env.REDIS_URI || "redis://redis:6379",
});

subscriber.on("error", (err) => logger.error("Redis Client Error", err));

// Function to process received data
async function processUserData(message) {
  try {
    const userData = JSON.parse(message);

    // Add the modified_at timestamp
    const userDataCopy = {
      ...userData,
      modified_at: new Date(),
    };

    // Save to the second collection
    const newUserDataCopy = new UserDataCopy(userDataCopy);
    await newUserDataCopy.save();

    logger.info(`Data copied to second collection with ID: ${userData.id}`);
  } catch (err) {
    logger.error("Error processing user data:", err);
  }
}

// Start the subscriber
async function startSubscriber() {
  try {
    await subscriber.connect();
    logger.info("Listener connected to Redis");

    await subscriber.subscribe("user-data-channel", (message) => {
      processUserData(message);
    });

    logger.info("Subscribed to user-data-channel");
  } catch (error) {
    logger.error("Failed to connect or subscribe:", error);
    process.exit(1);
  }
}

startSubscriber();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");

  await subscriber.quit();
  mongoose.connection.close();

  process.exit(0);
});
