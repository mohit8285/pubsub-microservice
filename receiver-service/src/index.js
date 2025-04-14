// src/index.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const { createClient } = require("redis");
const dotenv = require("dotenv");
const routes = require("./routes");
const logger = require("./utils/logger");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error:", err));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://redis:6379",
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

// Connect to Redis and start server
const startServer = async () => {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis");

    // Make Redis client available application-wide
    app.locals.redisClient = redisClient;

    app.listen(PORT, () => {
      logger.info(`Receiver service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");

  await redisClient.quit();
  mongoose.connection.close();

  process.exit(0);
});
