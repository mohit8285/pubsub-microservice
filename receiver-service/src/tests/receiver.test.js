// src/tests/receiver.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const routes = require("../routes");
const UserData = require("../models/userData");

let mongoServer;
const app = express();
app.use(express.json());
app.use("/api", routes);

// Mock Redis client
const mockRedisClient = {
  publish: jest.fn().mockResolvedValue(true),
};
app.locals.redisClient = mockRedisClient;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserData.deleteMany({});
  jest.clearAllMocks();
});

describe("POST /api/receiver", () => {
  it("should validate and save valid user data", async () => {
    const userData = {
      user: "Harry",
      class: "Comics",
      age: 22,
      email: "harry@potter.com",
    };

    const response = await request(app).post("/api/receiver").send(userData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.user).toBe("Harry");

    // Check that data was saved to database
    const savedUser = await UserData.findOne({ id: response.body.data.id });
    expect(savedUser).not.toBeNull();

    // Check that publish was called
    expect(mockRedisClient.publish).toHaveBeenCalledWith(
      "user-data-channel",
      expect.any(String)
    );
  });

  it("should return 400 for invalid data", async () => {
    const invalidData = {
      user: "Harry",
      class: "Comics",
      // Missing age
      email: "invalid-email", // Invalid email
    };

    const response = await request(app).post("/api/receiver").send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body).toHaveProperty("details");

    // Check that publish was not called
    expect(mockRedisClient.publish).not.toHaveBeenCalled();
  });
});
