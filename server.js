const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const connectDB = require("./config/db");

// ----------------------------------
// Routes Import
// ----------------------------------

const userRouter = require("./routes/User");
const collectionRoute = require("./routes/Collection");
// const campaignRouter = require("./routes/Campaign");
// const rewardRouter = require("./routes/Reward");
// const merchantRouter = require("./routes/Merchant");

// ----------------------------------
// Express configuration
// ----------------------------------
const app = express();

app.use(express.json());

let whitelistOrigins = [];

let corsOptions = {
  origin: whitelistOrigins,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

app.use(helmet());

// ----------------------------------
// API Routes
// ----------------------------------

app.use("/api/v1/user", userRouter);
app.use("/api/v1/collection", collectionRoute);
// app.use("/api/v1/campaign", campaignRouter);
// app.use("/api/v1/reward", rewardRouter);
// app.use("/api/v1/merchant", merchantRouter);

// ----------------------------------
// Express server
// ----------------------------------
const PORT = process.env.PORT || 5000;
app.db = connectDB();
console.log("MongoDB connected");

app.server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
