const hre = require("hardhat");

async function interact() {
    const votingContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" //completat dupa deploy
    const votingContract = await hre.ethers.getContractAt("Voting", votingContractAddress)

    let initialFunds = 20;

    const rewarderContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" //completat dupa deploy
    const rewarderContract = await hre.ethers.getContractAt("Rewarder", rewarderContractAddress)

    await rewarderContract.initializeRewarder(votingContractAddress);
    await votingContract.initializeRewarder(rewarderContractAddress, initialFunds);
}

interact()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });