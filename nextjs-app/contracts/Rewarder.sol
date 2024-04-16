// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Voting.sol";

contract Rewarder {
    address public votingAdmin;
    Voting public votingContract;
    uint256 public totalPrize;
    address public prizeSentTo;

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

    modifier onlyIfLinked {
        require(address(votingContract) != address(0), "No voting contract linked!");
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

    function _isInWinnersList(uint256[] memory _winners, uint256 _winnerCandidateId) private pure returns (bool) {
        for (uint256 i = 0; i < _winners.length; i++) {
            if (_winners[i] == _winnerCandidateId) {
                return true;
            }
        }
        return false;
    }

    function sendPrizeToWinner(uint256 _winnerCandidateId) public onlyVotingAdmin onlyIfLinked {
        require(prizeSentTo == address(0), "Prize has already been sent to a winner!");

        uint256[] memory winners = votingContract.getWinners();
        address _winner;

        if (winners.length == 1) {
            _winner = votingContract.getWinnerAddress(winners[0]);
        } else {
            require(_isInWinnersList(winners, _winnerCandidateId), "Candidate ID not found in winners list!");
            _winner = votingContract.getWinnerAddress(_winnerCandidateId);
        }

        payable(_winner).transfer(totalPrize);
        
        prizeSentTo = _winner;
        
        emit WinnerDeclared(_winner, totalPrize);
    }

    function sendPrizeToWinner() public onlyVotingAdmin onlyIfLinked {
        require (votingContract.getWinners().length == 1, "There are multiple winners! Please specify the winner ID.");
        
        return sendPrizeToWinner(999);
    }

    receive() external payable {
        emit PrizeAdded(msg.value);
    }
}
