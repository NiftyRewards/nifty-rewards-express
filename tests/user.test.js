const app = require("../server");

require("dotenv").config();

describe("User", () => {
  beforeAll(async () => {});

  afterAll(async () => {
    // Close Express Server
    app.server.close();

    // Remove all data that was added during tests

    // Close DB Collection
    await app.db.connection.close();
  });

  test("Bind Account", () => {
    const response = request(app).get("/api/v1/user/bind");

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Get NFTS", () => {
    const response = request(app).get("/api/v1/user/nfts");

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });
});
