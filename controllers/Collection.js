const Collection = require("../models/Collections.model");
const axios = require("axios");
const { chains } = require("../utils/chains");
const erc721Service = require("../services/ERC721.service");

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
  let data = [];
  let chain = chains[chainId];
  let pageSize = 50;
  let offset = 0;

  const totalSupply = await erc721Service.getTotalSupply(collectionAddress);
  const name = await erc721Service.getName(collectionAddress);
  const symbol = await erc721Service.getSymbol(collectionAddress);

  try {
    await Collection.findOneAndUpdate(
      { collectionIdentifier: `${chainId}-${collectionAddress}` },
      {
        collectionIdentifier: `${chainId}-${collectionAddress}`,
        collectionAddress: collectionAddress,
        chain: chainId,
        totalSupply: totalSupply,
        name: name,
        symbol: symbol,
      },
      { upsert: true }
    );
  } catch (error) {
    console.log(error);
  }

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
          cacheLastUpdated: Date.now(),
        },
        { upsert: true }
      );
    } catch (error) {
      console.log(error);
      break;
    }

    // Increase Offset
    offset += pageSize;
  }
}

// TODO: Improve Caching Algorithm
/**
 * POST /api/v1/collection/cache
 * @summary Cache a collection
 * @tags Collection
 * @description Retrieve data from TATUM API and cache in the backend
 * @param {CollectionCachePayload} request.body.required - Collection Cache Payload
 * @example request - CollectionCachePayload - UninterestedUnicorns
 * {
 *  "collectionAddress": "0xC4a0b1E7AA137ADA8b2F911A501638088DFdD508",
 *  "chain": "1"
 * }
 * @return {CollectionCacheResponse} 200 - success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
 */
exports.cacheCollection = async (req, res, next) => {
  const { collectionAddress, chain } = req.body;

  await indexCollection(chain, collectionAddress);

  return res.status(200).json({
    message: "Collection Cached",
  });
};

/**
 * GET /api/v1/collection
 * @summary Get All Participating Collections
 * @tags Collection
 * @description Retrieve Collection Data from Backend
 * @param {string} collectionIdentifier.query - Collection Identifier
 * @return {CollectionSummaryResponse} 200 - success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
 */
exports.getCollection = async (req, res, next) => {
  const { collectionIdentifier } = req.query;
  let collection;
  // Find Collection using collectionIdentifier
  try {
    if (collectionIdentifier) {
      collection = await Collection.findOne(
        {
          collectionIdentifier: collectionIdentifier,
        },
        { cache: 0, __v: 0 }
      );
    } else {
      collection = await Collection.find(
        {},
        {
          collectionId: 1,
          name: 1,
          totalSupply: 1,
          collectionAddress: 1,
          chain: 1,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Error Retrieving Collection",
    });
  }
  // Return Collection(s)
  return res.status(200).json({
    message: "Collection(s) Retrieved",
    data: collection,
  });
};
