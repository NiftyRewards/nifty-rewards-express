const request = require("supertest");
const app = require("../server");
const ethers = require("ethers");
const UserModel = require("../models/Users.model");
const mongoose = require("mongoose");

require("dotenv").config();

jest.setTimeout(30000);

describe("User", () => {
  beforeAll(async () => {
    // Remove all data that was added during tests
    // await UserModel.deleteMany({});
  });

  afterAll(async () => {
    // Remove all data that was added during tests

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

    const addressToBind = wallet.address;
    const chain = 1;

    const message = `Bind Account ${addressToBind} on chainId ${chain} to ${address}`;
    const signature = await wallet.signMessage(message);

    const response = await request(app).post("/api/v1/user/bind").send({
      address: address,
      addressToBind: addressToBind,
      chain: chain,
      message: message,
      signature: signature,
    });

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      `Address ${addressToBind} bound to ${address}`
    );
  });

  test("Bind Second Account", async () => {
    const address = "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7";

    const TEST_PRIVATE_KEY =
      "0x0e6ed8cb707826b42f6cbf06ad38b14ecd8a2da9384f39f0d50cfff8b2ae9c3f"; // DO NOT USE IN PRODUCTION
    const wallet = new ethers.Wallet(TEST_PRIVATE_KEY);

    const addressToBind = wallet.address;
    const chain = 1;

    const message = `Bind Account ${addressToBind} on chainId ${chain} to ${address}`;
    const signature = await wallet.signMessage(message);

    const response = await request(app).post("/api/v1/user/bind").send({
      address: address,
      addressToBind: addressToBind,
      chain: chain,
      message: message,
      signature: signature,
    });

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      `Address ${addressToBind} bound to ${address}`
    );
  });
  // 0x5672C4871b615AA45B090a790646cfC8305beDdf
  test("Bind Account", async () => {
    const address = "0x5672C4871b615AA45B090a790646cfC8305beDdf";

    const TEST_PRIVATE_KEY =
      "0x0e6ed8cb707826b42f6cbf06ad38b14ecd8a2da9384f39f0d50cfff8b2ae9c3f"; // DO NOT USE IN PRODUCTION
    const wallet = new ethers.Wallet(TEST_PRIVATE_KEY);

    const addressToBind = wallet.address;
    const chain = 1;

    const message = `Bind Account ${addressToBind} on chainId ${chain} to ${address}`;
    const signature = await wallet.signMessage(message);

    const response = await request(app).post("/api/v1/user/bind").send({
      address: address,
      addressToBind: addressToBind,
      chain: chain,
      message: message,
      signature: signature,
    });

    expect(response.status).toEqual(200);
    expect(response._body.message).toEqual(
      `Address ${addressToBind} bound to ${address}`
    );
  });
  //   test("Refresh NFTS", async () => {
  //     // Add Mock Account to address
  //     await UserModel.findOneAndUpdate(
  //       { address: "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7" },
  //       {
  //         $push: {
  //           boundedAddresses: {
  //             address: "0x85C9b8000182238fB197bce92d320266137103De",
  //             chain: "1",
  //           },
  //         },
  //       }
  //     );

  //     const response = await request(app).get(
  //       "/api/v1/user/refresh?address=0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7"
  //     );

  //     expect(response.status).toEqual(200);
  //     expect(response._body.message).toEqual("NFTS refreshed");
  //   });

  //   test("Get NFTS", async () => {
  //     const response = await request(app).get(
  //       "/api/v1/user/nfts?address=0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7"
  //     );
  //     console.log("🚀 | test | response", response._body);

  //     expect(response.status).toEqual(200);
  //     expect(response._body.message).toEqual("NFTS Retrieved");
  //   });
});
