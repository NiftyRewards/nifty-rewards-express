const Merchant = require("../models/Merchants.model");
const axios = require("axios");
const { chains } = require("../utils/chains");

exports.createMerchant = async (req, res, next) => {
  const { name, description, merchantAddress } = req.body;

  try {
    const newMerchant = Merchant.create({
      merchant_address: merchantAddress,
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

  return res.status(400).json({
    message: "Merchant not created",
    error,
  });
};
// exports.getMerchants = async (req, res, next) => {
//   const { collectionAddress, quantity, tokens, startDate, endDate } = req.body;
// };
// exports.getMerchant = async (req, res, next) => {};
// exports.verifyMerchant = async (req, res, next) => {};
// exports.editMerchant = async (req, res, next) => {};
