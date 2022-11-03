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
  const campaignData = require("./campaignData.json");

  for (let campaign of campaignData) {
    console.log("🚀 | main | campaign", campaign);
    const { data } = await instance.post("/api/v1/campaign/start", campaign);

    console.log(data);
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
