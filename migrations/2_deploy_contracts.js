const RedToken = artifacts.require("./RedToken.sol")

module.exports = function (deployer) {
  deployer.deploy(RedToken);
};
