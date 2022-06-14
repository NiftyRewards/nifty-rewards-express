// This Script Adds Mock Campaign to the DEV Database

const connectDB = require("../../config/db");
const ethers = require("ethers");
const axios = require("axios");

connectDB();

require("dotenv").config();

const instance = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 100000000,
});

async function main() {
  const collections = [
    "0xC4a0b1E7AA137ADA8b2F911A501638088DFdD508", // UU
    "0xdAABFA3f6A262815834be14eb1724cC809828242", // UUv2
    "0xED5AF388653567Af2F388E6224dC7C4b3241C544", // Azuki
    "0x1A92f7381B9F03921564a437210bB9396471050C", // CoolCats
    "0xd2F668a8461D6761115dAF8Aeb3cDf5F40C532C6", // Karafuru
  ];

  // Cache Collections in list
  for (let i = 0; i < collections.length; i++) {
    const campaign = await instance.post("/api/v1/collection/cache", {
      collectionAddress: collections[i],
      chain: "1",
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
