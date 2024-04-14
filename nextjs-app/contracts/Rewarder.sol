// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Voting.sol";

contract Rewarder {
    address public votingAdmin;
    Voting public votingContract;
    uint256 public totalPrize;

    event PrizeAdded(uint256 amount);
    event WinnerDeclared(address winner, uint256 prizeAmount);

    constructor() payable {
        require(msg.value > 0, "Cannot initialize reward contract with zero funds!");
        votingAdmin = msg.sender;
        totalPrize = msg.value;
    }

    modifier onlyVotingAdmin {
        require(msg.sender == votingAdmin, "Only voting admin can perform this action!");
        _;
    }

    modifier onlyVotingAdminOrContract {
        require(msg.sender == votingAdmin || msg.sender == address(votingContract), "Only voting admin or voting contract can perform this action!");
        _;
    }

    // Can only be called by a voting contract, which to be created needs
    // to be linked to this rewarder contract
    function linkVotingContract(address payable _votingContract) external {
        require(address(votingContract) == address(0), "A voting contract has already been linked!");
        votingContract = Voting(_votingContract);
    }

    function addFundsForWinner() external payable onlyVotingAdminOrContract {
        require(msg.value > 0, "Cannot add zero funds!");

        totalPrize += msg.value;
        emit PrizeAdded(msg.value);
    }

    function sendPrizeToWinner() external onlyVotingAdmin {
        require(address(votingContract) != address(0), "No voting contract linked!");

        address _winner = votingContract.getWinnerAddress();

        payable(_winner).transfer(totalPrize);
        emit WinnerDeclared(_winner, totalPrize);
    }

    receive() external payable {
        emit PrizeAdded(msg.value);
    }
}
