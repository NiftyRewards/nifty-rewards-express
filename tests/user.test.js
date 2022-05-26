const request = require("supertest");
const app = require("../server");

require("dotenv").config();

jest.setTimeout(30000);

describe("User", () => {
  beforeAll(async () => {});

  afterAll(async () => {
    // Close DB Collection
    await app.db.connection.close();

    // Close Express Server
    app.server.close();

    // Remove all data that was added during tests
  });

  test("Bind Account", async () => {
    const response = await request(app).post("/api/v1/user/bind");

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Get NFTS", async () => {
    const response = await request(app).get(
      "/api/v1/user/nfts?address=0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7"
    );

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });
});
