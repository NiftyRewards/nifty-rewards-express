const request = require("supertest");
const app = require("../server");
const ethers = require("ethers");
const User = require("../models/Users.model");
const mongoose = require("mongoose");

require("dotenv").config();

jest.setTimeout(30000);

describe("User", () => {
  beforeAll(async () => {
    // Remove all data that was added during tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Remove all data that was added during tests
    // await User.deleteMany({});

    // Close DB Collection
    // await app.db.connection.close();
    mongoose.connection.close();

    // Close Express Server
    app.server.close();
  });

  test("Bind Account", async () => {
    const address = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";

    const TEST_PRIVATE_KEY =
      "0xbc8a477dbb1c1451babfc71d09200129cb66f64586505162e0bbf4e13180a994"; // DO NOT USE IN PRODUCTION
    const wallet = new ethers.Wallet(TEST_PRIVATE_KEY);

    const address_to_bind = wallet.address;
    const address_to_bind_chain = 1;

    const message = `Bind Account ${address_to_bind} on chainId ${address_to_bind_chain} to ${address}`;
    const signature = await wallet.signMessage(message);

    const response = await request(app).post("/api/v1/user/bind").send({
      address: address,
      address_to_bind: address_to_bind,
      address_to_bind_chain: address_to_bind_chain,
      message: message,
      signature: signature,
    });

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      `Address ${address_to_bind} binded to ${address}`
    );
  });

  test("Bind Second Account", async () => {
    const address = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";

    const TEST_PRIVATE_KEY =
      "0x0e6ed8cb707826b42f6cbf06ad38b14ecd8a2da9384f39f0d50cfff8b2ae9c3f"; // DO NOT USE IN PRODUCTION
    const wallet = new ethers.Wallet(TEST_PRIVATE_KEY);

    const address_to_bind = wallet.address;
    const address_to_bind_chain = 1;

    const message = `Bind Account ${address_to_bind} on chainId ${address_to_bind_chain} to ${address}`;
    const signature = await wallet.signMessage(message);

    const response = await request(app).post("/api/v1/user/bind").send({
      address: address,
      address_to_bind: address_to_bind,
      address_to_bind_chain: address_to_bind_chain,
      message: message,
      signature: signature,
    });

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      `Address ${address_to_bind} binded to ${address}`
    );
  });

  test("Refresh NFTS", async () => {
    // Add Mock Account to address
    await User.findOneAndUpdate(
      { address: "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7" },
      {
        $push: {
          bounded_addresses: {
            address: "0x85C9b8000182238fB197bce92d320266137103De",
            chain: "1",
          },
        },
      }
    );

    const response = await request(app).get(
      "/api/v1/user/refresh?address=0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7"
    );

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("NFTS refreshed");
  });

  test("Get NFTS", async () => {
    const response = await request(app).get(
      "/api/v1/user/nfts?address=0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7"
    );
    console.log("🚀 | test | response", response._body);

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual("NFTS Retrieved");
  });
});
