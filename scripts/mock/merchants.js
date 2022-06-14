// This Script Adds Mock Merchants to the DEV Database

const connectDB = require("../../config/db");
const ethers = require("ethers");
const Merchant = require("../../models/Merchants.model");

connectDB();

require("dotenv").config();

async function main() {
  // Generate 10 Merchant Address using ethers.js
  const merchantAddresses = [];
  for (let i = 0; i < 10; i++) {
    const wallet = ethers.Wallet.createRandom();
    merchantAddresses.push(wallet.address);
  }

  console.log("🚀 | main | merchantAddresses", merchantAddresses);
  // Add 10 Merchants to DB
  for (let i = 0; i < 10; i++) {
    const merchant = await Merchant.create({
      address: merchantAddresses[i],
      name: `Merchant ${i}`,
      description: `Merchant ${i} Description`,
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
