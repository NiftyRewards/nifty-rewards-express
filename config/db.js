const mongoose = require("mongoose");
require("dotenv").config();

let MONGODB_URI;
const DB_DOMAIN_PROD = process.env.DB_DOMAIN_PROD;
const DB_DOMAIN_DEV = process.env.DB_DOMAIN_DEV;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const connectDB = () => {
  let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
  };
  if (process.env.NODE_ENV === "test") {
    console.log("LOCAL DB...");
    MONGODB_URI = `mongodb://localhost:27017/${DATABASE_NAME}`;
  } else if (process.env.NODE_ENV == "dev") {
    console.log("DEV DB...");
    MONGODB_URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_DOMAIN_DEV}/${DATABASE_NAME}`;
  } else if (process.env.NODE_ENV == "prod") {
    console.log("PROD DB...");
    MONGODB_URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_DOMAIN_PROD}/${DATABASE_NAME}`;
  } else {
    console.log("ENV NOT SET!");
    process.exit(1);
  }

  try {
    mongoose.connect(MONGODB_URI, options);
    console.log("Connected!");
  } catch (error) {
    console.log(`Failed to Connect!`);
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
