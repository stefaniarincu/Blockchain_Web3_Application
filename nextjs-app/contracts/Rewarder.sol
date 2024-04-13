// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Rewarder {
    address public votingAdmin;
    address public votingContract;
    uint256 public totalPrize;

    event PrizeAdded(uint256 amount);
    event WinnerDeclared(address winner, uint256 prizeAmount);

    modifier onlyVotingAdmin {
        // require(msg.sender == votingAdmin, "Only voting admin can perform this action!");
        _;
    }

    function initializeRewarder(address _votingContract, address _votingAdmin) external {
        require(votingAdmin == address(0), "Reward contract has already been initialized!");
        votingContract = _votingContract;
        votingAdmin = _votingAdmin;
        totalPrize = 0;
    }

    function addFundsForWinner() external payable {
        // require(msg.value > 0, "Cannot add zero funds!");

        // totalPrize += msg.value;
        // emit PrizeAdded(msg.value);
    }

    function sendPrizeToWinner(address _winner) external onlyVotingAdmin {
        require(totalPrize > 0, "No prize available to be awarded!");
        require(_winner != address(0), "Invalid winner address!");

        payable(_winner).transfer(totalPrize);
        emit WinnerDeclared(_winner, totalPrize);
    }

    receive() external payable {
        emit PrizeAdded(msg.value);
    }
}
