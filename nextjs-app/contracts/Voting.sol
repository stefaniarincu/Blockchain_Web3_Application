// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Rewarder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Voting {
    using Strings for uint256;

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

    function getCandidatesList() public view returns (Candidate[] memory) {
        return candidatesList;
    }

    uint256[] private winnersCandidateIdList = new uint256[](0);
    uint256 minBalance;

    uint256 public startVotingTimestamp;
    uint256 public stopVotingTimestamp;

    uint256 public adminStartVoteCost = 2.1 ether; // Cost for admin to start voting before the established date
    uint256 public adminEndVoteCost = 2.1 ether;   // Cost for admin to end voting before the established date

    Rewarder public rewarder;

    event SomeoneCandidated(uint256 indexed candidateId, address indexed candidateAddress, string name);
    event SomeoneVoted(address indexed voter, uint256 indexed candidateId);

    event StartVote(uint256 startVotingTimestamp);
    event EndVote(uint256 endVotingTimestamp);

    modifier onlyIfVotingNotStarted {
        require(checkVotingCurrentState() == VotingState.NotStarted, "Voting has already started!");
        _;
    }

    modifier onlyIfVotingStarted {
        require(checkVotingCurrentState() == VotingState.Started, "Voting has not started!");
        _;
    }

    modifier onlyIfVotingEnded {
        require(checkVotingCurrentState() == VotingState.Ended, "Voting has not ended!");
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

        startVotingTimestamp = block.timestamp + 2 days;
        stopVotingTimestamp = startVotingTimestamp + 1 days;
    }

    function checkVotingCurrentState() public view returns (VotingState) {
        if (block.timestamp < startVotingTimestamp) {
            return VotingState.NotStarted;
        } else if (block.timestamp < stopVotingTimestamp) {
            return VotingState.Started;
        } else {
            return VotingState.Ended;
        }
    }
    

    // internal function to add funds to the Rewarder
    function addFundsToRewarder() internal onlyAdmin {
        require(address(rewarder) != address(0), "Rewarder contract has not been initialized!");
        require(msg.value > 0, "Amount must be greater than 0!");
        //require(rewarder.votingAdmin().balance >= msg.value, "Insufficient balance in Voting contract!");

        rewarder.addFundsForWinner{value: msg.value}();
    }

    function startVoting() public onlyIfVotingNotStarted onlyAdmin payable {
        if (block.timestamp != startVotingTimestamp) {
            require(msg.value >= adminStartVoteCost, string(abi.encodePacked("Insufficient payment to start voting early! You need at least ", (adminStartVoteCost / 1 ether).toString(), ".", (adminStartVoteCost % 1 ether).toString(), " ethers.")));            
            addFundsToRewarder();
        }

        startVotingTimestamp = block.timestamp;

        emit StartVote(startVotingTimestamp);
    }

    function endVoting() public onlyIfVotingStarted onlyAdmin payable {
        uint256 halfway = startVotingTimestamp + (stopVotingTimestamp - startVotingTimestamp) / 2;

        if (block.timestamp < halfway || block.timestamp > stopVotingTimestamp) {
            require(msg.value >= adminEndVoteCost, string(abi.encodePacked("Insufficient payment to end voting early! You need at least ", (adminEndVoteCost / 1 ether).toString(), ".", (adminEndVoteCost % 1 ether).toString(), " ethers.")));
            addFundsToRewarder();
        }

        stopVotingTimestamp = block.timestamp;

        emit EndVote(stopVotingTimestamp);
    }

    function candidate(string memory _name, string memory _description) public onlyIfVotingNotStarted onlyRegularUser {
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
            require(msg.sender != candidatesList[_candidateId].candidateAddress, "You cannot vote for yourself!");

            candidatesList[_candidateId].numVotes++;
            voters[msg.sender].hasVotedFor[_candidateId] = true;
        }

        emit SomeoneVoted(msg.sender, _candidateIds[0]);
    }

    function getWinners() public onlyIfVotingEnded returns (uint256[] memory) {
        if (winnersCandidateIdList.length == 0){
            uint256 maxVotes = 0;
            uint256 countWinners = 0;

            for (uint256 i = 0; i < candidatesList.length; i++) {
                if (candidatesList[i].numVotes > maxVotes) {
                    maxVotes = candidatesList[i].numVotes;
                    countWinners = 1; 
                } else if (candidatesList[i].numVotes == maxVotes) {
                    countWinners++;
                }
            }

            winnersCandidateIdList = new uint256[](countWinners);
            uint256 currentIndex = 0;

            for (uint256 i = 0; i < candidatesList.length; i++) {
                if (candidatesList[i].numVotes == maxVotes) {
                    winnersCandidateIdList[currentIndex] = i;
                    currentIndex++;
                }
            }
        }

        return winnersCandidateIdList;  
    }

    // for testing purposes only
    function debuggingGetWinners() view public onlyIfVotingEnded returns (uint256[] memory) {
        uint256[] memory _winnersCandidateIdList;

        uint256 maxVotes = 0;
        uint256 countWinners = 0;

        for (uint256 i = 0; i < candidatesList.length; i++) {
            if (candidatesList[i].numVotes > maxVotes) {
                maxVotes = candidatesList[i].numVotes;
                countWinners = 1; 
            } else if (candidatesList[i].numVotes == maxVotes) {
                countWinners++;
            }
        }

        _winnersCandidateIdList = new uint256[](countWinners);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < candidatesList.length; i++) {
            if (candidatesList[i].numVotes == maxVotes) {
                _winnersCandidateIdList[currentIndex] = i;
                currentIndex++;
            }
        }

        return _winnersCandidateIdList;  
    }

    function getWinnerAddress(uint256 _winnerId) public onlyIfVotingEnded view returns (address) {
        return candidatesList[_winnerId].candidateAddress;
    }

    receive() external payable {}
}
