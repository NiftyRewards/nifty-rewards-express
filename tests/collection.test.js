const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

const CollectionModel = require("../models/Collections.model");
require("dotenv").config();

jest.setTimeout(3000000);

const AZUKI_CONTRACT_ADDRESS = "0xED5AF388653567Af2F388E6224dC7C4b3241C544";
const MERCHANT_ADDRESS = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";

describe("Campaign", () => {
  beforeAll(async () => {
    // Remove all data that was added during tests
    // await CollectionModel.deleteMany({});
  });

  afterAll(async () => {
    // Remove all data that was added during tests
    // await CampaignsModel.deleteMany({});

    // Close DB Collection
    // await app.db.connection.close();
    mongoose.connection.close();

    // Close Express Server
    app.server.close();
  });

  test("Cache Campaign", async () => {
    const response = await request(app)
      .post("/api/v1/collection/cache")
      .set("Content-Type", "application/json")
      .send({
        collectionAddress: AZUKI_CONTRACT_ADDRESS,
        chainId: "1",
      });

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("Collection Cached");
  });
});
