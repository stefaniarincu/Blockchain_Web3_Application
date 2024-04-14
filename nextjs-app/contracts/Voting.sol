// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Rewarder.sol";

contract Voting {
    enum VotingState { NotStarted, Started, Ended }

    struct Candidate {
        uint256 candidateId;
        address candidateAddress;
        string name;
        string description;
        uint256 numVotes;
    }

    struct Voter {
        mapping(uint256 => bool) hasVotedFor;
        uint256 numPersonsVoted;
    }

    mapping(address => bool) public hasCandidated;
    mapping(address => Voter) public voters;

    Candidate[] public candidatesList;
    VotingState public currentVotingState;
    uint256 minBalance;

    uint256 public startVotingTimestamp;
    uint256 public stopVotingTimestamp;

    uint256 public adminStartVoteCost = 0.1 ether; // Cost for admin to start voting before the established date
    uint256 public adminEndVoteCost = 0.1 ether;   // Cost for admin to end voting before the established date

    Rewarder public rewarder;

    event SomeoneCandidated(uint256 indexed candidateId, address indexed candidateAddress, string name);
    event SomeoneVoted(address indexed voter, uint256 indexed candidateId);

    event StartVote(uint256 startVotingTimestamp);
    event EndVote(uint256 endVotingTimestamp);

    modifier onlyIfVotingNotStarted {
        require(currentVotingState == VotingState.NotStarted, "Voting has already started or ended!");
        _;
    }

    modifier onlyIfVotingStarted {
        require(currentVotingState == VotingState.Started, "Voting has not started!");
        _;
    }

    modifier onlyIfVotingEnded {
        require(currentVotingState == VotingState.Ended, "Voting has not ended!");
        _;
    }

    modifier onlyAdmin {
        require(msg.sender == rewarder.votingAdmin(), "Only admin can perform this action!");
        _;
    }

    modifier onlyRegularUser {
        require(msg.sender != rewarder.votingAdmin(), "Only regular users can perform this action!");
        _;
    }

    constructor(address payable _rewarderAddress) {
        require(_rewarderAddress != address(0), "Invalid rewarder address!");
        
        rewarder = Rewarder(_rewarderAddress);
        require(rewarder.votingAdmin() == msg.sender, "You must be the owner of the rewarder contract!");

        rewarder.linkVotingContract(payable(address(this)));

        currentVotingState = VotingState.NotStarted;
        startVotingTimestamp = block.timestamp + 2 days;
        stopVotingTimestamp = startVotingTimestamp + 1 days;
    }
    

    // internal function to add funds to the Rewarder
    function addFundsToRewarder() internal onlyAdmin {
        require(address(rewarder) != address(0), "Rewarder contract has not been initialized!");
        require(msg.value > 0, "Amount must be greater than 0!");
        require(rewarder.votingAdmin().balance >= msg.value, "Insufficient balance in Voting contract!");

        rewarder.addFundsForWinner{value: msg.value}();
    }

    function startVoting() public onlyIfVotingNotStarted onlyAdmin payable {
        if (block.timestamp != startVotingTimestamp) {
            require(msg.value >= adminStartVoteCost, "Insufficient payment to start voting early!");
            // addFundsToRewarder(adminStartVoteCost);
            addFundsToRewarder();
        }

        currentVotingState = VotingState.Started;
        startVotingTimestamp = block.timestamp;

        emit StartVote(startVotingTimestamp);
    }

    function endVoting() public onlyIfVotingStarted onlyAdmin payable {
        uint256 halfway = startVotingTimestamp + (stopVotingTimestamp - startVotingTimestamp) / 2;

        if (block.timestamp < halfway || block.timestamp > stopVotingTimestamp) {
            require(msg.value >= adminEndVoteCost, "Insufficient payment to end voting early");
            // addFundsToRewarder(adminEndVoteCost);
            addFundsToRewarder();
        }

        currentVotingState = VotingState.Ended;
        stopVotingTimestamp = block.timestamp;

        emit EndVote(stopVotingTimestamp);
    }

    function addCandidate(string memory _name, string memory _description) public onlyIfVotingNotStarted onlyRegularUser {
        require(!hasCandidated[msg.sender], "You have already candidated!");

        uint256 newCandidateId = candidatesList.length;

        candidatesList.push(Candidate(newCandidateId, msg.sender, _name, _description, 0));
        hasCandidated[msg.sender] = true;
        
        emit SomeoneCandidated(newCandidateId, msg.sender, _name);
    }

    function vote(uint256[] memory _candidateIds) public onlyIfVotingStarted {
        require(_candidateIds.length > 0, "No candidates selected for voting!");

        for (uint256 i = 0; i < _candidateIds.length; i++) {
            uint256 _candidateId = _candidateIds[i];
            require(_candidateId < candidatesList.length, "Invalid candidate ID!");
            require(!voters[msg.sender].hasVotedFor[_candidateId], "You have already voted for this candidate!");

            candidatesList[_candidateId].numVotes++;
            voters[msg.sender].hasVotedFor[_candidateId] = true;
        }

        emit SomeoneVoted(msg.sender, _candidateIds[0]);
    }

    function getWinnerCandidateId() public onlyIfVotingEnded view returns (uint256) {
        uint256 maxVotes = 0;
        uint256 winningCandidateId;

        for (uint256 i = 0; i < candidatesList.length; i++) {
            if (candidatesList[i].numVotes > maxVotes) {
                maxVotes = candidatesList[i].numVotes;
                winningCandidateId = i;
            }
        }

        return winningCandidateId;
    }

    function getWinnerAddress() public onlyIfVotingEnded view returns (address) {
        return candidatesList[getWinnerCandidateId()].candidateAddress;
    }

    receive() external payable {}
}
