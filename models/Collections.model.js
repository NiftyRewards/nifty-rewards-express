const mongoose = require("mongoose");

/**
 * Collection
 * @typedef {object} Collection
 * @property {string} collectionAddress.required - Contract address of the collection
 * @property {string} chain.required - Chain Id where the collection exists
 * @property {string} collectionIdentifier.required - Collection identifier (chainId-collectionAddress)
 * @property {[string]} campaigns - List of campaigns using the collection
 * @property {string} cache - Cache of the collection
 * @property {string} totalSupply - Total supply of the collection
 * @property {string} cacheLastUpdated - UNIX timestamp of when the cache was last updated
 */
const collectionsSchema = new mongoose.Schema({
  collectionAddress: { type: String, required: true },
  chain: { type: String, required: true },
  collectionIdentifier: { type: String, required: true },
  campaigns: { type: [String] },
  cache: { type: Object },
  totalSupply: { type: Number },
  cacheLastUpdated: { type: Date },
});

module.exports = mongoose.model("Collection", collectionsSchema);
