const { expect } = require("chai");

describe("Security", async function () {
  describe("Security of candidature process", async function () {
    it("Only regular users should candidate", async function () {
      const [admin] = await ethers.getSigners();
      const INITIAL_PRIZE = 50;

      const Rewarder = await ethers.getContractFactory("Rewarder");
      const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy(await rewarder.getAddress());

      expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
        await rewarder.getAddress()
      );

      await expect(
        voting
            .connect(admin)
            .candidate(
                "Admin",
                "I am the admin of the blockchain and I want to candidate"
            )
        ).to.be.revertedWith("Only regular users can perform this action!");
    });

    it("Users should not candidate twice", async function () {
        const [admin, acc1] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

        await voting
            .connect(acc1)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        await expect(
            voting
            .connect(acc1)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            )
        ).to.be.revertedWith("You have already candidated!");
      });          
  });

  describe("Security of voting process", async function () {
    it("Voting process should not start without at least two candidates", async function () {
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

        const COST_START = await voting.adminStartVoteCost();
        await expect(voting.startVoting({ value: COST_START })).to.be.revertedWith(
            "Cannot start voting with less than two candidates!"
        );
    });

    it("Users should not vote for themselves", async function () {
        const [admin, acc1, acc2] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;

        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());

        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
            await rewarder.getAddress()
        );

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

        await expect(voting.connect(acc1).vote([0])).to.be.revertedWith(
            "You cannot vote for yourself!"
        );
    });

    it("Users should not vote for a candidate that does not exist", async function () {
        const [admin, acc1, acc2] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );
  
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

        await expect(voting.connect(acc1).vote([1000])).to.be.revertedWith(
            "Invalid candidate ID!"
        );
    });

    it("Users should not send an empty vote", async function () {
        const [admin, acc1, acc2] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );
  
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

        await expect(voting.connect(acc1).vote([])).to.be.revertedWith(
            "No candidates selected for voting!"
        );
    });

    it("Users cannot vote for a candidate twice", async function () {
        const [admin, acc1, acc2, acc3] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );
  
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

        await voting.connect(acc3).vote([0]);

        await expect(voting.connect(acc3).vote([0])).to.be.revertedWith(
            "You have already voted for this candidate!"
        );
    });
  });

  describe("Actions don't respect start/end vote", async function () {
    it("Cannot vote if voting has not started", async function () {
        const [admin, acc1] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );
  
        await voting
            .connect(acc1)
            .candidate(
                "Bob",
                "I am Bob and I will build a blockchain around China"
            );

        await expect(voting.connect(acc1).vote([0])).to.be.revertedWith(
            "Voting has not started or has already ended!"
        );
    });

    it("Cannot candidate after voting has started", async function () {
        const [admin, acc1, acc2, acc3] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

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
  
        await expect(
            voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
        ).to.be.revertedWith("Voting has already started or has ended!");
    });

    it("Cannot candidate after voting has ended", async function () {
        const [admin, acc1, acc2, acc3] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

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

        const COST_STOP = await voting.adminEndVoteCost();
        await voting.endVoting({ value: COST_STOP });
  
        await expect(
            voting.connect(acc3).candidate("Eve", "I am Eve and I will hack")
        ).to.be.revertedWith("Voting has already started or has ended!");
    });

    it("Cannot vote after voting has ended", async function () {
        const [admin, acc1, acc2, acc3] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

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

        const COST_STOP = await voting.adminEndVoteCost();
        await voting.endVoting({ value: COST_STOP });
  
        await expect(
            voting.connect(acc3).vote([0])
        ).to.be.revertedWith("Voting has not started or has already ended!");
    });
  });

  describe("Security of rewarding process", async function () {
    it("Cannot get winners if voting process has not ended", async function () {
        const [admin, acc1, acc2] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

        await voting
            .connect(acc1)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        await voting
            .connect(acc2)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        const COST_START = await voting.adminStartVoteCost();
        await voting.startVoting({ value: COST_START });

        await expect(
            voting.getWinners()
        ).to.be.revertedWith("Voting has not ended!");
    }); 

    it("Cannot update winners if voting process has not ended", async function () {
        const [admin, acc1, acc2] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

        await voting
            .connect(acc1)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        await voting
            .connect(acc2)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        const COST_START = await voting.adminStartVoteCost();
        await voting.startVoting({ value: COST_START });

        await expect(
            voting.updateWinners()
        ).to.be.revertedWith("Voting has not ended!");
    });

    it("Cannot get winners if they were not updated", async function () {
        const [admin, acc1, acc2] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

        await voting
            .connect(acc1)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        await voting
            .connect(acc2)
            .candidate(
                "Alice",
                "I am Alice and I will build a blockchain around the world"
            );

        const COST_START = await voting.adminStartVoteCost();
        await voting.startVoting({ value: COST_START });

        const COST_STOP = await voting.adminEndVoteCost();
        await voting.endVoting({ value: COST_STOP });

        await expect(
            voting.getWinners()
        ).to.be.revertedWith("Winners have not been updated yet!");
    });
  });
});