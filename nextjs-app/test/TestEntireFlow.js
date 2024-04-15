const { expect } = require("chai");

describe("Test entire flow", async function () {
    it("Test entire application flow", async function () {
        const [admin, acc1, acc2, acc3, acc4, acc5, acc6, acc7] = await ethers.getSigners();
        const INITIAL_PRIZE = 50;

        const Rewarder = await ethers.getContractFactory("Rewarder");
        const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(await rewarder.getAddress());

        expect(await voting.rewarder(), "Incorrect rewarder address").to.equal(
            await rewarder.getAddress()
        );

        const COST_START_FAIL = 2;

        expect(
            (await voting.checkVotingCurrentState()) == 0,
            "Voting should be in not started phase"
        ).to.equal(true);

        await expect(voting.startVoting({ value: COST_START_FAIL })).to.be.revertedWith(
            "Cannot start voting with less than two candidates!"
        );

        expect(
            (await voting.checkVotingCurrentState()) == 0,
            "Voting should be in not started phase"
        ).to.equal(true);

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
            voting.startVoting({ value: COST_START_FAIL })
            ).to.be.revertedWith("Insufficient payment to start voting early! You need at least 2.100000000000000000 ethers."
        );

        expect(
            (await voting.checkVotingCurrentState()) == 0,
            "Voting should be in not started phase"
        ).to.equal(true);

        await voting
            .connect(acc3)
            .candidate(
                "Oscar",
                "I am Oscar and I will build a blockchain around here"
            );

        await expect(
            voting
                .connect(acc2)
                .candidate(
                    "Alice",
                    "I am Alice and I will build a blockchain around the world"
                )
            ).to.be.revertedWith("You have already candidated!");

        await expect(
            voting
                .connect(admin)
                .candidate(
                    "Admin",
                    "I am the admin of the blockchain and I want to candidate"
                )
            ).to.be.revertedWith("Only regular users can perform this action!");

        await expect(voting.connect(acc1).vote([0])).to.be.revertedWith(
            "Voting has not started or has already ended!");

        const COST_START = await voting.adminStartVoteCost();
        await voting.startVoting({ value: COST_START });

        expect(
            (await voting.checkVotingCurrentState()) == 1,
            "Voting not started"
        ).to.equal(true); 
        
        await expect(
            voting.connect(acc4).candidate("Eve", "I am Eve and I will hack")
        ).to.be.revertedWith("Voting has already started or has ended!");
    
        await voting.connect(acc4).vote([0]);
        await voting.connect(acc4).vote([1]);
        
        await expect(voting.connect(acc4).vote([1])).to.be.revertedWith(
            "You have already voted for this candidate!"
        );

        await expect(voting.connect(acc1).vote([0])).to.be.revertedWith(
            "You cannot vote for yourself!"
        );

        await expect(voting.connect(acc1).vote([1000])).to.be.revertedWith(
            "Invalid candidate ID!"
        );

        await expect(voting.connect(acc1).vote([])).to.be.revertedWith(
            "No candidates selected for voting!"
        );
    
        await voting.connect(acc7).vote([0]);
        await voting.connect(acc5).vote([0]);
        await voting.connect(acc6).vote([0]);
        await voting.connect(acc2).vote([0]);
        await voting.connect(acc1).vote([2]);
        await voting.connect(acc7).vote([1]);
        await voting.connect(acc1).vote([1]);
        await voting.connect(acc5).vote([1]);
        await voting.connect(acc7).vote([2]);

        await expect(
            voting.debuggingGetWinners()
        ).to.be.revertedWith("Voting has not ended!");

        expect(
            (await voting.checkVotingCurrentState()) == 1,
            "Voting should be in started phase"
        ).to.equal(true);

        const COST_STOP_FAIL = 2;
        await expect(voting.endVoting({ value: COST_STOP_FAIL })).to.be.revertedWith(
            "Insufficient payment to end voting early! You need at least 2.100000000000000000 ethers."
        );

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

        await expect(
            voting.connect(acc7).candidate("Mario", "I am Mario and I will build a blockchain somewhere")
        ).to.be.revertedWith("Voting has already started or has ended!");

        await expect(
            voting.connect(acc3).vote([0])
        ).to.be.revertedWith("Voting has not started or has already ended!");

        const winners = await voting.debuggingGetWinners();

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
    });
});
