const { expect } = require("chai");

describe("Rewarder", async function () {
  describe("Deployment", async function () {
    it("Should set the right prize", async function () {
      const [admin] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      expect(
        await rewarder.votingAdmin(),
        "Incorrect voting admin address"
      ).to.equal(admin.address);
      expect(
        await rewarder.totalPrize(),
        "Incorrect total prize amount"
      ).to.equal(INITIAL_PRIZE);
    });

    it("Should fail if the prize is not sent", async function () {
      const Rewarder = await ethers.getContractFactory("Rewarder");
      await expect(Rewarder.deploy()).to.be.revertedWith(
        "Cannot initialize reward contract with zero funds!"
      );
    });
  });

  describe("addFundsForWinner", async function () {
    it("Should add funds to the prize", async function () {
      const INITIAL_PRIZE = 50;
      const ADDITIONAL_PRIZE = 25;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      await rewarder.addFundsForWinner({ value: ADDITIONAL_PRIZE });

      expect(
        await rewarder.totalPrize(),
        "Incorrect total prize amount"
      ).to.equal(INITIAL_PRIZE + ADDITIONAL_PRIZE);
    });

    it("Should fail if the added prize is not sent", async function () {
      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: 50 });

      await expect(rewarder.addFundsForWinner()).to.be.revertedWith(
        "Cannot add zero funds!"
      );
    });

    it("Should fail if the sender is not the voting admin", async function () {
      const [admin, otherAccount] = await ethers.getSigners();
      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: 50 });

      await expect(
        rewarder.connect(otherAccount).addFundsForWinner({ value: 25 })
      ).to.be.revertedWith("Only voting admin or voting contract can perform this action!");
    });
  });

  describe("sendPrizeToWinner", async function () {
    it("Should fail if the voting contract is not linked", async function () {
      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: 50 });

      await expect(
        rewarder.sendPrizeToWinner()
      ).to.be.revertedWith("No voting contract linked!");
    });
  });
});
