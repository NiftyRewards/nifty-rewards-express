const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

const MerchantsModel = require("../models/Merchants.model");

require("dotenv").config();

jest.setTimeout(30000);

const AZUKI_CONTRACT_ADDRESS = "0xED5AF388653567Af2F388E6224dC7C4b3241C544";
const MERCHANT_ADDRESS = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";
describe("Merchant", () => {
  beforeAll(async () => {
    // Remove all data that was added during tests
    await MerchantsModel.deleteMany({});
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

  test("Create Merchant", async () => {
    const response = await request(app)
      .post("/api/v1/merchant/create")
      .set("Content-Type", "application/json")
      .send({
        merchantAddress: MERCHANT_ADDRESS,
        name: "Nike",
        description: "Sell Shoes",
      }); // TODO

    expect(response.status).toEqual(201);
    expect(response._body.message).toEqual("Merchant Created");
  });

  // test("Get Campaign", async () => {
  //   const response = await request(app).get(`/api/v1/campaign/${CAMPAIGN_ID}`);

  //   expect(response.status).toEqual(200);
  //   expect(response.body.data.message).toEqual("TODO");
  // });

  // test("Get Invalid Campaign", async () => {
  //   const response = await request(app).get(
  //     `/api/v1/campaign/${CAMPAIGN_ID_ERROR}`
  //   );

  //   expect(response.status).toEqual(400);
  //   expect(response.body.data.message).toEqual("TODO");
  // });

  // test("Edit Campaign", async () => {
  //   const response = await request(app)
  //     .put(`/api/v1/campaign/${CAMPAIGN_ID}/edit`)
  //     .set("Content-Type", "application/json")
  //     .send({}); // TODO;
  //   expect(response.status).toEqual(201);
  //   expect(response.body.data.message).toEqual("TODO");
  // });

  // test("Should approve campaign", async () => {
  //   const response = await request(app)
  //     .put("/api/v1/campaign/approve")
  //     .set("Content-Type", "application/json")
  //     .send({}); // TODO

  //   expect(response.status).toEqual(201);
  //   expect(response.body.data.message).toEqual("TODO");
  // });

  // test("Should not approve campaign that does not exist", async () => {
  //   const response = await request(app)
  //     .put("/api/v1/campaign/approve")
  //     .set("Content-Type", "application/json")
  //     .send({}); // TODO

  //   expect(response.status).toEqual(400);
  //   expect(response.body.data.message).toEqual("TODO");
  // });
});
