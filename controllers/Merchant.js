const Merchant = require("../models/Merchants.model");
const ethers = require("ethers");

/**
 * POST /api/v1/merchant/create
 * @summary Create a merchant account
 * @tags Merchant
 * @description Create a merchant account
 * @param {string} address.required - Merchant Address
 * @param {string} name.required - Merchant Name
 * @param {string} description.required - Merchant Description
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
 *   "message": "Merchants retrieved"
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
exports.getMerchant = async (req, res, next) => {
  const { address } = req.params;
  try {
    const merchants = await Merchant.find(
      { address: address },
      { _id: 0, __v: 0 }
    );
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
      message: "Merchant not verified",
      error,
    });
  }
};
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
