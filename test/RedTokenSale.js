const RedTokenSale = artifacts.require("./RedTokenSale.sol");
const RedToken = artifacts.require("./RedToken.sol");

contract("RedTokenSale", function (accounts) {
  let tokenInstance;
  let tokenSaleInstance;
  let admin = accounts[0];
  let buyer = accounts[1];
  let tokenPrice = 1000000000000000; //in wei
  let tokensAvailable = 750000;
  let numberOfTokens;

  it("initializes the contract with correct values", function () {
    return RedTokenSale.deployed()
      .then(function (instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then(function (price) {
        assert.equal(price, tokenPrice, "token price is correct");
      });
  });

  it("facilitates token buying", function () {
    return RedToken.deployed()
      .then(function (instance) {
        //Grab token instance first
        tokenInstance = instance;
        return RedTokenSale.deployed();
      })
      .then(function (instance) {
        // Then grab token sale instance
        tokenSaleInstance = instance;
        // Provision 75% of all tokens to the token sale
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvailable,
          { from: admin }
        );
      })
      .then(function (receipt) {
        numberOfTokens = 10;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(receipt.logs[0].event, "Sell", "should be the Sell event");
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account that purchased the tokens"
        );
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then(function (amount) {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increment the number of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), numberOfTokens);
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        //Try to buy tokens different from the ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must be equal number of tokens in wei"
        );
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must be equal number of tokens in wei"
        );
      });
  });

  it("ends token sale", function () {
    return RedToken.deployed()
      .then(function (instance) {
        //Grab token instance first
        tokenInstance = instance;
        return RedTokenSale.deployed();
      })
      .then(function (instance) {
        // Then grab token sale instance
        tokenSaleInstance = instance;
        // Try to end the sale from other account other than admin
        return tokenSaleInstance.endSale({ from: buyer });       
      }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, "must be admin")
          //End sale as admin
          return tokenSaleInstance.endSale({ from: admin })
      }).then(function(receipt) {
          return tokenInstance.balanceOf(admin)
      }).then(function(balance) {
          assert.equal(balance.toNumber(), 999990, 'returns all unsold red tokens to admin')
          //check the token price was reset when selfdestruct was called
          return tokenSaleInstance.tokenPrice()
      }).then(function(price) {
        //   assert.equal(price.toNumber(), 0, 'token price was reset')
      })
  });
});
