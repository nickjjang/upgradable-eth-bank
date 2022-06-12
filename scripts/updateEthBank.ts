// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as dotenv from "dotenv";
import { ethers, upgrades } from "hardhat";
dotenv.config();

async function main() {

  const ethBankAddress: any = process.env.ETHBANK_ADDRESS; // EthBank v1 Address

  // Upgrade EthBank V2
  const EthBankV2 = await ethers.getContractFactory("EthBankV2");
  const ethBankV2 = await upgrades.upgradeProxy(ethBankAddress, EthBankV2);
  await ethBankV2.upgrade();
  console.log("ETH BANK V2: ", ethBankV2.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
