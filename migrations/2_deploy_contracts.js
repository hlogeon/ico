var SafeMath = artifacts.require('./SafeMath.sol');
var UTTToken = artifacts.require("./UTTToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, UTTToken);
  deployer.deploy(UTTToken);
};
