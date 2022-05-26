const app = require("../server");

require("dotenv").config();

describe("Merchant", () => {
  beforeAll(async () => {});

  afterAll(async () => {
    // Close Express Server
    app.server.close();

    // Remove all data that was added during tests

    // Close DB Collection
    await app.db.connection.close();
  });

  test("Start Campaign", () => {
    const response = request(app)
      .post("/api/v1/campaign/start")
      .set("Content-Type", "application/json")
      .send({}); // TODO

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Get Campaign", () => {
    const response = request(app).get(`/api/v1/campaign/${CAMPAIGN_ID}`);

    expect(response.status).toEqual(200);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Get Invalid Campaign", () => {
    const response = request(app).get(`/api/v1/campaign/${CAMPAIGN_ID_ERROR}`);

    expect(response.status).toEqual(400);
    expect(response.body.data.message).toEqual("TODO");
  });

  test("Edit Campaign", () => {
    const response = request(app)
      .put(`/api/v1/campaign/${CAMPAIGN_ID}/edit`)
      .set("Content-Type", "application/json")
      .send({}); // TODO;
    expect(response.status).toEqual(201);
    expect(response.body.data.message).toEqual("TODO");
  });
});
