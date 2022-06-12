// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as dotenv from "dotenv";
import { ethers, upgrades } from "hardhat";
dotenv.config();

async function main() {
  const ERC20Token1 = await ethers.getContractFactory("ERC20Token1");
  const erc20Token1Args: any[] = [];
  const erc20Token1 = await ERC20Token1.deploy(...erc20Token1Args);
  await erc20Token1.deployed();

  console.log("ERC20: ", erc20Token1.address)

  // Deploy EthBank V1
  const EthBank = await ethers.getContractFactory("EthBank");
  const ethBank = await upgrades.deployProxy(EthBank);
  console.log("ETH BANK: ", ethBank.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
