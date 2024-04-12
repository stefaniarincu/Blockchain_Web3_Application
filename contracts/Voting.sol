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
        uint256 gasSpent;
    }

    mapping(address => bool) public hasCandidated; 
    mapping(address => Voter) public voters;

    address public admin;
    Candidate[] public candidateList;
    VotingState public currentState;

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

    modifier onlyRegularUser {
        require(msg.sender != admin, "Only regular users can perform this action!");
        _;
    }

    constructor(address payable _rewarderAddress) payable {
        admin = msg.sender;
        currentState = VotingState.NotStarted;
        startVotingTimestamp = block.timestamp + 2 days;

        rewarder = Rewarder(_rewarderAddress);
        adminPayRewarder(msg.value); 
    }

    function startVoting() public onlyIfVotingNotStarted onlyAdmin payable {
        if (block.timestamp != startVotingTimestamp) {
            require(msg.value >= adminStartVoteCost, "Insufficient payment to start voting early");
            adminPayRewarder(msg.value); 
        }

        currentState = VotingState.Started;
        startVotingTimestamp = block.timestamp;

        emit StartVote(startVotingTimestamp);
    }

    function endVoting() public onlyIfVotingStarted onlyAdmin payable {
        uint256 halfway = startVotingTimestamp + (stopVotingTimestamp - startVotingTimestamp) / 2;

        if (block.timestamp < halfway || block.timestamp > stopVotingTimestamp) {
            require(msg.value >= adminEndVoteCost, "Insufficient payment to end voting early");
            adminPayRewarder(msg.value);
        }

        currentState = VotingState.Ended;
        stopVotingTimestamp = block.timestamp;

        emit EndVote(stopVotingTimestamp);
    }

    function addCandidate(string memory _name, string memory _description) public onlyIfVotingNotStarted onlyRegularUser {
        require(!hasCandidated[msg.sender], "You have already candidated!");

        uint256 newCandidateId = candidateList.length;

        candidateList.push(Candidate(newCandidateId, msg.sender, _name, _description, 0));
        hasCandidated[msg.sender] = true; 
        emit SomeoneCandidated(newCandidateId, msg.sender, _name);
    }

    function vote(uint256[] memory _candidateIds) public onlyIfVotingStarted {
        require(_candidateIds.length > 0, "No candidates selected for voting");

        uint256 totalGasCost = estimateGasCost(_candidateIds);

        require(msg.sender.balance >= totalGasCost, "Insufficient balance to cover gas costs");

        for (uint256 i = 0; i < _candidateIds.length; i++) {
            uint256 _candidateId = _candidateIds[i];
            require(_candidateId < candidateList.length, "Invalid candidate ID");
            require(!voters[msg.sender].hasVotedFor[_candidateId], "You have already voted for this candidate");

            candidateList[_candidateId].numVotes++;
            voters[msg.sender].hasVotedFor[_candidateId] = true;
        }

        emit SomeoneVoted(msg.sender, _candidateIds[0]); 
    }

    function getWinner() public view returns (uint256) {
        uint256 maxVotes = 0;
        uint256 winningCandidateId;

        for (uint256 i = 0; i < candidateList.length; i++) {
            if (candidateList[i].numVotes > maxVotes) {
                maxVotes = candidateList[i].numVotes;
                winningCandidateId = i;
            }
        }

        return winningCandidateId;
    }

    function adminPayRewarder(uint256 _amount) private {
        payable(address(rewarder)).transfer(_amount);
    }

    function setAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    function setAdminStartVoteCost(uint256 _newCost) public onlyAdmin {
        adminStartVoteCost = _newCost;
    }

    function setAdminEndVoteCost(uint256 _newCost) public onlyAdmin {
        adminEndVoteCost = _newCost;
    }

    function setCandidates(uint256 _candidateId, string memory _name, string memory _description) public onlyAdmin {
        require(_candidateId < candidateList.length, "Invalid candidate ID");

        candidateList[_candidateId].name = _name;
        candidateList[_candidateId].description = _description;
    }

    // Function to set the Rewarder contract address
    function setRewarderContract(address payable _rewarderAddress) public onlyAdmin {
        rewarder = Rewarder(_rewarderAddress);
    }

    // Function to transfer any remaining Ether to the admin
    function withdrawRemainingBalance() public onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }

    // Internal function to estimate gas cost for multiple votes
    function estimateGasCost(uint256[] memory _candidateIds) internal view returns (uint256) {
        uint256 totalGasCost = _candidateIds.length * gasleft() * tx.gasprice;
        return totalGasCost;
    }
}
