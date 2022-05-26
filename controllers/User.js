const User = require("../models/USers.model");
const ethers = require("ethers");

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
exports.getNfts = async (req, res, next) => {};
