const { ethers } = require("ethers");
require("dotenv").config();

const ERC721LiteABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

class ERC721Service {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.ALCHEMY_MAINNET_RPC
    );
  }
  async getTotalSupply(contractAddress) {
    const contract = new ethers.Contract(
      contractAddress,
      ERC721LiteABI,
      this.provider
    );
    return (await contract.totalSupply()).toString();
  }

  async getName(contractAddress) {
    const contract = new ethers.Contract(
      contractAddress,
      ERC721LiteABI,
      this.provider
    );
    return (await contract.name()).toString();
  }

  async getSymbol(contractAddress) {
    const contract = new ethers.Contract(
      contractAddress,
      ERC721LiteABI,
      this.provider
    );
    return (await contract.symbol()).toString();
  }
}

const erc721Service = new ERC721Service();

module.exports = erc721Service;
