const { expect } = require("chai");

describe("Voting", async function () {
  describe("Deployment", async function () {
    it("Should initialize", async function () {
      const [admin] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
        await rewarder.getAddress()
      );
    });

    it("Should fail if the rewarder has different voting admin", async function () {
      const [admin, otherAccount] = await ethers.getSigners();
      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: 50 });

      const Voting = await ethers.getContractFactory("Voting");
      await expect(
        Voting.connect(otherAccount).deploy(await rewarder.getAddress())
      ).to.be.revertedWith("You must be the owner of the rewarder contract!");
    });
  });

  describe("Start voting", async function () {
    it("Should start voting", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();

      expect(
        (await voting.currentVotingState()) == 0,
        "Voting should be in not started phase"
      ).to.equal(true);

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting not started"
      ).to.equal(true);
    });

    it("Should NOT start voting", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = 2;

      expect(
        (await voting.currentVotingState()) == 0,
        "Voting should be in not started phase"
      ).to.equal(true);

      await expect(
        voting.startVoting({ value: COST_START })
      ).to.be.revertedWith("Insufficient payment to start voting early! You need at least 2.100000000000000000 ethers.");

      expect(
        (await voting.currentVotingState()) == 0,
        "Voting should be in not started phase"
      ).to.equal(true);
    });
  });

  describe("Stop voting", async function () {
    it("Should stop voting", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();
      const COST_STOP = await voting.adminEndVoteCost();

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.currentVotingState()) == 2,
        "Voting not stopped"
      ).to.equal(true);
    });

    it("Should NOT stop voting", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();
      const COST_STOP = 2;

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.endVoting({ value: COST_STOP })
      ).to.be.revertedWith("Insufficient payment to end voting early! You need at least 2.100000000000000000 ethers.");

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);
    });
  });

  describe("Voting Cycle", async function () {
    it("Create candidates", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();

      const [admin, acc1, acc2, acc3] = await ethers.getSigners();

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

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started!");
    });

    it("Voting created candidates", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();

      const [
        admin,
        acc1,
        acc2,
        acc3,
        acc4,
        acc5,
        acc6,
        acc7,
        acc8,
        acc9,
        acc10,
      ] = await ethers.getSigners();

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

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started!");

      await voting.connect(acc3).vote([0]);
      await voting.connect(acc3).vote([1]);
      await expect(voting.connect(acc3).vote([1])).to.be.revertedWith(
        "You have already voted for this candidate!"
      );

      await voting.connect(acc4).vote([0]);
      await voting.connect(acc5).vote([0]);
      await voting.connect(acc6).vote([0]);
      await voting.connect(acc7).vote([1]);
      await voting.connect(acc8).vote([1]);
      await voting.connect(acc9).vote([1]);
      await voting.connect(acc10).vote([1]);

      const COST_STOP = await voting.adminEndVoteCost();

      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.currentVotingState()) == 2,
        "Voting not stopped"
      ).to.equal(true);
    });

    it("Prizing winner", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();

      const [
        admin,
        acc1,
        acc2,
        acc3,
        acc4,
        acc5,
        acc6,
        acc7,
        acc8,
        acc9,
        acc10,
      ] = await ethers.getSigners();

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

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started!");

      await voting.connect(acc3).vote([0]);
      await voting.connect(acc3).vote([1]);
      await expect(voting.connect(acc3).vote([1])).to.be.revertedWith(
        "You have already voted for this candidate!"
      );

      await voting.connect(acc4).vote([0]);
      await voting.connect(acc5).vote([0]);
      await voting.connect(acc6).vote([0]);
      await voting.connect(acc7).vote([1]);
      await voting.connect(acc8).vote([1]);
      await voting.connect(acc9).vote([1]);
      await voting.connect(acc10).vote([1]);

      const COST_STOP = await voting.adminEndVoteCost();

      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.currentVotingState()) == 2,
        "Voting not stopped"
      ).to.equal(true);

      expect(
        (await voting.getWinners()[0]) == 1,
        "Winner should be Alice"
      ).to.equal(true);

      const aliceBalance = await ethers.provider.getBalance(acc2.address);
      await rewarder.sendPrizeToWinner();
      const aliceBalanceAfterPrize = await ethers.provider.getBalance(
        acc2.address
      );

      expect(
        aliceBalanceAfterPrize > aliceBalance,
        "Alice should receive prize"
      ).to.equal(true);
    });

    it("Prizing winner when tie", async function () {
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      const COST_START = await voting.adminStartVoteCost();

      const [
        admin,
        acc1,
        acc2,
        acc3,
        acc4,
        acc5,
        acc6,
        acc7,
        acc8,
        acc9,
        acc10,
      ] = await ethers.getSigners();

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

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.currentVotingState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started!");

      await voting.connect(acc3).vote([0]);
      await voting.connect(acc3).vote([1]);
      await expect(voting.connect(acc3).vote([1])).to.be.revertedWith(
        "You have already voted for this candidate!"
      );

      await voting.connect(acc4).vote([0]);
      await voting.connect(acc5).vote([0]);
      await voting.connect(acc6).vote([0]);
      await voting.connect(acc2).vote([0]);
      await voting.connect(acc7).vote([1]);
      await voting.connect(acc8).vote([1]);
      await voting.connect(acc9).vote([1]);
      await voting.connect(acc10).vote([1]);

      const COST_STOP = await voting.adminEndVoteCost();

      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.currentVotingState()) == 2,
        "Voting not stopped"
      ).to.equal(true);

      expect(
        (await voting.getWinners().length) > 1,
        "There should be more winners (a tie)"
      ).to.equal(true);

      /*
      const aliceBalance = await ethers.provider.getBalance(acc2.address);
      await rewarder.sendPrizeToWinner();
      const aliceBalanceAfterPrize = await ethers.provider.getBalance(
        acc2.address
      );

      expect(
        aliceBalanceAfterPrize > aliceBalance,
        "Alice should receive prize"
      ).to.equal(true);
      */
    });
  });
});
