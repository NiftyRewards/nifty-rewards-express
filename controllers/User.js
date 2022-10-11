const User = require("../models/Users.model");
const ethers = require("ethers");
const axios = require("axios");
const { chains } = require("../utils/chains");

function verifySignature(message, signature, address) {
  return address === ethers.utils.verifyMessage(message, signature);
}

/**
 * @description Get NFTS from Tatum
 * @param {*} chain (ETH)
 * @param {*} address
 * @returns
 */
async function getNFTSfromTATUM(chain, address) {
  chain = chains[chain.toString()];
  const TATUM_API_KEY = process.env.TATUM_PROD_API_KEY;

  // TODO: Add Solana support in the future
  const resp = await axios.get(
    `https://api-us-west1.tatum.io/v3/nft/address/balance/${chain}/${address}`,
    {
      headers: {
        "x-api-key": TATUM_API_KEY,
      },
    }
  );
  return resp.data;
}

/**
 * GET /api/v1/user/isBound
 * @summary Checks if an address has already bound to an external address
 * @tags User
 * @description Checks if an address has already bound to an external address
 * @param {string} address.query.required - Address of the wallet
 * @return {object} 200 - User successfully bound - application/json
 * @example response - 200 - User has bounded account(s)
 * {
 *   "isBound": true,
 *   "address": "0x0000000000000000000000000000000000000000",
 *   "boundedAddresses": ["0x0000000000000000000000000000000000000001"]
 * }
 * @example response - 200 - User has no bounded account
 * {
 *   "isBound": false,
 *   "address": "0x0000000000000000000000000000000000000000",
 *   "boundedAddresses": []
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid Address
 * {
 *   "message": "Invalid address"
 * }
 */
exports.isBound = async (req, res, next) => {
  let { address, addressToBind } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
    addressToBind = ethers.utils.getAddress(addressToBind);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }
  // Verify if addressToBind is not already bound to another address
  let user = await User.findOne({ address: address });

  if (!user) {
    let update = await User.create({
      address: address,
    });
    return res.status(400).json({
      isBound: false,
      address: address,
      boundedAddresses: [],
    });
  } else {
    if (user.boundAddresses.length > 0) {
      return res.status(200).json({
        isBound: true,
        address: address,
        boundedAddresses: user.boundedAddresses,
      });
    } else {
      return res.status(200).json({
        isBound: false,
        address: address,
        boundedAddresses: [],
      });
    }
  }
};

/**
 * POST /api/v1/user/bind
 * @summary Binds an external address to the user
 * @tags User
 * @description Generates a signature and binds an external address to the user
 * @param {UserBindPayload} request.body.required
 * @example request - UserBindPayload
 * {
 *  "address": "0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7",
 *  "addressToBind": "0x26741CC7252320c092a86129a39556d0137ee8E5",
 *  "chain": "1",
 *  "message": "Bind Account 0x26741CC7252320c092a86129a39556d0137ee8E5 on chainId 1 to 0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7",
 *  "signature": "0x48bd0dd7134bd1609c703540463c8b78f60f07da97f97e02010c4f457fe63d4d2d0b53a08fe9f9914889923c62afc34134311b6702db8081c9161d7a3113ae9e1b"
 * }
 * @return {object} 200 - User successfully bound - application/json
 * @example response - 200 - Successful Bind
 * {
 *   "message": "Address 0x0000000000000000000000000000000000000000 bound to 0x1111111111111111111111111111111111111111"
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid Address
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Invalid Signature
 * {
 *   "message": "Unauthorized"
 * }
 */
exports.bindAddress = async (req, res, next) => {
  let { address, addressToBind, chain, message, signature } = req.body;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
    addressToBind = ethers.utils.getAddress(addressToBind);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Verify if caller is owner of addressToBind using signature
  if (!verifySignature(message, signature, addressToBind)) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Verify if addressToBind is not already bound to another address
  let user = await User.findOne({ address: address });

  if (!user) {
    await User.create({
      address: address,
      boundedAddresses: [{ address: addressToBind, chain: chain }],
    });
  } else {
    let boundedAddress = await User.findOne({
      address: address,
      "boundedAddresses.address": addressToBind,
      "boundedAddresses.chain": chain,
    });

    if (boundedAddress) {
      return res.status(400).json({
        message: "Address already bound",
      });
    } else {
      user.boundedAddresses.push({
        address: addressToBind,
        chain: chain,
      });
      await user.save();
    }
  }

  return res.status(200).json({
    message: `Address ${addressToBind} bound to ${address}`,
  });
};

/**
 * GET /api/v1/user/nfts
 * @summary Get NFTs from database Cache
 * @description Get NFTs from database Cache
 * @tags User
 * @param {string} address.query.required - Address of the wallet
 * @return {object} 200 - User successfully bound - application/json
 * @example response - 200 - Successful Retrieval of NFTs
 * {
 *   "message": "NFTS Retrieved"
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid Address
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Invalid User
 * {
 *   "message": "User not found"
 * }
 */
exports.getNfts = async (req, res, next) => {
  let { address } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Find user
  let user = await User.findOne({ address: address });

  // Return error if user not found
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "NFTS Retrieved",
    nfts: user.nftsCache,
  });
};

/**
 * GET /api/v1/user/refresh
 * @summary Refresh NFT Cache of specified user
 * @description Refresh NFT Cache of specified user based on the input address
 * @tags User
 * @param {string} address.query.required - Address of the wallet
 * @return {object} 200 - Success Response - application/json
 * @example response - 200 - Successful Refresh of Cache
 * {
 *   "message": "NFTS Refreshed"
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid Address
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Invalid User
 * {
 *   "message": "User not found"
 * }
 */
exports.refreshNfts = async (req, res, next) => {
  let { address } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Get Bounded Addresses
  let query = await User.findOne({ address: address }).select(
    "boundedAddresses"
  );

  // Throw error if empty query
  if (!query) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  const chain = "ETH";
  let totalData = [];
  for (let boundedAddress of query.boundedAddresses) {
    let data = await getNFTSfromTATUM(
      boundedAddress.chain,
      boundedAddress.address
    );
    data.map((collection) => {
      collection.chain = boundedAddress.chain;
      collection.collectionIdentifier = `${boundedAddress.chain}-${collection.contractAddress}`;
    });
    totalData = totalData.concat(data);
  }

  // Cache data from TATUM to User Collection
  await User.findOneAndUpdate(
    { address },
    { nftsCache: totalData, cacheLastUpdated: Date.now() }
  );

  return res.status(200).json({
    message: "NFTS refreshed",
  });
};
