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
};
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
  const { merchantAddress } = req.params;
  try {
    const merchants = await Merchant.find(
      { merchant_address: merchantAddress },
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
  const { merchantAddress } = req.params;
  try {
    const merchant = await Merchant.findOneAndUpdate(
      { merchant_address: merchantAddress },
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
  const { merchantAddress } = req.params;
  const { name, description } = req.body;
  try {
    const merchant = await Merchant.findOneAndUpdate(
      { merchant_address: merchantAddress },
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
