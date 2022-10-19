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
  const address = "0x5672C4871b615AA45B090a790646cfC8305beDdf";

  const TEST_PRIVATE_KEY =
    "0x0e6ed8cb707826b42f6cbf06ad38b14ecd8a2da9384f39f0d50cfff8b2ae9c3f"; // DO NOT USE IN PRODUCTION
  const wallet = new ethers.Wallet(TEST_PRIVATE_KEY);

  const addressToBind = wallet.address;
  const chain = 1;

  const message = `Bind Account ${addressToBind} on chainId ${chain} to ${address}`;
  const signature = await wallet.signMessage(message);

  const response = await instance.post("/api/v1/user/bind", {
    address: address,
    addressToBind: addressToBind,
    chain: chain,
    message: message,
    signature: signature,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
