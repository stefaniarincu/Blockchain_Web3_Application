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
      const [admin, acc1, acc2] = await ethers.getSigners();
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

      const COST_START = await voting.adminStartVoteCost();

      expect(
        (await voting.checkVotingCurrentState()) == 0,
        "Voting should be in not started phase"
      ).to.equal(true);

      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.checkVotingCurrentState()) == 1,
        "Voting not started"
      ).to.equal(true);
    });

    it("Should NOT start voting", async function () {
      const [admin, acc1, acc2] = await ethers.getSigners();
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

      const COST_START = 2;

      expect(
        (await voting.checkVotingCurrentState()) == 0,
        "Voting should be in not started phase"
      ).to.equal(true);

      await expect(
        voting.startVoting({ value: COST_START })
      ).to.be.revertedWith(
        "Insufficient payment to start voting early! You need at least 2.100000000000000000 ethers."
      );

      expect(
        (await voting.checkVotingCurrentState()) == 0,
        "Voting should be in not started phase"
      ).to.equal(true);
    });
  });

  describe("Stop voting", async function () {
    it("Should stop voting", async function () {
      const [admin, acc1, acc2] = await ethers.getSigners();
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

      const COST_START = await voting.adminStartVoteCost();
      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.checkVotingCurrentState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      const COST_STOP = await voting.adminEndVoteCost();
      await voting.endVoting({ value: COST_STOP });

      expect(
        await voting.checkVotingCurrentState(),
        "Voting not stopped"
      ).to.equal(2);
    });

    it("Should NOT stop voting", async function () {
      const [admin, acc1, acc2] = await ethers.getSigners();
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

      const COST_START = await voting.adminStartVoteCost();
      await voting.startVoting({ value: COST_START });

      expect(
        (await voting.checkVotingCurrentState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      const COST_STOP = 2;
      await expect(voting.endVoting({ value: COST_STOP })).to.be.revertedWith(
        "Insufficient payment to end voting early! You need at least 2.100000000000000000 ethers."
      );

      expect(
        (await voting.checkVotingCurrentState()) == 1,
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
        (await voting.checkVotingCurrentState()) == 1,
        "Voting should be in started phase"
      ).to.equal(true);

      await expect(
        voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
      ).to.be.revertedWith("Voting has already started or has ended!");
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
      await voting.connect(acc5).vote([0]);
      await voting.connect(acc6).vote([0]);
      await voting.connect(acc7).vote([1]);
      await voting.connect(acc8).vote([1]);
      await voting.connect(acc9).vote([1]);
      await voting.connect(acc10).vote([1]);

      const COST_STOP = await voting.adminEndVoteCost();
      await voting.endVoting({ value: COST_STOP });

      expect(
        (await voting.checkVotingCurrentState()) == 2,
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
      await voting.connect(acc5).vote([0]);
      await voting.connect(acc6).vote([0]);
      await voting.connect(acc7).vote([1]);
      await voting.connect(acc8).vote([1]);
      await voting.connect(acc9).vote([1]);
      await voting.connect(acc10).vote([1]);

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

      expect(winners[0] == 1, "Winner should be Alice").to.equal(true);

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

      const bobBalance = await ethers.provider.getBalance(acc1.address);
      await rewarder["sendPrizeToWinner(uint256)"](winners[0]);
      const bobBalanceAfterPrize = await ethers.provider.getBalance(
        acc1.address
      );

      expect(
        bobBalanceAfterPrize > bobBalance,
        "Bob should receive prize"
      ).to.equal(true);
    });

    it("Prizing fail when tie", async function () {
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
  });
});