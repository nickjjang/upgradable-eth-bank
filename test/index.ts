import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { fail } from "assert";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";

describe("EthBank", () => {
  let accounts: SignerWithAddress[];
  let erc20Token1: Contract;
  let ethBank: Contract;
  let ethBankV2: Contract;

  it("Scenario1: deploy", async () => {
    accounts = await ethers.getSigners();

    // Deploy Token1
    const ERC20Token1 = await ethers.getContractFactory("ERC20Token1");
    erc20Token1 = await ERC20Token1.deploy();

    // Deploy EthBank V1
    const EthBank = await ethers.getContractFactory("EthBank");
    ethBank = await upgrades.deployProxy(EthBank);
  });

  it("Scenario1: mint tokens", async () => {
    const [addrOwner, addr2, addr3, addr4] = accounts;

    // Mint Token1 to addrOwner, addr2, addr3, addr4
    await erc20Token1.connect(addrOwner).mint(addrOwner.address, "10000");
    expect(
      (await erc20Token1.balanceOf(addrOwner.address)).toString()
    ).to.equal("10000");

    await erc20Token1.connect(addrOwner).mint(addr2.address, "20000");
    expect((await erc20Token1.balanceOf(addr2.address)).toString()).to.equal(
      "20000"
    );

    await erc20Token1.connect(addrOwner).mint(addr3.address, "30000");
    expect((await erc20Token1.balanceOf(addr3.address)).toString()).to.equal(
      "30000"
    );

    await erc20Token1.connect(addrOwner).mint(addr4.address, "40000");
    expect((await erc20Token1.balanceOf(addr4.address)).toString()).to.equal(
      "40000"
    );
  });

  it("Scenario1: create account to the bank", async () => {
    const [addrOwner, addr2, addr3] = accounts;

    // Create 3 accounts
    await ethBank.connect(addrOwner).createAccount();
    await ethBank.connect(addr2).createAccount();
    await ethBank.connect(addr3).createAccount();

    // Do not allowed create twice
    try {
      await ethBank.connect(addr2).createAccount();
      fail();
    } catch (error: any) {
      expect(error.message.includes("Account is created already")).to.equal(
        true
      );
    }
  });

  it("Scenario1: deposit to the bank", async () => {
    const [addrOwner, addr2, addr3, addr4] = accounts;

    // Deposit funds to addrOwner, addr2, addr3
    await erc20Token1.connect(addrOwner).approve(ethBank.address, "1000");
    await ethBank.connect(addrOwner).deposit(erc20Token1.address, "1000");
    expect(
      (
        await ethBank.getAccountBalance(addrOwner.address, erc20Token1.address)
      ).toString()
    ).to.equal("1000");

    await erc20Token1.connect(addr2).approve(ethBank.address, "2000");
    await ethBank.connect(addr2).deposit(erc20Token1.address, "2000");
    expect(
      (
        await ethBank.getAccountBalance(addr2.address, erc20Token1.address)
      ).toString()
    ).to.equal("2000");

    await erc20Token1.connect(addr3).approve(ethBank.address, "3000");
    await ethBank.connect(addr3).deposit(erc20Token1.address, "3000");
    expect(
      (
        await ethBank.getAccountBalance(addr3.address, erc20Token1.address)
      ).toString()
    ).to.equal("3000");

    // Reject zero amount
    try {
      await ethBank.connect(addrOwner).deposit(erc20Token1.address, "0");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Amount is not correct")).to.equal(true);
    }

    // Reject if the account is not created
    try {
      await ethBank.connect(addr4).deposit(erc20Token1.address, "4000");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Account is not created")).to.equal(true);
    }
  });

  it("Scenario1: withdraw", async () => {
    const [addrOwner, addr2, addr3] = accounts;

    // Withdraw from addrOwner, addr2, addr3
    await ethBank.connect(addrOwner).withdraw(erc20Token1.address, "500");
    expect(
      (
        await ethBank.getAccountBalance(addrOwner.address, erc20Token1.address)
      ).toString()
    ).to.equal("500");
    expect(
      (await erc20Token1.balanceOf(addrOwner.address)).toString()
    ).to.equal("9500");

    await ethBank.connect(addr2).withdraw(erc20Token1.address, "1000");
    expect(
      (
        await ethBank.getAccountBalance(addr2.address, erc20Token1.address)
      ).toString()
    ).to.equal("1000");
    expect((await erc20Token1.balanceOf(addr2.address)).toString()).to.equal(
      "19000"
    );

    await ethBank.connect(addr3).withdraw(erc20Token1.address, "1500");
    expect(
      (
        await ethBank.getAccountBalance(addr3.address, erc20Token1.address)
      ).toString()
    ).to.equal("1500");
    expect((await erc20Token1.balanceOf(addr3.address)).toString()).to.equal(
      "28500"
    );

    // Reject zero amount
    try {
      await ethBank.connect(addrOwner).withdraw(erc20Token1.address, "0");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Amount is not correct")).to.equal(true);
    }

    // Reject insufficient amount
    try {
      await ethBank.connect(addrOwner).withdraw(erc20Token1.address, "20000");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Insufficient amount")).to.equal(true);
    }
  });

  it("Scenario2: deploy", async () => {
    const [addrOwner] = accounts;
    const EthBankV2 = await ethers.getContractFactory("EthBankV2");
    ethBankV2 = await upgrades.upgradeProxy(ethBank.address, EthBankV2);
    ethBankV2.connect(addrOwner).upgrade();
    expect(ethBankV2.address).to.equal(ethBank.address);
    expect(await ethBankV2.owner()).to.equal(addrOwner.address);
  });

  it("Scenario2: transfer", async () => {
    const [addrOwner, addr2, addr3, addr4] = accounts;

    // Transfer funds
    await ethBankV2
      .connect(addr2)
      .transfer(addrOwner.address, erc20Token1.address, "500");
    await ethBankV2
      .connect(addr3)
      .transfer(addr2.address, erc20Token1.address, "500");

    expect(
      (
        await ethBankV2.getAccountBalance(
          addrOwner.address,
          erc20Token1.address
        )
      ).toString()
    ).to.equal("1000");
    expect(
      (
        await ethBankV2.getAccountBalance(addr2.address, erc20Token1.address)
      ).toString()
    ).to.equal("1000");
    expect(
      (
        await ethBankV2.getAccountBalance(addr3.address, erc20Token1.address)
      ).toString()
    ).to.equal("1000");

    // Reject transfering to me
    try {
      await ethBankV2
        .connect(addrOwner)
        .transfer(addrOwner.address, erc20Token1.address, "500");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Receiver is you")).to.equal(true);
    }

    // Reject zero amount
    try {
      await ethBankV2
        .connect(addrOwner)
        .transfer(addr2.address, erc20Token1.address, "0");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Amount is not correct")).to.equal(true);
    }

    // Reject insufficient amount
    try {
      await ethBankV2
        .connect(addrOwner)
        .transfer(addr2.address, erc20Token1.address, "20000");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Insufficient amount")).to.equal(true);
    }

    // Reject sender is not created
    try {
      await ethBankV2
        .connect(addr4)
        .transfer(addr2.address, erc20Token1.address, "500");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Sender is not created")).to.equal(true);
    }

    // Reject receiver is not created
    try {
      await ethBankV2
        .connect(addr2)
        .transfer(addr4.address, erc20Token1.address, "500");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Receiver is not created")).to.equal(true);
    }
  });

  it("Scenario2: send", async () => {
    const [addrOwner, addr2, addr3, addr4] = accounts;
    await ethBankV2
      .connect(addrOwner)
      .send(addr3.address, erc20Token1.address, "500");
    await ethBankV2
      .connect(addr2)
      .send(addr3.address, erc20Token1.address, "500");

    await ethBankV2
      .connect(addr3)
      .send(addr3.address, erc20Token1.address, "500");

    expect(
      (
        await ethBankV2.getAccountBalance(
          addrOwner.address,
          erc20Token1.address
        )
      ).toString()
    ).to.equal("500");
    expect(
      (
        await ethBankV2.getAccountBalance(addr2.address, erc20Token1.address)
      ).toString()
    ).to.equal("500");
    expect(
      (
        await ethBankV2.getAccountBalance(addr3.address, erc20Token1.address)
      ).toString()
    ).to.equal("500");
    expect((await erc20Token1.balanceOf(addr3.address)).toString()).to.equal(
      "30000"
    );

    // Reject zero amount
    try {
      await ethBankV2
        .connect(addrOwner)
        .send(addr2.address, erc20Token1.address, "0");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Amount is not correct")).to.equal(true);
    }

    // Reject insufficient amount
    try {
      await ethBankV2
        .connect(addrOwner)
        .send(addr2.address, erc20Token1.address, "20000");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Insufficient amount")).to.equal(true);
    }

    // Reject sender is not created
    try {
      await ethBankV2
        .connect(addr4)
        .send(addr2.address, erc20Token1.address, "500");
      fail();
    } catch (error: any) {
      expect(error.message.includes("Sender is not created")).to.equal(true);
    }
  });

  it("Scenario3: paused", async () => {
    const [addrOwner, addr2, addr3] = accounts;

    // Only owner can pause the contract
    try {
      await ethBankV2.connect(addr2).pause();
      fail();
    } catch (error: any) {
      expect(
        error.message.includes("Ownable: caller is not the owner")
      ).to.equal(true);
    }

    // Owner can pause
    await ethBankV2.connect(addrOwner).pause();

    // Check if deposit, transfer, send is paused
    try {
      await erc20Token1.connect(addr2).approve(ethBankV2.address, "1000");
      await ethBankV2.connect(addr2).deposit(erc20Token1.address, "1000");
      fail();
    } catch (e: any) {
      expect(e.message.includes("Transaction is paused")).to.equal(true);
    }

    try {
      await ethBankV2
        .connect(addr2)
        .transfer(addr3.address, erc20Token1.address, "100");
      fail();
    } catch (e: any) {
      expect(e.message.includes("Transaction is paused")).to.equal(true);
    }

    try {
      await ethBankV2
        .connect(addr2)
        .send(addr3.address, erc20Token1.address, "100");
      fail();
    } catch (e: any) {
      expect(e.message.includes("Transaction is paused")).to.equal(true);
    }

    // Check withdraw still available
    await ethBankV2.connect(addrOwner).withdraw(erc20Token1.address, "500");
    expect(
      (
        await ethBankV2.getAccountBalance(
          addrOwner.address,
          erc20Token1.address
        )
      ).toString()
    ).to.equal("0");
    expect(
      (await erc20Token1.balanceOf(addrOwner.address)).toString()
    ).to.equal("10000");
  });

  it("Scenario3: transferOwnership and resume", async () => {
    const [addrOwner, addr2] = accounts;

    await ethBankV2.connect(addrOwner).transferOwnership(addr2.address);

    // Only owner can resume the contract
    try {
      await ethBankV2.connect(addrOwner).resume();
      fail();
    } catch (error: any) {
      expect(
        error.message.includes("Ownable: caller is not the owner")
      ).to.equal(true);
    }

    // Owner can resume
    await ethBankV2.connect(addr2).resume();
  });
});
