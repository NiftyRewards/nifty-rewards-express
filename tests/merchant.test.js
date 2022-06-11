const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

const MerchantsModel = require("../models/Merchants.model");

require("dotenv").config();

jest.setTimeout(30000);

const AZUKI_CONTRACT_ADDRESS = "0xED5AF388653567Af2F388E6224dC7C4b3241C544";
const MERCHANT_ADDRESS = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";

// router.route("/").get(getMerchants);
// router.route("/:merchantAddress").get(getMerchant);
// router.route("/:merchantAddress/edit").put(editMerchant);
// router.route("/create").post(createMerchant);
// router.route("/:merchantAddress/verify").put(verifyMerchant);

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
        address: MERCHANT_ADDRESS,
        name: "Nike",
        description: "Sell Shoes",
      });
    console.log("🚀 | test | response", response._body);

    expect(response.status).toEqual(201);
    expect(response._body.message).toEqual("Merchant Created");
  });

  test("Get Merchants", async () => {
    const response = await request(app).get("/api/v1/merchant");

    expect(response.status).toEqual(200);
    // expect(response._body.message).toEqual("Merchant Created");
  });

  test("Get Merchant", async () => {
    const response = await request(app).get(
      `/api/v1/merchant/${MERCHANT_ADDRESS}`
    );

    expect(response.status).toEqual(200);
    // expect(response._body.message).toEqual("Merchant Created");
  });

  test("Edit Merchant", async () => {
    const response = await request(app)
      .post("/api/v1/merchant/create")
      .set("Content-Type", "application/json")
      .send({
        address: MERCHANT_ADDRESS,
        name: "Nike",
        description: "Sell Shoes",
      }); // TODO

    expect(response.status).toEqual(201);
    expect(response._body.message).toEqual("Merchant Created");
  });

  test("Verify Merchant", async () => {
    const response = await request(app)
      .post("/api/v1/merchant/create")
      .set("Content-Type", "application/json")
      .send({
        address: MERCHANT_ADDRESS,
        name: "Nike",
        description: "Sell Shoes",
      }); // TODO

    expect(response.status).toEqual(201);
    expect(response._body.message).toEqual("Merchant Created");
  });
});
