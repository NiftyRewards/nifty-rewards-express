const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

const RewardsModel = require("../models/Rewards.model");
const CampaignsModel = require("../models/Campaigns.model");
const UsersModel = require("../models/Users.model");
const randomstring = require("randomstring");

const AZUKI_CONTRACT_ADDRESS = "0xED5AF388653567Af2F388E6224dC7C4b3241C544";
// const CAMPAIGN_ID = "6292c999356b5485c892eb2f";
const CAMPAIGN_ID = new mongoose.mongo.ObjectId("6292c999356b5485c892eb2f");
const MERCHANT_ID = new mongoose.mongo.ObjectId("56cb91bdc3464f14678934ca");
const COLLECTION_IDENTIFIERS = [
  "1-0x75E9Abc7E69fc46177d2F3538C0B92d89054eC91",
  "1-0x165a2eD732eb15B54b5E8C057CbcE6251370D6e8",
];

const USER_ADDRESS = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";
const TESTER_ADDRESS = "0x0103a4966daba5a947df52b0B892d8b3fdEF5A4F";

const TOKEN_ID = 7121;

describe("Reward", () => {
  beforeAll(async () => {
    // Remove all data that was added during tests
    // await MerchantsModel.deleteMany({});
    await CampaignsModel.findOneAndUpdate(
      { _id: CAMPAIGN_ID },
      {
        $set: {
          merchant_id: MERCHANT_ID,
          collectionIdentifiers: COLLECTION_IDENTIFIERS,
          title: "Test Campaign",
          description: "Test Description",
          start_date: "2022-01-01",
          end_date: "2022-12-01",
          status: "active",
        },
      },
      { upsert: true }
    );
    // No longer create rewards for individual tokens (FCFS)
    // Create Rewards (Multiple)
    let codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(randomstring.generate(6));
    }
    await RewardsModel.findOneAndUpdate(
      {
        campaignId: CAMPAIGN_ID,
      },
      {
        $set: {
          campaignId: CAMPAIGN_ID,
          availableCodes: codes,
        },
      },
      { upsert: true }
    );

    await UsersModel.findOneAndUpdate(
      { address: USER_ADDRESS },
      {
        $set: {
          address: USER_ADDRESS,
          boundedAddresses: [{ address: TESTER_ADDRESS, chain: "1" }],
          accountType: "basic",
          nftsCache: [],
          cacheLastUpdated: "2022-01-01",
        },
      },
      { upsert: true }
    );
  });

  afterAll(async () => {
    // Remove all data that was added during tests
    // await CampaignsModel.deleteMany({});

    // await CampaignsModel.findOneAndUpdate(
    //   { _id: CAMPAIGN_ID },
    //   {
    //     $set: {
    //       merchant_id: MERCHANT_ID,
    //       collectionIdentifier: COLLECTION_IDENTIFIER,
    //       title: "Test Campaign",
    //       description: "Test Description",
    //       start_date: "2022-01-01",
    //       end_date: "2022-06-01",
    //     },
    //   },
    //   { upsert: true }
    // );

    // await RewardsModel.findOneAndUpdate(
    //   {
    //     collectionIdentifier: COLLECTION_IDENTIFIER,
    //     collection_address: AZUKI_CONTRACT_ADDRESS,
    //     chain: "1",
    //     campaign_id: CAMPAIGN_ID,
    //     token_id: TOKEN_ID,
    //   },
    //   {
    //     $set: {
    //       quantity: 1,
    //       quantity_used: 0,
    //     },
    //   },
    //   { upsert: true }
    // );

    // Close DB Collection
    // await app.db.connection.close();
    mongoose.connection.close();

    // Close Express Server
    app.server.close();
  });

  // test("Get Rewards", async () => {
  //   const response = await request(app).get("/api/v1/reward");

  //   expect(response.status).toEqual(200);
  //   expect(response.body.data.message).toEqual("TODO");
  // });

  // test("Get Filtered By Address", async () => {
  //   const ADDRESS = ""; //TODO
  //   const response = await request(app).get(
  //     `/api/v1/reward?address=${ADDRESS}`
  //   );

  //   expect(response.status).toEqual(200);
  //   expect(response.body.data.message).toEqual("TODO");
  // });

  test("Redeem Reward", async () => {
    const response = await request(app).put(`/api/v1/reward/redeem`).send({
      userAddress: USER_ADDRESS,
      campaignId: CAMPAIGN_ID,
      tokenId: TOKEN_ID,
    });
    console.log("🚀 | response | response", response._body);

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("Reward redeemed");
  });
});
