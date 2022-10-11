const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

const CampaignsModel = require("../models/Campaigns.model");
const RewardsModel = require("../models/Rewards.model");

require("dotenv").config();

jest.setTimeout(30000);

const AZUKI_CONTRACT_ADDRESS = "0xED5AF388653567Af2F388E6224dC7C4b3241C544";

const TEST_CONTRACT_1 = "0x75E9Abc7E69fc46177d2F3538C0B92d89054eC91"; // Test 1
const TEST_CONTRACT_2 = "0x165a2eD732eb15B54b5E8C057CbcE6251370D6e8"; // Test 2
const MERCHANT_ADDRESS = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";

describe("Campaign", () => {
  beforeAll(async () => {
    // Remove all data that was added during tests
    await CampaignsModel.deleteMany({});
    await RewardsModel.deleteMany({});
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

  test("Start Campaign", async () => {
    let rewardData = {};

    const response = await request(app)
      .post("/api/v1/campaign/start")
      .set("Content-Type", "application/json")
      .send({
        merchantAddress: MERCHANT_ADDRESS,
        collectionAddresses: [TEST_CONTRACT_1, TEST_CONTRACT_2],
        chainIds: ["1", "1"],
        title: "NIKE",
        description: "Mike Campaign",
        company: "Nike",
        companyLogoUrl:
          "https://static.nike.com/a/images/f_jpg,q_auto:eco/61b4738b-e1e1-4786-8f6c-26aa0008e80b/swoosh-logo-black.png",
        offer: "10% Off footwear",
        description: "10% off when you purchase any footwear on nike.com!",
        bgUrl:
          "https://static.nike.com/a/images/f_jpg,q_auto:eco/61b4738b-e1e1-4786-8f6c-26aa0008e80b/swoosh-logo-black.png",
        tnc: [
          "Limited to 1 redemption per user. Limited redemptions available for the period",
          "Promo is valid from now until 30th June 2022 or redemption lasts, whichever is sooner",
          "Applicable only for in-store purchases",
          "Other Nike T&Cs apply",
        ],
        startDate: "2022-01-01",
        endDate: "2022-12-01",
        redemptionCount: "100",
      }); // TODO
    console.log("🚀 | test | response", response._body);

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("Campaign started");
  });

  test("Get All Campaigns", async () => {
    const response = await request(app).get(`/api/v1/campaign`);
    console.log("🚀 | test | response", response._body);

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("Campaigns Retrieved");
  });

  test("Get Campaigns by Merchant Id", async () => {
    const MERCHANT_ID = "629325c7152f41547aaab5fa";

    const response = await request(app).get(
      `/api/v1/campaign?campaignId=${MERCHANT_ID}`
    );
    console.log("🚀 | test | response", response._body);

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("Campaigns Retrieved");
  });

  test("Get Invalid Campaign", async () => {
    const response = await request(app).get(
      `/api/v1/campaign/${CAMPAIGN_ID_ERROR}`
    );

    expect(response.status).toEqual(400);
    expect(response._body.message).toEqual("Invalid Request");
  });

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
