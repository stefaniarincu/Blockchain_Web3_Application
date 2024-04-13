const hre = require("hardhat");

async function deploy() {
  const votingFactory = await hre.ethers.getContractFactory("Voting");
  const votingContract = await votingFactory.deploy();

  await votingContract.waitForDeployment();

  console.log("Voting contract deployed to:", await votingContract.getAddress());

  const rewarderFactory = await hre.ethers.getContractFactory("Rewarder");
  const rewarderContract = await rewarderFactory.deploy();

  await rewarderContract.waitForDeployment();

  console.log("Rewarder contract deployed to:", await rewarderContract.getAddress());
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
