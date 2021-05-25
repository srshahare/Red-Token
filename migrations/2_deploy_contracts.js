const RedToken = artifacts.require("./RedToken.sol");
const RedTokenSale = artifacts.require("./RedTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(RedToken, 1000000).then(function () {
    // Token price is 0.001 ether
    let tokenPrice = 1000000000000000
    return deployer.deploy(RedTokenSale, RedToken.address, tokenPrice);
  });
};
