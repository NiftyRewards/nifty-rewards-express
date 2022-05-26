const app = require("../server");

require("dotenv").config();

describe("Reward", () => {
  beforeAll(async () => {});

  afterAll(async () => {
    // Close Express Server
    app.server.close();

    // Remove all data that was added during tests

    // Close DB Collection
    await app.db.connection.close();
  });

  test("Get Rewards", () => {
    const response = request(app).get("/api/v1/reward");

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Get Filtered By Address", () => {
    const ADDRESS = ""; //TODO
    const response = request(app).get(`/api/v1/reward?address=${ADDRESS}`);

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Redeem Reward", () => {
    const response = request(app).put(`/api/v1/reward/redeem/${REWARD_ID}`);

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });
});
