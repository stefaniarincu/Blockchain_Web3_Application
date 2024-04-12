// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Rewarder {
    address public admin;
    mapping(address => uint256) public rewards;

    event RewardSent(address indexed recipient, uint256 amount);

    modifier onlyAdmin {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    receive() external payable {}

    function setAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    function rewardWinner(address payable _winner) public onlyAdmin {
        require(rewards[_winner] > 0, "No reward to send");

        uint256 amountToSend = rewards[_winner];
        rewards[_winner] = 0; 
        _winner.transfer(amountToSend);

        emit RewardSent(_winner, amountToSend);
    }

    function addReward(address _recipient, uint256 _amount) public onlyAdmin {
        rewards[_recipient] += _amount;
    }

    function withdrawRemainingBalance() public onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }
}
