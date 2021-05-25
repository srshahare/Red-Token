// SPDX-License-Identifier: MIT

pragma solidity >= 0.4.2;

import "./RedToken.sol";

contract RedTokenSale {
    address admin;
    RedToken public tokenContract;
    uint256 public tokenPrice;

    constructor(RedToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
}