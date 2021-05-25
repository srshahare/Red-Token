// SPDX-License-Identifier: MIT

pragma solidity >= 0.4.2;

import "./RedToken.sol";

contract RedTokenSale {
    address admin;
    RedToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(RedToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    //multiply
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y)/y == x);
    }

    //Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
           //Require that value is equal to tokens
            require(msg.value == multiply(_numberOfTokens, tokenPrice));
            //Require that the contract has enough tokens
            require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
            //Require that a transfer is successful
            require(tokenContract.transfer(msg.sender, _numberOfTokens));
            //Keep track of token sold
            tokensSold += _numberOfTokens;
            //Trigger sell event
            emit Sell(msg.sender, _numberOfTokens);
    }

    //Ending Token RedToken
    function endSale() public {
        // Require admin
        require(msg.sender == admin);
        // Transfer remaining red tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // Destroy contract
        // selfdestruct(address(uint160(msg.sender)));
    }
}