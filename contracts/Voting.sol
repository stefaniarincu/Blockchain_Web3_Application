// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Voting {
    enum VotingState { NotStarted, Started, Ended } 

    struct Candidate {
        address candidateAddress;
        string name;
        string description;
        uint256 numVotes;   
    }

    struct Voter {
        mapping(uint256 => bool) hasVoted;        
        uint256 gasSpent;
    }

    mapping(address => Voter) public voters;

    address public admin;
    Candidate[] public candidateList;
    VotingState public currentState;

    event SomeoneCandidated(address indexed candidateAddress, string name);
    event SomeoneVoted(address indexed voter, uint256 indexed candidateId);

    event StartVote();
    event EndVote();

    modifier onlyIfVotingNotStarted {
        require(currentState == VotingState.NotStarted, "Voting has already started or ended!");
        _;
    }

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

    function startVoting() public onlyIfVotingNotStarted onlyAdmin {
        currentState = VotingState.Started;
        emit StartVote();
    }

    function endVoting() public onlyIfVotingStarted onlyAdmin {
        currentState = VotingState.Ended;
        emit EndVote();
    }

    function addCandidate(string memory _name, string memory _description) public onlyIfVotingNotStarted {
        candidateList.push(Candidate(msg.sender, _name, _description, 0));
		emit SomeoneCandidated(msg.sender, _name);
    }
}