const { expect } = require("chai");

describe("Security", async function () {
  describe("Security of candidature process", async function () {
    it("Should fail if admin attempts to candidate", async function () {
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

    it("Should fail if an user attempts to candidate twice", async function () {
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
    it("Should fail if attempting to start the voting process without a minimum of two candidates", async function () {
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

    it("Should fail if regular users attempt to start the voting process", async function () {
        const [admin, acc1] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;
  
        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });
  
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());
  
        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
          await rewarder.getAddress()
        );

        const COST_START = await voting.adminStartVoteCost();
        await expect(
            voting.connect(acc1).startVoting({ value: COST_START })
        ).to.be.revertedWith("Only admin can perform this action!");
    });

    it("Should fail if a user votes for themselves", async function () {
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

    it("Should fail if users attempt to vote for a candidate that does not exist", async function () {
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

    it("Should fail if users attempt to send an empty vote", async function () {
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

    it("Should fail if users attempt to vote for a candidate more than once", async function () {
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

    it("Should fail if regular users attempt to end the voting process", async function () {
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

        const COST_STOP = await voting.adminEndVoteCost();
        await expect(
            voting.connect(acc1).endVoting({ value: COST_STOP })
        ).to.be.revertedWith("Only admin can perform this action!");
    });
  });

  describe("Actions don't respect start/end vote", async function () {
    it("Should fail if users attempt to vote when the voting process has not started", async function () {
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

    it("Should fail if users attempt to become a candidate after the voting has started", async function () {
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

    it("Should fail if users attempt to become a candidate after the voting has ended", async function () {
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

    it("Should fail if users attempt to vote after the voting has ended", async function () {
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
    it("Should fail if a regular user attempts to send the prize", async function () {
        const [admin, acc1, acc2, acc3] = await ethers.getSigners();
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
  
        await expect(
          rewarder.connect(acc1).sendPrizeToWinner()
        ).to.be.revertedWith("Only voting admin can perform this action!");
    });

    it("Should fail if a regular user attempts to update the winners", async function () {
        const [admin, acc1, acc2, acc3] = await ethers.getSigners();
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
    
        await expect(
          voting.connect(acc1).updateWinners()
        ).to.be.revertedWith("Only admin can perform this action!");
    });

    it("Should fail to retrieve winners if the voting process has not ended", async function () {
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

    it("Should fail to update winners if the voting process has not ended", async function () {
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

    it("Should fail to retrieve winners if they have not been updated", async function () {
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