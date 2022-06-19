const Merchant = require("../models/Merchants.model");
const ethers = require("ethers");

/**
 * POST /api/v1/merchant/create
 * @summary Create a merchant account
 * @tags Merchant
 * @description Create a merchant account
 * @param {MerchantCreatePayload} request.body.required - Merchant Creation Payload
 * @return {object} 200 - Success response
 * @example response - 200 - Successful Creation of Merchant Account
 * {
 *   "message": "Merchant Created"
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid Address
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Error
 * {
 *   "message": "Merchant not created"
 * }
 */
exports.createMerchant = async (req, res, next) => {
  let { address, name, description } = req.body;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  try {
    const newMerchant = await Merchant.create({
      address: address,
      name: name,
      description: description,
    });
    return res.status(201).json({
      message: "Merchant Created",
      merchant: newMerchant,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Merchant not created",
      error,
    });
  }
};

/**
 * GET /api/v1/merchant
 * @summary Get all merchants
 * @tags Merchant
 * @description Get all merchants from database
 * @return {object} 200 - Success response
 * @example response - 200 - Successful Retrieval of Merchants
 * {
 *   "message": "Merchants retrieved",
 *    "data": {}
 * }
 * @return {object} 400 - Bad request response
 */
exports.getMerchants = async (req, res, next) => {
  try {
    const merchants = await Merchant.find({}, { _id: 0, __v: 0 });
    return res.status(200).json({
      message: "Merchants retrieved",
      data: merchants,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Merchants not retrieved",
      error,
    });
  }
};

/**
 * GET /api/v1/merchant
 * @summary Get a single merchant based on address
 * @tags Merchant
 * @param {string} address.query.required - Merchant Address
 * @description Get a single merchant based on address
 * @return {object} 200 - Success response
 * @example response - 200 - Successful retrieval of Merchants
 * {
 *   "message": "Merchant retrieved",
 *    "data": {}
 * }
 * @return {DefaultErrorResponse} 400 - Bad request response
 * @example response - 400 - Fail to retrieve merchant
 * {
 *   "error": "Error Retrieving Merchant(s)"
 * }
 */
exports.getMerchant = async (req, res, next) => {
  const { address } = req.params;
  let merchants;
  console.log("🚀 | exports.getMerchant= | address", address);
  try {
    if (address) {
      merchants = await Merchant.find({ address: address }, { _id: 0, __v: 0 });
    } else {
      merchants = await Merchant.find({}, { _id: 0, __v: 0 });
    }

    return res.status(200).json({
      message: "Merchants retrieved",
      data: merchants,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Error Retrieving Merchant(s)",
    });
  }
};

/**
 * POST /api/v1/merchant/verify
 * @summary Verify a merchant
 * @tags Merchant
 * @param {MerchantVerifyPayload} request.body.required - Merchant Verification Payload
 * @description Verify a merchant
 * @return {object} 200 - Success response
 * @example request - example payload
 * {
 *   "address": "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7"
 * }
 * @example response - 200 - Successful verification of Merchants
 * {
 *   "message": "Merchant verified",
 *    "data": {}
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Fail to verify specified merchant
 * {
 *   "message": "Error Verifying Merchant",
 *    "data": {}
 * }
 */
exports.verifyMerchant = async (req, res, next) => {
  const { address } = req.params;
  try {
    const merchant = await Merchant.findOneAndUpdate(
      { address: address },
      { verified: true }
    );
    return res.status(200).json({
      message: "Merchant verified",
      merchant,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error Verifying Merchant",
      error,
    });
  }
};

/**
 * Put /api/v1/merchant/edit
 * @summary Get a single merchant based on address
 * @tags Merchant
 * @param {string} address.required - Merchant Address
 * @description Get a single merchant based on address
 * @return {object} 200 - Success response
 * @example response - 200 - Successful retrieval of Merchants
 * {
 *   "message": "Merchant retrieved",
 *    "data": {}
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Fail to retrieve specified merchant
 * {
 *   "message": "Merchant retrieved",
 *    "data": {}
 * }
 */
exports.editMerchant = async (req, res, next) => {
  const { address } = req.params;
  const { name, description } = req.body;
  try {
    const merchant = await Merchant.findOneAndUpdate(
      { address: address },
      { name, description }
    );
    return res.status(200).json({
      message: "Merchant updated",
      merchant,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Merchant not updated",
      error,
    });
  }
};
