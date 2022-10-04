// This Script Adds Mock Campaign to the DEV Database

const connectDB = require("../../config/db");
const ethers = require("ethers");
const axios = require("axios");

connectDB();

require("dotenv").config();

const instance = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 100000,
});

async function main() {
  const MERCHANT_ADDRESS = "0xc1C9D88A4E58B5E395675ded16960Ffca265bA52";

  const collections = [
    "0xC4a0b1E7AA137ADA8b2F911A501638088DFdD508", // UU
    "0xdAABFA3f6A262815834be14eb1724cC809828242", // UUv2
    "0xED5AF388653567Af2F388E6224dC7C4b3241C544", // Azuki
    "0x1A92f7381B9F03921564a437210bB9396471050C", // CoolCats
    "0xd2F668a8461D6761115dAF8Aeb3cDf5F40C532C6", // Karafuru
    "0x75E9Abc7E69fc46177d2F3538C0B92d89054eC91", // Test 1
    "0x165a2eD732eb15B54b5E8C057CbcE6251370D6e8", // Test 2
  ];

  // Generate and insert 10 Campaigns under merchantAddress
  const campaigns = [];
  for (let i = 0; i < collections.length; i++) {
    const campaign = await instance.post("/api/v1/campaign/start", {
      merchantAddress: MERCHANT_ADDRESS,
      collectionAddress: collections[i],
      chainId: "1",
      title: `Test Campaign ${i}`,
      description: `Test Campaign Description ${i}`,
      startDate: "2022-01-01",
      endDate: "2022-12-01",
      redemptionCount: "1",
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
