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

  describe("Linking another contract", async function () {
    it("Should fail if trying to link a second contract", async function () {
      const [admin, acc1] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      await expect(
        rewarder.sendPrizeToWinner()
      ).to.be.revertedWith("No voting contract linked!");

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      await expect(
        rewarder.linkVotingContract(acc1.address)
      ).to.be.revertedWith("A voting contract has already been linked!");
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

    it("Should fail if the prize is sent twice", async function () {
      const [admin, acc1, acc2, acc3, acc4] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      await expect(
        rewarder.sendPrizeToWinner()
      ).to.be.revertedWith("No voting contract linked!");

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      await voting
        .connect(acc1)
        .candidate(
          "Bob",
          "I am Bob and I will build a blockchain around China"
        );

      await voting
        .connect(acc2)
        .candidate(
          "Alice",
          "I am Alice and I will build a blockchain around the world"
        );

      await expect(
        voting
          .connect(acc2)
          .candidate(
            "Alice",
            "I am Alice and I will build a blockchain around the world"
          )
      ).to.be.revertedWith("You have already candidated!");

      const COST_START = await voting.adminStartVoteCost();
      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.checkVotingCurrentState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started or has ended!");

      await voting.connect(acc3).vote([0]);
      await voting.connect(acc3).vote([1]);
      await expect(voting.connect(acc3).vote([1])).to.be.revertedWith(
        "You have already voted for this candidate!"
      );

      await voting.connect(acc4).vote([0]);
      await voting.connect(acc2).vote([0]);
    
      const COST_STOP = await voting.adminEndVoteCost();
      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.checkVotingCurrentState()) == 2,
        "Voting not stopped"
      ).to.equal(true);

      await expect(
        voting.getWinners()
      ).to.be.revertedWith("Winners have not been updated yet!");

      await voting.updateWinners();

      const winners = await voting.getWinners();

      expect(winners.length == 1, "There should be one winner").to.equal(true);

      expect(winners[0] == 0, "Winner should be Bob").to.equal(true);

      const bobBalance = await ethers.provider.getBalance(acc1.address);
      await rewarder.sendPrizeToWinner();
      const bobBalanceAfterPrize = await ethers.provider.getBalance(
        acc1.address
      );

      expect(
        bobBalanceAfterPrize > bobBalance,
        "Bob should receive prize"
      ).to.equal(true);

      await expect(rewarder.sendPrizeToWinner()).to.be.revertedWith(
        "Prize has already been sent to a winner!"
      );
    });

    it("Should fail if the admin tries to send money to an invalid winner", async function () {
      const [admin, acc1, acc2, acc3, acc4] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      await voting
        .connect(acc1)
        .candidate(
          "Bob",
          "I am Bob and I will build a blockchain around China"
        );

      await voting
        .connect(acc2)
        .candidate(
          "Alice",
          "I am Alice and I will build a blockchain around the world"
        );

      await expect(
        voting
          .connect(acc2)
          .candidate(
            "Alice",
            "I am Alice and I will build a blockchain around the world"
          )
      ).to.be.revertedWith("You have already candidated!");

      const COST_START = await voting.adminStartVoteCost();
      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.checkVotingCurrentState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started or has ended!");

      await voting.connect(acc3).vote([0]);
      await voting.connect(acc3).vote([1]);
      await expect(voting.connect(acc3).vote([1])).to.be.revertedWith(
        "You have already voted for this candidate!"
      );

      await voting.connect(acc4).vote([0]);
      await voting.connect(acc2).vote([0]);
      await voting.connect(acc4).vote([1]);
      await voting.connect(acc1).vote([1]);

      const COST_STOP = await voting.adminEndVoteCost();
      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.checkVotingCurrentState()) == 2,
        "Voting not stopped"
      ).to.equal(true);

      await expect(
        voting.getWinners()
      ).to.be.revertedWith("Winners have not been updated yet!");

      await voting.updateWinners();

      const winners = await voting.getWinners();

      expect(
        (await winners.length) > 1,
        "There should be more than one winner (a tie)"
      ).to.equal(true);

      await expect(rewarder["sendPrizeToWinner(uint256)"](700)).to.be.revertedWith(
        "Candidate ID not found in winners list!"
      );
    });

    it("Should fail if there are multiple winners without a specified recipient", async function () {
      const [admin, acc1, acc2, acc3, acc4] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      await voting
        .connect(acc1)
        .candidate(
          "Bob",
          "I am Bob and I will build a blockchain around China"
        );

      await voting
        .connect(acc2)
        .candidate(
          "Alice",
          "I am Alice and I will build a blockchain around the world"
        );

      await expect(
        voting
          .connect(acc2)
          .candidate(
            "Alice",
            "I am Alice and I will build a blockchain around the world"
          )
      ).to.be.revertedWith("You have already candidated!");

      const COST_START = await voting.adminStartVoteCost();
      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.checkVotingCurrentState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started or has ended!");

      await voting.connect(acc3).vote([0]);
      await voting.connect(acc3).vote([1]);
      await expect(voting.connect(acc3).vote([1])).to.be.revertedWith(
        "You have already voted for this candidate!"
      );

      await voting.connect(acc4).vote([0]);
      await voting.connect(acc2).vote([0]);
      await voting.connect(acc4).vote([1]);
      await voting.connect(acc1).vote([1]);

      const COST_STOP = await voting.adminEndVoteCost();
      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.checkVotingCurrentState()) == 2,
        "Voting not stopped"
      ).to.equal(true);

      await expect(
        voting.getWinners()
      ).to.be.revertedWith("Winners have not been updated yet!");

      await voting.updateWinners();

      const winners = await voting.getWinners();

      expect(
        (await winners.length) > 1,
        "There should be more than one winner (a tie)"
      ).to.equal(true);

      await expect(rewarder["sendPrizeToWinner()"]()).to.be.revertedWith(
        "There are multiple winners! Please specify the winner ID."
      );
    });
  });
});
