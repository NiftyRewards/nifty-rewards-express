const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const expressJSDocSwagger = require("express-jsdoc-swagger");

require("dotenv").config();

const connectDB = require("./config/db");

// ----------------------------------
// JSDOC Settings
// ----------------------------------

const jsdocOptions = {
  info: {
    version: "1.0.0",
    title: "NiftyRewards API",
    description:
      "NiftyRewards API Documentation, production server: https://nifty-rewards-backend.herokuapp.com",
    license: {
      name: "MIT",
    },
  },
  security: {
    BasicAuth: {
      type: "http",
      scheme: "basic",
    },
  },
  baseDir: __dirname,
  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  filesPattern: "./**/*.js",
  // URL where SwaggerUI will be rendered
  swaggerUIPath: "/api-docs",
  // Expose OpenAPI UI
  exposeSwaggerUI: true,
  // Expose Open API JSON Docs documentation in `apiDocsPath` path.
  exposeApiDocs: false,
  // Open API JSON Docs endpoint.
  apiDocsPath: "/v3/api-docs",
  // Set non-required fields as nullable by default
  notRequiredAsNullable: false,
  // You can customize your UI options.
  // you can extend swagger-ui-express config. You can checkout an example of this
  // in the `example/configuration/swaggerOptions.js`
  swaggerUiOptions: {},
  // multiple option in case you want more that one instance
  multiple: true,
};

// ----------------------------------
// Routes Import
// ----------------------------------

const userRouter = require("./routes/User");
const collectionRoute = require("./routes/Collection");
const campaignRouter = require("./routes/Campaign");
const rewardRouter = require("./routes/Reward");
const merchantRouter = require("./routes/Merchant");

// ----------------------------------
// Express configuration
// ----------------------------------
const app = express();

app.use(express.json());

let whitelistOrigins = [
  "http://staging.niftyr3wrds.com",
  "http://localhost:3000",
];

let corsOptions = {
  origin: whitelistOrigins,
  optionsSuccessStatus: 200,
};

app.use(cors());

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

app.use(helmet());

expressJSDocSwagger(app)(jsdocOptions);

// ----------------------------------
// API Routes
// ----------------------------------

app.use("/api/v1/user", userRouter);
app.use("/api/v1/collection", collectionRoute);
app.use("/api/v1/campaign", campaignRouter);
app.use("/api/v1/reward", rewardRouter);
app.use("/api/v1/merchant", merchantRouter);

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
