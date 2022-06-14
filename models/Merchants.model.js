const mongoose = require("mongoose");

/**
 * Merchant Verify Payload
 * @typedef {object} MerchantVerifyPayload
 * @property {string} address.required - Wallet address of the merchant
 */

/**
 * Merchant
 * @typedef {object} Merchant
 * @property {string} address.required - Wallet address of the merchant
 * @property {string} name.required - Name of the merchant
 * @property {string} description.required - Description of the merchant
 * @property {string} verified - If the merchant is verified
 * @property {[string]} campaigns - List of campaigns by the merchant
 */
const merchantsSchema = new mongoose.Schema({
  address: { type: String, required: true },
  name: { type: String, required: true, default: "Merchant" },
  description: { type: String },
  verified: { type: Boolean, default: true },
  campaigns: { type: [mongoose.Schema.Types.ObjectId] },
});

module.exports = mongoose.model("Merchant", merchantsSchema);
