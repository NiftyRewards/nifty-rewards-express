const User = require("../models/USers.model");
const ethers = require("ethers");
const axios = require("axios");

function verifySignature(message, signature, address) {
  return address === ethers.utils.verifyMessage(message, signature);
}

exports.bindAddress = async (req, res, next) => {
  let { address, address_to_bind, message, signature } = req.body;

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
  if (!verifySignature(message, signature, address)) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Verify if address_to_bind is not already binded to another address
  let user = await User.findOne({ address: address });

  if (!user) {
    user.address = address;
    user.bounded_addresses = [address_to_bind];
    await user.save();
  } else {
    if (user.bounded_addresses.includes(address_to_bind)) {
      return res.status(400).json({
        message: "Address already binded",
      });
    } else {
      user.bounded_addresses.push(address_to_bind);
      await user.save();
    }
  }

  return res.status(200).json({
    message: `Address ${address_to_bind} binded to ${address}`,
  });
};
exports.getNfts = async (req, res, next) => {
  let { address } = req.query;
  console.log("🚀 | exports.getNfts= | address", address);

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }
  // const chain = process.env.NODE_ENV === "prod" ? "1" : "4"; // TODO: TATUM DONT SUPPORT RINKEBY
  // const TATUM_API_KEY =  process.env.NODE_ENV === "prod"
  // ? process.env.TATUM_PROD_API_KEY
  // : process.env.TATUM_DEV_API_KEY
  const chain = "ETH";
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
  console.log("🚀 | exports.getNfts= | resp", resp.data);

  return res.status(200).json({
    message: "Nfts retrieved",
    nfts: resp.data.data,
  });
};
