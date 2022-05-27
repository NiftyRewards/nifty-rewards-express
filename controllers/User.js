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
      method: "GET",
      headers: {
        "x-api-key": TATUM_API_KEY,
      },
    }
  );
  return resp.data;
}

/**
 * @description Binds an address to user
 * @returns
 */
exports.bindAddress = async (req, res, next) => {
  let { address, address_to_bind, address_to_bind_chain, message, signature } =
    req.body;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
    address_to_bind = ethers.utils.getAddress(address_to_bind);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Verify if caller is owner of address_to_bind using signature
  if (!verifySignature(message, signature, address_to_bind)) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Verify if address_to_bind is not already binded to another address
  let user = await User.findOne({ address: address });

  if (!user) {
    let update = await User.create({
      address: address,
      bounded_addresses: [
        { address: address_to_bind, chain: address_to_bind_chain },
      ],
    });
  } else {
    if (
      user.bounded_addresses.includes({
        address: address_to_bind,
        chain: address_to_bind_chain,
      })
    ) {
      return res.status(400).json({
        message: "Address already binded",
      });
    } else {
      user.bounded_addresses.push({
        address: address_to_bind,
        chain: address_to_bind_chain,
      });
      await user.save();
    }
  }

  return res.status(200).json({
    message: `Address ${address_to_bind} binded to ${address}`,
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
    nfts: user.nfts_cache,
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
    "bounded_addresses"
  );

  const chain = "ETH";
  let totalData = [];
  for (let bounded_address of query.bounded_addresses) {
    let data = await getNFTSfromTATUM(
      bounded_address.chain,
      bounded_address.address
    );
    console.log("🚀 | exports.refreshNfts= | data", data);
    data.map((collection) => {
      collection.chain = bounded_address.chain;
    });
    console.log("🚀 | data.map | data", data);

    totalData = totalData.concat(data);
    console.log("🚀 | exports.refreshNfts= | totalData", totalData);
  }

  // Cache data from TATUM to User Collection
  await User.findOneAndUpdate({ address }, { nfts_cache: totalData });

  return res.status(200).json({
    message: "NFTS refreshed",
  });
};
