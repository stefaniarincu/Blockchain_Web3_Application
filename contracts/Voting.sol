// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Voting {
    enum VotingState { Started, Ended } 

    struct Candidate {
        string name;
        uint256 numVotes;
        address candidateAddress;
    }

    struct Voter {
        mapping(uint256 => bool) hasVoted;        
        uint candidateId;
        uint256 gasSpent;
    }

    mapping(address => Voter) public voters;

    address public admin;
    Candidate[] public candidateList;
    VotingState public currentState;

    event SomeoneVoted(address indexed voter, uint indexed candidateId);
    event SomeoneCandidated(address indexed candidate, string name);

    modifier onlyIfVotingStarted {
        require(currentState == VotingState.Started, "Voting has not started!");
        _;
    }

    modifier onlyIfVotingEnded {
        require(currentState == VotingState.Ended, "Voting has not ended!");
        _;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "Only admin can perform this action!");
        _;
    }

    
}