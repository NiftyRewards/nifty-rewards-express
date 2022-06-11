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
 * POST /api/v1/user/bind
 * @summary Binds an external address to the user
 * @tags User
 * @description Generates a signature and binds an external address to the user
 * @param {string} address.required - Current Address
 * @param {string} addressToBind.required - Address to Bind
 * @param {string} chain.required - Chain Id
 * @param {string} message.required - Message to sign
 * @param {string} signature.required - Signature of the message
 * @return {object} 200 - User successfully binded - application/json
 * @example response - 200 - Successful Bind
 * {
 *   "message": "Address 0x0000000000000000000000000000000000000000 binded to 0x1111111111111111111111111111111111111111"
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

  // Verify if addressToBind is not already binded to another address
  let user = await User.findOne({ address: address });

  if (!user) {
    let update = await User.create({
      address: address,
      boundedAddresses: [{ address: addressToBind, chain: chain }],
    });
  } else {
    if (
      user.boundedAddresses.includes({
        address: addressToBind,
        chain: chain,
      })
    ) {
      return res.status(400).json({
        message: "Address already binded",
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
    message: `Address ${addressToBind} binded to ${address}`,
  });
};

/**
 * @description Get NFTs from database Cache
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
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
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "NFTS Retrieved",
    nfts: user.nftsCache,
  });
};

/**
 * @description Refreshes the NFTs of the user in the cache
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

  const chain = "ETH";
  let totalData = [];
  for (let boundedAddress of query.boundedAddresses) {
    let data = await getNFTSfromTATUM(
      boundedAddress.chain,
      boundedAddress.address
    );
    console.log("🚀 | exports.refreshNfts= | data", data);
    data.map((collection) => {
      collection.chain = boundedAddress.chain;
      collection.contractIdentifier = `${boundedAddress.chain}-${collection.contractAddress}`;
    });
    console.log("🚀 | data.map | data", data);

    totalData = totalData.concat(data);
    console.log("🚀 | exports.refreshNfts= | totalData", totalData);
  }

  // Cache data from TATUM to User Collection
  await User.findOneAndUpdate(
    { address },
    { nftsCache: totalData, cacheLastUpdate: Date.now() }
  );

  return res.status(200).json({
    message: "NFTS refreshed",
  });
};
