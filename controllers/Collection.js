const Collection = require("../models/Collections.model");
const axios = require("axios");
const { chains } = require("../utils/chains");
/**
 * @description Get List of collection identifiers
 * @param {*} nfts_cache
 * @returns List of collection identifiers
 */
function getCollectionIdentifiers(nfts_cache) {
  let collectionIdentifiers = nfts_cache.map((collection) => {
    return collection.collectionIdentifier;
  });
  console.log(
    "🚀 | collectionIdentifiers | collectionIdentifiers",
    collectionIdentifiers
  );
  return collectionIdentifiers;
}

async function indexCollection(chainId, collectionAddress) {
  console.log("🚀 | indexCollection | chainId", chainId);
  console.log("🚀 | indexCollection | collectionAddress", collectionAddress);
  let data = [];
  let chain = chains[chainId];
  console.log("🚀 | indexCollection | chain", chain);
  let pageSize = 50;
  let offset = 0;

  const TATUM_API_KEY = process.env.TATUM_PROD_API_KEY;

  // Loop until all data is retrieved
  while (true) {
    let resp;
    const query = new URLSearchParams({
      pageSize: pageSize,
      offset: offset,
    }).toString();

    try {
      // Get Response from TATUM
      resp = await axios.get(
        `https://api-us-west1.tatum.io/v3/nft/collection/${chain}/${collectionAddress}?${query}`,
        {
          headers: {
            "x-api-key": TATUM_API_KEY,
          },
        }
      );
    } catch (error) {
      console.log(error);
      break;
    }

    data = resp.data;
    console.log("🚀 | indexCollection | data", data.length);

    if (data.length === 0) {
      break;
    }

    // Push Data to collection
    try {
      await Collection.findOneAndUpdate(
        { collectionIdentifier: `${chainId}-${collectionAddress}` },
        {
          collectionIdentifier: `${chainId}-${collectionAddress}`,
          collectionAddress: collectionAddress,
          chain: chainId,
          $addToSet: { cache: { $each: data } },
          cache_last_updated: Date.now(),
        },
        { upsert: true }
      );
    } catch (error) {
      console.log(error);
      break;
    }

    // Increase Offset
    offset += pageSize;
    console.log("🚀 | indexCollection | offset", offset);
  }
}

// TODO: Improve Caching Algorithm
/**
 * POST /api/v1/collection/cache
 * @summary Cache a collection
 * @tags Collection
 * @description Retrieve data from TATUM API and cache in the backend
 * @param {string} collectionAddress.required - Address of the Collection
 * @param {string} chain.required - Chain Id
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
exports.cacheCollection = async (req, res, next) => {
  const { collectionAddress, chain } = req.body;

  await indexCollection(chain, collectionAddress);

  return res.status(200).json({
    message: "Collection Cached",
  });
};
