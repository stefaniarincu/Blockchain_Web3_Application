const hre = require("hardhat");

async function deploy() {
  const INITIAL_PRIZE = ethers.parseEther("50");

  const Rewarder = await ethers.getContractFactory("Rewarder");
  const rewarder = await Rewarder.deploy({ value: INITIAL_PRIZE });

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(await rewarder.getAddress());

  console.log(
    "Rewarder contract deployed to:",
    await rewarder.getAddress()
  );
  console.log("Voting contract deployed to:", await voting.getAddress());
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
